// The studio look: stylised and MATTE next to Raymi's painting (PRINCIPLES 10). Toon shading in 3 soft steps, shadows
// take the set's ambient colour (never grey), fog gives depth, nothing is glossy plastic.
import React, {useEffect, useMemo, useState} from 'react';
import * as THREE from 'three';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

let gradient: THREE.DataTexture | null = null;
/** 4-step ramp: deep shade, shade, light, a narrow highlight band (painted, not plastic). */
export function toonRamp(): THREE.DataTexture {
  if (gradient) return gradient;
  const steps = [46, 122, 208, 255];      // deeper shadow steps: depth (toki 2026-10-18: "blass, ohne Tiefe")
  const data = new Uint8Array(steps.length * 4);
  steps.forEach((v, i) => data.set([v, v, v, 255], i * 4));
  gradient = new THREE.DataTexture(data, steps.length, 1, THREE.RGBAFormat);
  gradient.minFilter = gradient.magFilter = THREE.NearestFilter;
  gradient.needsUpdate = true;
  return gradient;
}

const mats = new Map<string, THREE.Material>();
/** A matte toon material, cached by colour (+ emissive glow for lamps, screens, bioluminescence). */
export function toon(color: string, emissive = '#000000', emissiveIntensity = 1, opts: {side?: THREE.Side; transparent?: boolean; opacity?: number} = {}): THREE.MeshToonMaterial {
  const k = `${color}|${emissive}|${emissiveIntensity}|${opts.side ?? 0}|${opts.opacity ?? 1}`;
  let m = mats.get(k) as THREE.MeshToonMaterial | undefined;
  if (!m) {
    m = new THREE.MeshToonMaterial({color, gradientMap: toonRamp(), emissive, emissiveIntensity, side: opts.side ?? THREE.FrontSide,
      transparent: opts.transparent ?? (opts.opacity ?? 1) < 1, opacity: opts.opacity ?? 1});
    mats.set(k, m);
  }
  return m;
}

export const Toon: React.FC<{c: string; e?: string; ei?: number; side?: THREE.Side; opacity?: number}> = ({c, e, ei, side, opacity}) => (
  <primitive object={toon(c, e, ei, {side, opacity})} attach="material" />
);

/** A set's light: coloured sky / ground fill (= the colour of every shadow) + a key light that casts soft shadows. */
export const SetLight: React.FC<{
  sky: string; ground: string; fill?: number; key: string; keyI?: number; keyPos: [number, number, number];
  target?: [number, number, number]; shadowSize?: number; fog?: string; fogNear?: number; fogFar?: number; bg?: string;
  // depth (toki 2026-10-24: "Räume nicht belichtet, hinten genauso hell wie vorne"): 0 = the flat even light of before,
  // 1 = the even fill and key give way to her own key + the set's practical pools, the distance falls into dark fog
  depth?: number;
}> = ({sky, ground, fill: fill0 = 1.1, key, keyI: keyI0 = 2.2, keyPos, target = [0, 0, 0], shadowSize = 8, fog: fog0, fogNear: near0 = 8, fogFar: far0 = 30, bg, depth = 0}) => {
  const d = Math.max(0, Math.min(1, depth));
  const fill = fill0 * (1 - 0.62 * d), keyI = keyI0 * (1 - 0.45 * d);
  const fog = fog0 && d > 0 ? new THREE.Color(fog0).lerp(new THREE.Color('#05060b'), 0.7 * d).getStyle() : fog0;
  const fogNear = near0 * (1 - 0.55 * d), fogFar = far0 * (1 - 0.4 * d);
  const light = useMemo(() => {
    const l = new THREE.DirectionalLight(key, keyI);
    l.position.set(...keyPos);
    l.target.position.set(...target);
    l.castShadow = true;
    l.shadow.mapSize.set(1024, 1024);
    l.shadow.bias = -0.0008;
    l.shadow.normalBias = 0.02;
    l.shadow.radius = 4;
    const c = l.shadow.camera as THREE.OrthographicCamera;
    c.left = -shadowSize; c.right = shadowSize; c.top = shadowSize; c.bottom = -shadowSize; c.near = 0.5; c.far = 60;
    return l;
  }, [key, keyI, keyPos, target, shadowSize]);
  return (
    <>
      {bg ? <color attach="background" args={[bg]} /> : null}
      {fog ? <fog attach="fog" args={[fog, fogNear, fogFar]} /> : null}
      <hemisphereLight args={[sky, ground, fill]} />
      <primitive object={light} />
      <primitive object={light.target} />
    </>
  );
};

// ---------------------------------------------------------------- textures (loaded BEFORE the scene renders)
// The 3D canvas draws a frame once per frame change; an image that finishes loading later never reaches that frame
// (style test v1: Raymi was invisible). So every image is preloaded and the canvas only mounts when all are ready.
const texCache = new Map<string, THREE.Texture>();

export function useTexturesReady(urls: string[]): boolean {
  const key = urls.join('|');
  const [ready, setReady] = useState(() => urls.every((u) => texCache.has(u)));
  useEffect(() => {
    const todo = urls.filter((u) => !texCache.has(u));
    if (!todo.length) { setReady(true); return; }
    const handle = delayRender(`textures ${todo.length}`);
    Promise.all(todo.map((u) => new Promise<void>((res, rej) => {
      const t = new THREE.TextureLoader().load(u, () => res(), undefined, () => rej(new Error(`texture failed: ${u}`)));
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      texCache.set(u, t);
    }))).then(() => { setReady(true); continueRender(handle); }).catch((e) => cancelRender(e));
  }, [key]);   // eslint-disable-line react-hooks/exhaustive-deps
  return ready;
}

/** A preloaded image texture (useTexturesReady must have loaded it - a missing one fails the render loudly). */
export function useImageTexture(url: string): THREE.Texture {
  const t = texCache.get(url);
  if (!t) cancelRender(new Error(`texture not preloaded: ${url}`));
  return t as THREE.Texture;
}

/** A preloaded sprite cropped to its upper part, as the picture on a phone or TV screen (null = no picture). */
export function useScreenTexture(url: string | null): THREE.Texture | undefined {
  return useMemo(() => {
    if (!url) return undefined;
    const base = texCache.get(staticFile(url));
    if (!base) { cancelRender(new Error(`screen texture not preloaded: ${url}`)); return undefined; }
    const t = base.clone();
    t.repeat.set(0.8, 0.5);
    t.offset.set(0.1, 0.48);
    t.needsUpdate = true;
    return t;
  }, [url]);
}

/** Pieces of her for many phone screens (screens_crop): an eye, the head with the cap, the dress, the tail. */
export function useScreenCrops(url: string | null): THREE.Texture[] | undefined {
  return useMemo(() => {
    if (!url) return undefined;
    const base = texCache.get(staticFile(url));
    if (!base) { cancelRender(new Error(`screen texture not preloaded: ${url}`)); return undefined; }
    return ([[0.3, 0.12, 0.35, 0.82], [0.25, 0.25, 0.3, 0.72], [0.4, 0.3, 0.3, 0.4], [0.3, 0.2, 0.55, 0.1]] as const).map(([w, h, x, y]) => {
      const t = base.clone();
      t.repeat.set(w, h); t.offset.set(x, y); t.needsUpdate = true;
      return t;
    });
  }, [url]);
}

const canvasCache = new Map<string, THREE.CanvasTexture>();
/** A texture painted once with the 2D canvas API (signs, maps, card faces, gradients), cached by key. */
export function canvasTexture(key: string, w: number, h: number, paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void): THREE.CanvasTexture {
  let t = canvasCache.get(key);
  if (!t) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('no 2d canvas');
    paint(ctx, w, h);
    t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    canvasCache.set(key, t);
  }
  return t;
}

/** Soft round blob (contact shadows, glows, bubbles' highlights). */
export function blobTexture(color: string): THREE.CanvasTexture {
  return canvasTexture(`blob${color}`, 128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, color);
    g.addColorStop(0.55, color.length === 7 ? `${color}99` : color);
    g.addColorStop(1, color.length === 7 ? `${color}00` : 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

/** Deterministic pseudo random in [0,1) from an integer seed (same picture on every render worker). */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------------------------------------------------------------- materials (toki 2026-10-23: "keine Materialien")
// A surface pattern under the toon colour: grey-scale detail (0.72..1) multiplied with the colour, tiled, so a desk
// reads as laminate, the floor as carpet, a cushion as plush - still matte and painted, never photo-real.
export type Surface = 'carpet' | 'wood' | 'paper' | 'fabric' | 'metal' | 'plush' | 'plaster' | 'rubber';
const SURF_SEED: Record<Surface, number> = {carpet: 1, wood: 2, paper: 3, fabric: 4, metal: 5, plush: 6, plaster: 7, rubber: 8};

function surfaceTexture(kind: Surface): THREE.CanvasTexture {
  const t = canvasTexture(`surface_v2_${kind}`, 256, 256, (ctx, w, h) => {
    const shade = (v: number, a = 1) => `rgba(${Math.round(255 * v)},${Math.round(255 * v)},${Math.round(255 * v)},${a})`;
    ctx.fillStyle = shade(0.93); ctx.fillRect(0, 0, w, h);
    const s = SURF_SEED[kind] * 1000;
    // v2 (toki 2026-10-24: "keine Textur, alles flach"): a large-scale layer first - soft blotches of wear and tone, so
    // a surface varies across a whole wall / floor and not only in a fine noise the picture averages away
    for (let i = 0; i < 26; i++) {
      const x = rnd(s + i * 13.1) * w, y = rnd(s + i * 17.3) * h, r = 18 + rnd(s + i * 5.7) * 46;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const v = 0.78 + 0.2 * rnd(s + i * 2.9);
      g.addColorStop(0, shade(v, 0.55)); g.addColorStop(1, shade(v, 0));
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    if (kind === 'carpet') {           // carpet TILES: a seam grid, each tile its own slight tone
      for (let ty = 0; ty < 4; ty++) for (let tx = 0; tx < 4; tx++) {
        ctx.fillStyle = shade(0.86 + 0.12 * rnd(s + tx * 7 + ty * 31), 0.45); ctx.fillRect(tx * 64, ty * 64, 64, 64);
      }
      ctx.fillStyle = shade(0.6, 0.6); for (let k = 0; k <= 4; k++) { ctx.fillRect(k * 64 - 1, 0, 2, h); ctx.fillRect(0, k * 64 - 1, w, 2); }
    } else if (kind === 'wood') {      // planks with dark joints
      ctx.fillStyle = shade(0.55, 0.7); for (let k = 0; k <= 4; k++) ctx.fillRect(0, k * 64 - 1, w, 2);
    } else if (kind === 'plaster') {   // hairline cracks
      ctx.strokeStyle = shade(0.6, 0.5); ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) { let x = rnd(s + i * 3) * w, y = rnd(s + i * 9) * h; ctx.beginPath(); ctx.moveTo(x, y);
        for (let k = 0; k < 8; k++) { x += (rnd(s + i * 40 + k) - 0.5) * 22; y += rnd(s + i * 50 + k) * 12; ctx.lineTo(x, y); } ctx.stroke(); }
    } else if (kind === 'metal') {     // scuffs
      ctx.strokeStyle = shade(1, 0.35); for (let i = 0; i < 40; i++) { const x = rnd(s + i) * w, y = rnd(s + i * 4) * h;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6 + rnd(s + i * 6) * 20, y + (rnd(s + i * 8) - 0.5) * 4); ctx.stroke(); }
    }
    if (kind === 'carpet' || kind === 'plaster' || kind === 'paper') {
      const n = kind === 'carpet' ? 5200 : kind === 'paper' ? 1400 : 2600;
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = shade(0.74 + 0.26 * rnd(s + i * 3.1), kind === 'paper' ? 0.35 : 0.6);
        const sz = kind === 'carpet' ? 1.6 : kind === 'paper' ? 0.8 + rnd(s + i) * 6 : 2.5;
        ctx.fillRect(rnd(s + i) * w, rnd(s + i * 7.7) * h, sz, kind === 'paper' ? 0.8 : sz);
      }
    } else if (kind === 'wood') {
      for (let y = 0; y < h; y += 2) {
        ctx.strokeStyle = shade(0.78 + 0.18 * Math.abs(Math.sin(y * 0.11 + Math.sin(y * 0.031) * 3)), 0.7);
        ctx.beginPath(); ctx.moveTo(0, y); for (let x = 0; x <= w; x += 16) ctx.lineTo(x, y + 2 * Math.sin(x * 0.03 + y * 0.2)); ctx.stroke();
      }
    } else if (kind === 'fabric') {
      for (let i = 0; i < w; i += 4) { ctx.fillStyle = shade(0.82, 0.5); ctx.fillRect(i, 0, 1.5, h); ctx.fillRect(0, i, w, 1.5); }
      for (let i = 0; i < 900; i++) { ctx.fillStyle = shade(0.75 + 0.2 * rnd(s + i), 0.4); ctx.fillRect(rnd(s + i * 2.3) * w, rnd(s + i * 5.9) * h, 2, 2); }
    } else if (kind === 'metal') {
      for (let y = 0; y < h; y++) { ctx.fillStyle = shade(0.82 + 0.16 * rnd(s + y * 1.3), 1); ctx.fillRect(0, y, w, 1); }
    } else if (kind === 'plush') {
      for (let i = 0; i < 2600; i++) {
        const x = rnd(s + i) * w, y = rnd(s + i * 3.3) * h, r = 1.5 + rnd(s + i * 9.1) * 3;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, shade(1, 0.5)); g.addColorStop(1, shade(0.8, 0));
        ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
      }
    } else if (kind === 'rubber') {
      for (let y = 8; y < h; y += 16) for (let x = 8; x < w; x += 16) { ctx.fillStyle = shade(0.76, 0.8); ctx.beginPath(); ctx.arc(x + (y % 32 ? 8 : 0), y, 3.5, 0, Math.PI * 2); ctx.fill(); }
    }
  }).clone();
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

const surfMats = new Map<string, THREE.MeshToonMaterial>();
/** A matte toon material WITH a surface pattern; `repeat` = tiles per world metre on the geometry's own UVs. */
export function toonSurface(color: string, kind: Surface, repeat: [number, number] = [1, 1], emissive = '#000000', ei = 1): THREE.MeshToonMaterial {
  const k = `${color}|${kind}|${repeat}|${emissive}|${ei}`;
  let m = surfMats.get(k);
  if (!m) {
    const map = surfaceTexture(kind).clone();
    map.repeat.set(repeat[0], repeat[1]); map.wrapS = map.wrapT = THREE.RepeatWrapping; map.needsUpdate = true;
    // the same pattern as relief: the set light rakes across it (a carpet seam, a plank joint, plaster) - v2 2026-10-24
    m = new THREE.MeshToonMaterial({color, map, bumpMap: map, bumpScale: kind === 'paper' ? 0.6 : 1.6, gradientMap: toonRamp(), emissive, emissiveIntensity: ei});
    surfMats.set(k, m);
  }
  return m;
}
