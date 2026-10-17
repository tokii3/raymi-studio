// The studio look: stylised and MATTE next to Raymi's painting (PRINCIPLES 10). Toon shading in 3 soft steps, shadows
// take the set's ambient colour (never grey), fog gives depth, nothing is glossy plastic.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {cancelRender, continueRender, delayRender} from 'remotion';

let gradient: THREE.DataTexture | null = null;
/** 4-step ramp: deep shade, shade, light, a narrow highlight band (painted, not plastic). */
export function toonRamp(): THREE.DataTexture {
  if (gradient) return gradient;
  const steps = [70, 140, 215, 255];
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
}> = ({sky, ground, fill = 1.1, key, keyI = 2.2, keyPos, target = [0, 0, 0], shadowSize = 8, fog, fogNear = 8, fogFar = 30, bg}) => {
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

// ---------------------------------------------------------------- textures (loaded once, render waits for them)
const texCache = new Map<string, THREE.Texture>();
export function useImageTexture(url: string): THREE.Texture {
  const cached = texCache.get(url);
  const tex = useMemo(() => {
    if (cached) return cached;
    const handle = delayRender(`texture ${url}`);
    const t = new THREE.TextureLoader().load(url, () => continueRender(handle), undefined, (e) => {
      cancelRender(new Error(`texture failed: ${url} ${String(e)}`));
    });
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    texCache.set(url, t);
    return t;
  }, [url, cached]);
  return tex;
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
