"""Clean VRoid texture blends without repainting them (toki 2026-10-25: "in vroid studio sind übergänge und verblenden
sehr schwer, es sieht oft dreckig und verfärbt aus ... nachbessern ohne die textur von grund auf neu zu verändern").

A texture = a smooth base colour + its details (markings, spots, outlines, fabric lines). VRoid's soft brush leaves the
BASE muddy: grey / brown bands where two colours meet (mixing in sRGB goes through grey) and blotches in a gradient.
This splits each texture into base and detail (a masked blur), cleans only the base and puts the details back
unchanged:
  gradient  the base becomes a clean profile along one axis (rows), mixed in OKLab - its chroma never dips below the
            line between the two ends, so no grey / brown band; a little of the old sideways variation stays
  soften    the base is blurred further (blotches out) and its chroma floored to the island's own median (no dull patch)
The alpha / empty areas stay exactly as they were. Recipes per material name live in RECIPES.

    python -m raymi.texfix <in.vrm> <out.vrm> [--preview <dir>]    (before | after JPGs per texture; needs numpy + Pillow)
raymi6.vrm (private assets) = raymi5.vrm through this, 2026-10-25.
"""
from __future__ import annotations

import json
import struct
import sys
from pathlib import Path

import numpy as np
from PIL import Image

# material name part -> (mode, strength, axis); axis 0 = the gradient runs down the rows
RECIPES = {
    "CatTail": ("gradient", 1.0, 0),      # her tail: white -> ultraviolet, a grey-brown band in the middle
    "RabbitEar": ("gradient", 0.85, 0),   # the tako ears: red / magenta / blue bands, blotchy
    "Body_00_SKIN": ("soften", 0.6, 0),   # limbs: pale -> navy with grey blotches, pink knees
    "HairBack": ("soften", 0.4, 0),
    "Hair_00_HAIR": ("soften", 0.35, 0),
}


# ---------------------------------------------------------------- colour (sRGB <-> OKLab)
def _lin(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def _srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)


def to_lab(rgb):
    r, g, b = np.moveaxis(_lin(rgb), -1, 0)
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l, m, s = np.cbrt(l), np.cbrt(m), np.cbrt(s)
    return np.stack([0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
                     1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
                     0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s], -1)


def to_rgb(lab):
    L, a, b = np.moveaxis(lab, -1, 0)
    l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
    return _srgb(np.stack([4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
                           -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
                           -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s], -1))


# ---------------------------------------------------------------- masked blur (box x3 ~ gaussian, separable)
def _box(a, r, axis):
    if r < 1:
        return a
    pad = [(0, 0)] * a.ndim
    pad[axis] = (r + 1, r)
    c = np.cumsum(np.pad(a, pad, mode="edge"), axis=axis)
    hi = np.take(c, np.arange(2 * r + 1, c.shape[axis]), axis=axis)
    lo = np.take(c, np.arange(0, c.shape[axis] - 2 * r - 1), axis=axis)
    return (hi - lo) / (2 * r + 1)


def blur(a, w, r):
    """Normalized convolution: only pixels with weight w count (empty texture areas never bleed in)."""
    num, den = a * w[..., None], w.astype(float)
    for _ in range(3):
        for ax in (0, 1):
            num, den = _box(num, r, ax), _box(den, r, ax)
    return num / np.maximum(den[..., None], 1e-6)


# ---------------------------------------------------------------- the two cleaners
def clean(rgba: np.ndarray, mode: str, strength: float, axis: int = 0) -> np.ndarray:
    rgb, alpha = rgba[..., :3] / 255.0, rgba[..., 3] / 255.0
    mask = (alpha > 0.5) & (rgb.max(-1) > 0.012)       # the painted part (VRoid fills the rest black / transparent)
    if mask.sum() < 64:
        return rgba
    lab = to_lab(rgb)
    r = max(2, rgba.shape[0] // 90)
    base = blur(lab, mask, r)
    detail = lab - base
    if mode == "gradient":
        lab_rows = np.moveaxis(base, axis, 0)
        m_rows = np.moveaxis(mask, axis, 0)
        cnt = m_rows.sum(1)
        prof = (lab_rows * m_rows[..., None]).sum(1) / np.maximum(cnt[:, None], 1)
        valid = cnt > 0
        idx = np.arange(len(prof))
        for k in range(3):                                # empty rows take the neighbours' colour
            prof[:, k] = np.interp(idx, idx[valid], prof[valid, k])
        win = max(3, len(prof) // 24)
        sm = np.stack([np.convolve(np.pad(prof[:, k], win, mode="edge"), np.ones(2 * win + 1) / (2 * win + 1), "same")[win:-win] for k in range(3)], -1)
        # chroma never below the straight line between the two ends: no grey / brown band where two colours meet
        C = np.hypot(sm[:, 1], sm[:, 2])
        v = idx[valid]
        a_end, b_end = v[0] + (v[-1] - v[0]) * 0.08, v[0] + (v[-1] - v[0]) * 0.92
        ca, cb = np.interp(a_end, idx, C), np.interp(b_end, idx, C)
        line = np.interp(idx, [a_end, b_end], [ca, cb])
        boost = np.where(C > 1e-4, np.maximum(1.0, line / np.maximum(C, 1e-4)), 1.0)
        sm[:, 1:] *= boost[:, None]
        clean_base = np.moveaxis(np.broadcast_to(sm[:, None, :], lab_rows.shape), 0, axis)
        side = base - np.moveaxis(np.broadcast_to(prof[:, None, :], lab_rows.shape), 0, axis)   # sideways variation
        new_base = clean_base + 0.3 * side
    else:
        new_base = blur(base, mask, r * 3)
        C = np.hypot(new_base[..., 1], new_base[..., 2])
        floor = np.median(C[mask]) * 0.75
        k = np.where(C > 1e-4, np.maximum(1.0, floor / np.maximum(C, 1e-4)), 1.0)
        new_base = new_base.copy()
        new_base[..., 1:] *= np.minimum(k, 1.6)[..., None]
    # edges stay untouched (preview 1: the skin markings got light halos): the change fades out wherever the picture has
    # a detail edge nearby - only the soft, flat parts of a blend are cleaned
    edge = np.abs(detail[..., 0]) + 0.5 * np.hypot(detail[..., 1], detail[..., 2])
    near = blur(edge[..., None], mask, r)[..., 0]
    keep = np.clip(1.0 - near / 0.035, 0.0, 1.0)
    if mode == "soften":                                  # dark painted parts (hands, feet, markings) stay as painted
        keep = keep * np.clip((lab[..., 0] - 0.45) / 0.15, 0.0, 1.0)
    keep = keep[..., None]
    out_lab = base + strength * keep * (new_base - base) + detail
    out = rgb.copy()
    out[mask] = to_rgb(out_lab)[mask]
    res = rgba.copy()
    res[..., :3] = np.round(np.clip(out, 0, 1) * 255).astype(np.uint8)
    return res


# ---------------------------------------------------------------- the VRM (glb) in and out
def _read(path: Path):
    b = path.read_bytes()
    L = struct.unpack("<I", b[12:16])[0]
    j = json.loads(b[20:20 + L])
    off = 20 + L
    BL = struct.unpack("<I", b[off:off + 4])[0]
    return j, bytearray(b[off + 8:off + 8 + BL])


def _write(path: Path, j: dict, views: list[bytes]):
    blob = bytearray()
    for i, data in enumerate(views):
        while len(blob) % 4:
            blob.append(0)
        j["bufferViews"][i]["byteOffset"] = len(blob)
        j["bufferViews"][i]["byteLength"] = len(data)
        blob += data
    while len(blob) % 4:
        blob.append(0)
    j["buffers"][0]["byteLength"] = len(blob)
    js = json.dumps(j, separators=(",", ":")).encode()
    js += b" " * ((4 - len(js) % 4) % 4)
    total = 12 + 8 + len(js) + 8 + len(blob)
    path.write_bytes(struct.pack("<III", 0x46546C67, 2, total) + struct.pack("<II", len(js), 0x4E4F534A) + js
                     + struct.pack("<II", len(blob), 0x004E4942) + bytes(blob))


def main(argv: list[str]) -> int:
    src, dst = Path(argv[0]), Path(argv[1])
    prev = Path(argv[argv.index("--preview") + 1]) if "--preview" in argv else None
    j, binbuf = _read(src)
    views = [bytes(binbuf[v.get("byteOffset", 0):v.get("byteOffset", 0) + v["byteLength"]]) for v in j["bufferViews"]]
    props = j["extensions"]["VRM"]["materialProperties"]
    done = set()
    for mp in props:
        rec = next((r for k, r in RECIPES.items() if k in mp["name"]), None)
        ti = mp.get("textureProperties", {}).get("_MainTex")
        if rec is None or ti is None or ti in done:
            continue
        done.add(ti)
        img = j["images"][j["textures"][ti]["source"]]
        vi = img["bufferView"]
        import io
        im = Image.open(io.BytesIO(views[vi])).convert("RGBA")
        a = np.array(im)
        b = clean(a, *rec)
        out = io.BytesIO()
        Image.fromarray(b, "RGBA").save(out, "PNG", optimize=True)
        views[vi] = out.getvalue()
        img["mimeType"] = "image/png"
        if prev:
            prev.mkdir(parents=True, exist_ok=True)
            w = 512
            pair = Image.new("RGBA", (w * 2, w))
            pair.paste(Image.fromarray(a, "RGBA").resize((w, w)), (0, 0))
            pair.paste(Image.fromarray(b, "RGBA").resize((w, w)), (w, 0))
            pair.convert("RGB").save(prev / f"{mp['name'].split(' ')[0]}.jpg", quality=90)
        print(f"  {mp['name']}: {rec[0]} x{rec[1]}")
    _write(dst, j, views)
    print(f"texfix: {len(done)} textures cleaned -> {dst} ({dst.stat().st_size / 1e6:.1f} MB)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
