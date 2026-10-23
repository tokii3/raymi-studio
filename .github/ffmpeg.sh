#!/usr/bin/env bash
# ffmpeg + ffprobe on a runner without hanging the job (2026-10-23: apt-get sat silent for 28 min twice, stills never ran).
# 1) apt with timeouts + retries, the whole step capped at 4 min; 2) else a static build (johnvansickle.com, amd64).
set -u
if command -v ffmpeg >/dev/null && command -v ffprobe >/dev/null; then exit 0; fi
APT="-o Acquire::Retries=3 -o Acquire::http::Timeout=20 -o Acquire::https::Timeout=20"
if timeout 240 bash -c "sudo apt-get $APT update -qq && sudo apt-get $APT install -y -qq ffmpeg > /dev/null"; then
  exit 0
fi
echo "::warning::apt-get failed or hung - using a static ffmpeg build"
d=$(mktemp -d)
curl -fsSL --retry 3 --max-time 180 -o "$d/ff.tar.xz" https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz
tar -xJf "$d/ff.tar.xz" -C "$d"
sudo mkdir -p /opt/ffmpeg && sudo cp "$d"/ffmpeg-*-static/ffmpeg "$d"/ffmpeg-*-static/ffprobe /opt/ffmpeg/
# the static ffmpeg reads the job's stdin and waits on it forever (2026-10-23: the tests hung 19 min) - never let it
printf '#!/bin/sh\nexec /opt/ffmpeg/ffmpeg -nostdin "$@" < /dev/null\n' | sudo tee /usr/local/bin/ffmpeg > /dev/null
printf '#!/bin/sh\nexec /opt/ffmpeg/ffprobe "$@" < /dev/null\n' | sudo tee /usr/local/bin/ffprobe > /dev/null
sudo chmod +x /usr/local/bin/ffmpeg /usr/local/bin/ffprobe
ffmpeg -version | head -1
