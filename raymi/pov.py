"""Timing check of a talking 3D Short (kind pov): every cut, line, sound and stamp against the MEASURED data.

The script-critic blocked all seven POV Shorts of 2026-10-23 (round 1) on timing written by hand: cuts beside the
bed's beats, takes overlapping, a word cue half a second early. This makes the check a tool, run before any critic:
`python -m raymi pov <job>` prints the measured timing table (paste it into 4_SCRIPT.md) and exits 1 on a fault.

Rules (series dossier knowledge/studies/pov_shorts_series_2026-10.md):
- a cut lands one frame before a beat or hit of the bed map (tolerance half a frame), shot 1 starts at the window start
- no two takes overlap (words, not the take's trailing silence); every take ends before the window end
- the hook stamp holds until the first take's last word; the CTA stamp is on screen >= 2.5 s before the end and the
  CTA take starts at or after it
- sfx land on a beat / hit (warning only: a tap may sit off the grid on purpose)
"""
from __future__ import annotations

import json
from pathlib import Path

from . import voice_lines as VL

FRAME = 1 / 30


def _grid(smap: dict) -> list[float]:
    return sorted(set(smap.get("beats", [])) | set(smap.get("hits", [])))


def _near(t: float, grid: list[float]) -> tuple[float, float]:
    g = min(grid, key=lambda x: abs(x - t)) if grid else t
    return g, t - g


def check(job: Path) -> tuple[list[str], list[str], list[str]]:
    """-> (table lines, errors, warnings)."""
    spec = json.loads((job / "shots.json").read_text(encoding="utf-8"))
    smap = json.loads((job / spec["song_map"]).read_text(encoding="utf-8")) if spec.get("song_map") else {}
    grid = _grid(smap)
    t0, t1 = float(spec["audio"]["from"]), float(spec["audio"]["to"])
    errors: list[str] = []
    warns: list[str] = []
    takes = VL.load_takes(job, spec, errors)
    lines = ["| event | time (s) | measured anchor | ok |", "|---|---|---|---|"]
    starts = [float(s["at"]) for s in spec.get("shots", [])]
    for i, a in enumerate(starts):
        if i == 0:
            ok = abs(a - t0) < 1e-6
            lines.append(f"| shot 1 start | {a:.3f} | window start {t0:.3f} | {'yes' if ok else 'NO'} |")
            if not ok:
                errors.append("shot 1 must start at the window start")
            continue
        g, d = _near(a + FRAME, grid)
        ok = abs(d) <= FRAME / 2
        lines.append(f"| cut into shot {i + 1} | {a:.3f} | beat {g:.3f} - 1 frame ({d * 1000:+.0f} ms) | {'yes' if ok else 'NO'} |")
        if not ok:
            errors.append(f"cut into shot {i + 1} at {a:.3f} s is not one frame before a beat / hit (nearest {g:.3f})")
    for tk in takes:
        w0 = tk["at"] + tk["words"][0]["start"]
        w1 = tk["at"] + tk["words"][-1]["end"]
        marks = ", ".join(f"'{w['w']}' {tk['at'] + w['start']:.2f}" for w in tk["words"])
        lines.append(f"| voice '{tk['text']}' | {tk['at']:.3f} | words {w0:.2f}-{w1:.2f}: {marks} | "
                     f"{'yes' if w1 <= t1 else 'NO'} |")
        if w1 > t1:
            errors.append(f"voice '{tk['text']}' ends at {w1:.2f} s, after the window end {t1:.2f}")
    for s in spec.get("sfx", []):
        g, d = _near(float(s["at"]), grid)
        ok = abs(d) <= FRAME
        lines.append(f"| sfx {s['kind']} | {float(s['at']):.3f} | beat {g:.3f} ({d * 1000:+.0f} ms) | {'yes' if ok else 'off grid'} |")
        if not ok and not s.get("off_grid"):
            warns.append(f"sfx {s['kind']} at {float(s['at']):.2f} s is off the beat grid (nearest {g:.3f}); "
                         f"say why with \"off_grid\": \"<reason>\"")
    sh = spec.get("short") or {}
    if takes and sh.get("hook"):
        first_end = takes[0]["at"] + takes[0]["words"][-1]["end"]
        hook_to = float(sh.get("hook_to", t0 + 2.43))
        ok = hook_to >= first_end - 0.05
        lines.append(f"| hook stamp '{sh['hook']}' | {t0:.2f}-{hook_to:.2f} | first line ends {first_end:.2f} | {'yes' if ok else 'NO'} |")
        if not ok:
            errors.append(f"hook stamp ends at {hook_to:.2f} s before the hook line ends ({first_end:.2f})")
    if sh.get("cta"):
        cf = float(sh["cta_from"])
        ok = t1 - cf >= 2.5 - 1e-6
        lines.append(f"| CTA stamp '{sh['cta']}' | {cf:.2f}-{t1:.2f} | {t1 - cf:.2f} s on screen | {'yes' if ok else 'NO'} |")
        if not ok:
            errors.append(f"CTA stamp only {t1 - cf:.2f} s before the end (>= 2.5)")
        cta_take = takes[-1] if takes else None             # the question is her last line
        if cta_take and cta_take["at"] + cta_take["words"][0]["start"] < cf - 0.6:
            warns.append("the CTA line starts more than 0.6 s before its stamp")
    lines.append(f"| end | {t1:.3f} | length {t1 - t0:.2f} s | {'yes' if t1 - t0 <= 20.5 else 'long'} |")
    return lines, errors, warns
