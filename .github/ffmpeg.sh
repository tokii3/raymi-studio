#!/usr/bin/env bash
# ffmpeg + ffprobe on a runner without hanging the job (2026-10-23: apt-get sat silent for 28 min twice, stills never ran;
# the johnvansickle static build then hung the tests even with -nostdin).
# 1) apt (timeouts + retries, 3 min); 2) apt again through archive.ubuntu.com (the Azure mirror was the one hanging);
# 3) only then a static build (BtbN, GitHub releases).
set -u
if command -v ffmpeg >/dev/null && command -v ffprobe >/dev/null; then exit 0; fi
APT="-o Acquire::Retries=3 -o Acquire::http::Timeout=20 -o Acquire::https::Timeout=20"
try_apt() { timeout 180 bash -c "sudo apt-get $APT update -qq && sudo apt-get $APT install -y -qq ffmpeg > /dev/null"; }
if try_apt; then exit 0; fi
echo "::warning::apt-get via the default mirror failed or hung - trying archive.ubuntu.com"
sudo sed -i 's#http://azure.archive.ubuntu.com#http://archive.ubuntu.com#g' /etc/apt/sources.list /etc/apt/sources.list.d/*.sources 2>/dev/null || true
if try_apt; then exit 0; fi
echo "::warning::apt-get failed twice - using a static ffmpeg build (BtbN)"
d=$(mktemp -d)
curl -fsSL --retry 3 --max-time 240 -o "$d/ff.tar.xz" https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz
tar -xJf "$d/ff.tar.xz" -C "$d"
sudo mkdir -p /opt/ffmpeg && sudo cp "$d"/ffmpeg-*/bin/ffmpeg "$d"/ffmpeg-*/bin/ffprobe /opt/ffmpeg/
printf '#!/bin/sh\nexec /opt/ffmpeg/ffmpeg -nostdin "$@" < /dev/null\n' | sudo tee /usr/local/bin/ffmpeg > /dev/null
printf '#!/bin/sh\nexec /opt/ffmpeg/ffprobe "$@" < /dev/null\n' | sudo tee /usr/local/bin/ffprobe > /dev/null
sudo chmod +x /usr/local/bin/ffmpeg /usr/local/bin/ffprobe
ffmpeg -version | head -1
