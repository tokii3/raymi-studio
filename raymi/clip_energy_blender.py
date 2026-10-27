"""Measure every Mixamo clip's MOTION ENERGY (runs inside Blender, cloud only: .github/workflows/clip-energy.yml).

toki 2026-10-27 (Love is War draft, third time): "raymis bewegungen nicht flüssig ... statisch ... abgehackt". The
draft measured her nearly still 33 % of the time with a median limb speed of 0.22 m/s, because clips were picked by
NAME (pull-heavy-object, treading-water ...). This measures what each clip really does, so a script picks clips by
energy: per clip the speed of hands / feet / head / hips (body scaled to her 1.55 m), how much of it is nearly still,
the peak, how far the root travels, and the loop seam (how far the last pose is from the first - a jump on screen
when the clip loops).

    blender -b --python raymi/clip_energy_blender.py -- <motions dir> <out.json>
"""
import json
import math
import os
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1:]
SRC, OUT = argv[0], argv[1]
BONES = ["Hips", "Head", "LeftHand", "RightHand", "LeftFoot", "RightFoot"]
FPS = 30
HER = 1.55


def find(arm, name):
    for b in arm.pose.bones:
        if b.name.split(":")[-1] == name:
            return b
    return None


def measure(path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=path, automatic_bone_orientation=False)
    arm = next((o for o in bpy.context.scene.objects if o.type == "ARMATURE"), None)
    if arm is None or arm.animation_data is None or arm.animation_data.action is None:
        return None
    act = arm.animation_data.action
    f0, f1 = (int(math.floor(act.frame_range[0])), int(math.ceil(act.frame_range[1])))
    src_fps = bpy.context.scene.render.fps / bpy.context.scene.render.fps_base
    bones = {n: find(arm, n) for n in BONES}
    if any(b is None for b in bones.values()):
        return None
    mw = arm.matrix_world
    pts = []
    for f in range(f0, f1 + 1):
        bpy.context.scene.frame_set(f)
        pts.append({n: (mw @ b.head) for n, b in bones.items()})
    if len(pts) < 3:
        return None
    # body scale: head above the lower foot in the first frame -> her 1.55 m (head bone ~0.86 of the figure)
    p0 = pts[0]
    tall = (p0["Head"].z - min(p0["LeftFoot"].z, p0["RightFoot"].z)) / 0.86
    k = HER / tall if tall > 1e-6 else 1.0
    dt = 1.0 / src_fps
    limb, still = [], 0
    for a, b in zip(pts, pts[1:]):
        hip = (b["Hips"] - a["Hips"])          # limbs measured relative to the hips: travel is counted apart
        v = max(((b[n] - a[n]) - hip).length for n in ("Head", "LeftHand", "RightHand", "LeftFoot", "RightFoot")) * k / dt
        limb.append(v)
        still += v < 0.1
    limb_sorted = sorted(limb)
    travel = (pts[-1]["Hips"] - pts[0]["Hips"]).length * k
    seam = max(((pts[-1][n] - pts[-1]["Hips"]) - (pts[0][n] - pts[0]["Hips"])).length for n in BONES[1:]) * k
    mean_step = sum(limb) / len(limb) * dt
    return {"dur": round((f1 - f0) / src_fps, 2), "mean": round(sum(limb) / len(limb), 3),
            "p90": round(limb_sorted[int(0.9 * (len(limb_sorted) - 1))], 3), "peak": round(limb_sorted[-1], 3),
            "still": round(still / len(limb), 3), "travel": round(travel, 3), "seam": round(seam, 3),
            "seam_steps": round(seam / max(mean_step, 1e-4), 1),
            "low": round(min(p["Hips"].z for p in pts) * k / max(p0["Hips"].z * k, 1e-4), 3)}


out = {}
for fn in sorted(os.listdir(SRC)):
    if not fn.lower().endswith(".fbx"):
        continue
    try:
        m = measure(os.path.join(SRC, fn))
    except Exception as e:     # one broken file never stops the catalogue
        m = {"error": str(e)[:200]}
    if m is not None:
        out[fn[:-4]] = m
        print(fn, m, flush=True)
json.dump({"_why": __doc__.strip().splitlines()[0], "fps_note": "speeds in m/s for her 1.55 m figure, limbs relative to the hips",
           "clips": out}, open(OUT, "w"), indent=1)
print("clips measured:", len(out))
