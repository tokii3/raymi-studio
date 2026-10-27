// The painted world (Love is War build 2026-10-26, jobs/2026-10-25_love-is-war/11_WORLD_build.md): ONE graphic 2D
// world around the 3D Raymi - toki X5 "eher richtung 2", "immer noch plastik look, fühlt sich komisch belichtet an".
// Every layer is a CanvasTexture painted in code on a card / a ring around her, MeshBasicMaterial (unlit, never PBR):
// flat value steps, hard edges, an ink contour that wobbles, one hatch direction, the same paper grain everywhere.
// Only she is lit. Cards wrap 360 degrees round her (cyclorama rings), so any lens bearing sees the world.
// Reusable in any sea / night set: opts.painted = 1 (sets/NightSea, sets/Deep) - the layers below read their own opts.
// TwoTone (film/TwoTone.tsx) reads material.userData.tone ('ink' | 'paper') so a painted mass flips the right way.
import React from 'react';
import * as THREE from 'three';
import {canvasTexture, rnd} from './look';
import {add} from './fire';
import {frames} from './events';

type P3 = [number, number, number];
// "storm indigo" - the one palette family (11_WORLD_build section 0)
export const PAL = {ink: '#070b1c', deep: '#12183a', mid: '#26327a', light: '#5a6cc0', mist: '#aab6ec', paper: '#dfe6ff',
  lamp: '#ffd9a0', core: '#fff0cd', bolt: '#e8f0ff', violet: '#9b5cff', cyan: '#5ef2ff',
  brass: '#6b4a1c', brassLit: '#d9a24a', brassShade: '#2a1a0c', stripe: '#8a1c32'};

/** seeded 0..1 */
const r = (i: number) => rnd(i * 1.618 + 0.37);

/** The paper grain every card carries: fibre (1 px) + blotches (24 px), ~6 % luma, seeded - drawn over a painting. */
function grain(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number, amt = 0.06) {
  const n = Math.round((w * h) / 90);
  for (let i = 0; i < n; i++) {
    const v = r(seed + i * 3) > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${amt * (0.4 + r(seed + i * 7) * 0.6)})`;
    ctx.fillRect(r(seed + i * 11) * w, r(seed + i * 13) * h, 1 + (r(seed + i) > 0.9 ? 1 : 0), 1);
  }
  for (let i = 0; i < 40; i++) {
    const v = r(seed + i * 5) > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${amt * 0.35})`;
    ctx.beginPath(); ctx.arc(r(seed + i * 17) * w, r(seed + i * 19) * h, 12 + r(seed + i * 23) * 24, 0, Math.PI * 2); ctx.fill();
  }
}

/** Parallel hatch strokes (2 px, 6 px apart, 35 deg - one direction in the whole world) clipped to the current path. */
function hatch(ctx: CanvasRenderingContext2D, w: number, h: number, color: string, gap = 6, width = 2, angle = 35) {
  ctx.save(); ctx.clip();
  ctx.strokeStyle = color; ctx.lineWidth = width;
  const t = Math.tan((angle * Math.PI) / 180);
  for (let x = -h * t; x < w + h * t; x += gap) { ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + h * t, 0); ctx.stroke(); }
  ctx.restore();
}

/** A wobbled outline along y = top(x): the ridge of a cloud wall, a wave row, a torn sky band. */
function ridge(w: number, base: number, amp: number, seed: number, lumps: number, kind: 'cloud' | 'wave' | 'torn'): [number, number][] {
  const pts: [number, number][] = [];
  const N = 240;
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * w, u = (i / N) * lumps;
    const k = Math.floor(u), fr = u - k;
    let y: number;
    if (kind === 'cloud') y = base - amp * (0.55 + 0.45 * r(seed + k)) * Math.sqrt(Math.max(0, Math.sin(Math.PI * fr)));
    else if (kind === 'wave') y = base - amp * (fr < 0.6 ? fr / 0.6 : 1 - (fr - 0.6) / 0.4) * (0.6 + 0.4 * r(seed + k));
    else y = base + amp * (r(seed + i * 3) - 0.5);
    y += 1.5 * Math.sin(i * 1.7 + seed);                                         // the hand's wobble
    pts.push([x, y]);
  }
  return pts;
}

function fillBelow(ctx: CanvasRenderingContext2D, pts: [number, number][], h: number, color: string) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], h);
  for (const [x, y] of pts) ctx.lineTo(x, y);
  ctx.lineTo(pts[pts.length - 1][0], h); ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
}

function strokeLine(ctx: CanvasRenderingContext2D, pts: [number, number][], color: string, width: number) {
  ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.stroke();
}

function mat(map: THREE.Texture, tone: 'ink' | 'paper' | 'clear', o: Partial<THREE.MeshBasicMaterialParameters> = {}): THREE.MeshBasicMaterial {
  const m = new THREE.MeshBasicMaterial({map, toneMapped: false, fog: false, ...o});
  m.userData.tone = tone;
  return m;
}
const mats = new Map<string, THREE.MeshBasicMaterial>();
function cached(key: string, make: () => THREE.MeshBasicMaterial) {
  let m = mats.get(key);
  if (!m) { m = make(); mats.set(key, m); }
  return m;
}

// ---------------------------------------------------------------- the storm sea

/** The storm sky: five torn value bands, a banded horizon glow, dry-brush streaks (a ring round the world). */
function skyMat(eye: boolean) {
  return cached(`sky${eye}`, () => mat(canvasTexture(`p_sky${eye}`, 2048, 512, (ctx, w, h) => {
    const steps = eye ? ['#05081a', '#0a1030', '#12183a', '#1a2350', PAL.mid] : [PAL.ink, '#0b1128', PAL.deep, '#1a2250', PAL.mid];
    steps.forEach((c, k) => {
      const base = (h * (k + 1)) / (steps.length + 0.4);
      fillBelow(ctx, k ? ridge(w, base, 18, 11 + k * 7, 0, 'torn') : [[0, 0], [w, 0]], h, c);
    });
    ctx.fillStyle = PAL.light; ctx.fillRect(0, h * 0.94, w, h * 0.06);       // the horizon glow band (kills the hard line)
    if (!eye) for (let i = 0; i < 140; i++) {                                   // dry-brush streaks, 15 % alpha
      ctx.strokeStyle = `rgba(170,182,236,${0.06 + r(i) * 0.09})`; ctx.lineWidth = 2 + r(i * 3) * 6;
      const x = r(i * 5) * w, y = h * (0.15 + r(i * 7) * 0.6), L = 60 + r(i * 9) * 220;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + L, y - L * 0.08); ctx.stroke();
    }
    if (eye) for (let i = 0; i < 260; i++) {                                    // the storm eye: drawn stars, crosses
      const x = r(i * 3) * w, y = r(i * 5) * h * 0.8, s = 1 + r(i * 7) * 2.5;
      ctx.fillStyle = PAL.paper; ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
    grain(ctx, w, h, 3);
  }), 'paper', {side: THREE.BackSide, depthWrite: false}));
}

/** A cloud wall: a cauliflower mass in 3 flat steps, hatched in its lowest step, a lit rim on one side, ink contour. */
function cloudMat(key: string, body: string, mid: string, rim: string, seed: number) {
  return cached(`cl${key}`, () => mat(canvasTexture(`p_cloud${key}`, 2048, 256, (ctx, w, h) => {
    const top = ridge(w, h * 0.45, h * 0.38, seed, 18, 'cloud');
    fillBelow(ctx, top, h, rim);
    fillBelow(ctx, top.map(([x, y]) => [x, y + 7]), h, mid);
    fillBelow(ctx, top.map(([x, y]) => [x, y + h * 0.18]), h, body);
    ctx.beginPath(); ctx.rect(0, h * 0.72, w, h * 0.28);
    hatch(ctx, w, h, 'rgba(7,11,28,0.55)');
    strokeLine(ctx, top, PAL.ink, 2.5);
    grain(ctx, w, h, seed);
  }), 'ink', {side: THREE.DoubleSide, transparent: true, depthWrite: false}));
}

/** A row of waves: sawtooth-rounded crests, trough ink / face deep / crest mid, ragged foam dashes. */
function waveMat(key: string, crest: string, face: string, foam: string, seed: number, lumps: number) {
  return cached(`wv${key}`, () => mat(canvasTexture(`p_wave${key}`, 2048, 128, (ctx, w, h) => {
    const top = ridge(w, h * 0.5, h * 0.42, seed, lumps, 'wave');
    fillBelow(ctx, top, h, crest);
    fillBelow(ctx, top.map(([x, y]) => [x, y + 6]), h, face);
    fillBelow(ctx, top.map(([x, y]) => [x, y + h * 0.3]), h, PAL.ink);
    for (let i = 0; i < lumps * 6; i++) {                                       // foam: short ragged dashes on the crests
      const k = Math.floor(r(seed + i) * top.length);
      const [x, y] = top[k];
      ctx.strokeStyle = foam; ctx.lineWidth = 2 + r(i * 3) * 2;
      ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x + 6 + r(i * 5) * 18, y + 1 + r(i) * 3); ctx.stroke();
    }
    strokeLine(ctx, top, PAL.ink, 2);
    grain(ctx, w, h, seed + 1);
  }), 'ink', {side: THREE.DoubleSide, transparent: true, depthWrite: false}));
}

/** The moon (one shot, 45 % of the frame): three flat steps, hatched crater ovals, a 3 px limb, two banded halo rings. */
function moonMat() {
  return cached('moon', () => mat(canvasTexture('p_moon', 512, 512, (ctx, w, h) => {
    const c = w / 2, R = w * 0.36;
    [[R * 1.32, 'rgba(170,182,236,0.10)'], [R * 1.16, 'rgba(170,182,236,0.14)']].forEach(([rr, col]) => {
      ctx.fillStyle = col as string; ctx.beginPath(); ctx.arc(c, c, rr as number, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = PAL.paper; ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PAL.mist; ctx.beginPath(); ctx.arc(c + R * 0.22, c + R * 0.1, R * 0.92, 0, Math.PI * 2);   // the crescent shade
    ctx.arc(c, c, R, 0, Math.PI * 2, true); ctx.fill();
    for (let i = 0; i < 7; i++) {
      ctx.beginPath(); ctx.ellipse(c + (r(i) - 0.5) * R * 1.1, c + (r(i * 3) - 0.5) * R * 1.1, 10 + r(i * 5) * 26, 7 + r(i * 7) * 16, r(i) * 3, 0, Math.PI * 2);
      hatch(ctx, w, h, 'rgba(38,50,122,0.55)', 5, 1.5);
    }
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2); ctx.stroke();
    grain(ctx, w, h, 9);
  }), 'paper', {transparent: true, depthWrite: false}));
}

/** The foam collar round her chest at the waterline: broken strokes, a ragged inner edge, a thin ink gap = contact. */
function collarMat() {
  return cached('collar', () => mat(canvasTexture('p_collar', 512, 512, (ctx, w, h) => {
    const c = w / 2;
    for (let k = 0; k < 4; k++) {                                              // 4 rings of broken foam arcs
      const R = w * (0.17 + k * 0.075);
      for (let i = 0; i < 9 + k * 3; i++) {
        const a0 = (i / (9 + k * 3)) * Math.PI * 2 + r(k * 31 + i) * 0.4, a1 = a0 + 0.25 + r(k * 7 + i) * 0.35;
        ctx.strokeStyle = k < 2 ? PAL.paper : PAL.mist; ctx.lineWidth = (5 - k) * (0.8 + r(i) * 0.6); ctx.lineCap = 'round';
        ctx.globalAlpha = 1 - k * 0.2;
        ctx.beginPath(); ctx.arc(c, c, R + (r(k + i * 3) - 0.5) * 6, a0, a1); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(c, c, w * 0.145, 0, Math.PI * 2); ctx.stroke();
    grain(ctx, w, h, 21);
  }), 'paper', {transparent: true, depthWrite: false, side: THREE.DoubleSide}));
}

/** A ring card round her (a cyclorama band): radius R, from y0 to y1, its texture repeated `rep` times round. */
const Ring: React.FC<{R: number; y0: number; y1: number; m: THREE.Material; rot?: number; x?: number; z?: number; order?: number}> = ({R, y0, y1, m, rot = 0, x = 0, z = 0, order = -8}) => (
  <mesh position={[x, (y0 + y1) / 2, z]} rotation={[0, rot, 0]} material={m} renderOrder={order}>
    <cylinderGeometry args={[R, R, y1 - y0, 96, 1, true]} />
  </mesh>
);

/** The storm sea's painted layers (11_WORLD_build section 1). centre = her place (the rings wrap round her). */
export const PaintedSea: React.FC<{o: Record<string, unknown>; f: number; fps: number; centre: P3; under: boolean}> = ({o, f, fps, centre, under}) => {
  const t = f / fps;
  // the ink night (4_SCRIPT 84-86): from ink_sky_at on the storm is gone - the sky is the clear dark of the storm eye
  // (build stills 1: star_sky measured lum 0.61 against the pros' <= 0.11)
  const eye = Boolean(o.eye) || frames(o.ink_sky_at).some((t) => f >= t);
  const [cx, , cz] = centre;
  const rollIn = typeof (o.cloud_wall as number[] | undefined)?.[0] === 'number' ? (o.cloud_wall as number[]) : null;
  const wallC = rollIn ? Math.max(0, Math.min(1, (f - rollIn[0]) / Math.max(1, (rollIn[1] - rollIn[0])))) : eye ? 0 : 1;
  const moonBig = Number(o.moon_big ?? 0);
  const clear = frames(o.clear_at)[0];
  const parted = moonBig > 0 && clear !== undefined ? Math.max(0, Math.min(1, (f - clear) / 30)) : 0;
  const bob = (k: number, a: number, p: number) => a * Math.sin(t * (2 * Math.PI / p) + k);
  const tex = (m: THREE.MeshBasicMaterial, ox: number) => { if (m.map) { m.map.wrapS = THREE.RepeatWrapping; m.map.offset.x = ox; } return m; };
  return (
    <group>
      {under ? null : <><Ring R={150} y0={-2} y1={110} m={skyMat(eye)} order={-12} />
      <mesh position={[0, 110, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={-12}><circleGeometry args={[150, 48]} />
        <meshBasicMaterial color={eye ? '#05081a' : PAL.ink} fog={false} toneMapped={false} side={THREE.DoubleSide} /></mesh></>}
      {!eye && !under ? <>
        <Ring R={110} y0={6 - 30 * parted} y1={34 - 30 * parted} m={tex(cloudMat('A', PAL.deep, PAL.mid, PAL.light, 31), t * 0.4 / 690)} order={-11} />
        <Ring R={60} y0={4 - 20 * parted} y1={20 - 20 * parted} m={tex(cloudMat('B', PAL.ink, PAL.deep, PAL.mid, 47), t * 1 / 377)} order={-10} />
      </> : null}
      {wallC > 0 && !under && parted < 1 ? <Ring R={90 - 76 * (rollIn ? wallC : 0)} y0={3 - 20 * parted} y1={16 + 6 * wallC - 20 * parted} m={tex(cloudMat('C', PAL.ink, PAL.deep, PAL.light, 59), t / 300)} order={-9} /> : null}
      {moonBig > 0 && !under ? (
        <mesh position={[centre[0] - 22, 26, centre[2] - 140]} renderOrder={-11} material={moonMat()}>
          <planeGeometry args={[52 * moonBig / 0.45, 52 * moonBig / 0.45]} />
        </mesh>
      ) : null}
      {!under ? <>
        {[[80, 0.25, 0.5, 2.6], [50, 0.25, 0.8, 1.9], [30, 0.3, 1.2, 1.4]].map(([R, a, s, hh], k) => (
          <Ring key={`wf${k}`} R={R} x={cx} z={cz} y0={-0.3 + bob(k, a, 5)} y1={hh + bob(k, a, 5)}
            m={tex(waveMat(`far${k}`, PAL.mid, PAL.deep, `rgba(170,182,236,0.7)`, 70 + k * 9, 40 - k * 8), (t * s) / (2 * Math.PI * R))} order={-7} />
        ))}
        {[[14, 0.4, 1.0], [8, 0.4, 1.2]].map(([R, a, hh], k) => (
          <Ring key={`wm${k}`} R={R} x={cx} z={cz} y0={-0.4 + bob(k + 3, a, 4)} y1={hh + bob(k + 3, a, 4)}
            m={tex(waveMat(`mid${k}`, PAL.light, PAL.mid, PAL.paper, 91 + k * 7, 14), (t * 0.9) / (2 * Math.PI * R))} order={-6} />
        ))}
        {/* the foam collar round her chest: she is IN the water, never a cut-out on a sheet */}
        <mesh position={[cx, 0.03, cz]} rotation={[-Math.PI / 2, 0, t * 0.15]} scale={2.4 + 0.08 * Math.sin(t * 2)} material={collarMat()} renderOrder={7}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      </> : null}
    </group>
  );
};

// ---------------------------------------------------------------- the lighthouse, painted

/** The tower: plaster lit / shade / red stripe in 3 flat steps, horizontal plaster hatch, ink window slits, contour. */
export function towerMat() {
  return cached('tower', () => mat(canvasTexture('p_tower', 1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = PAL.mist; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#7f8bc8'; ctx.fillRect(w * 0.5, 0, w * 0.5, h);             // the shade half (cylinder u 0.5..1)
    [0.3, 0.62].forEach((k) => { ctx.fillStyle = PAL.stripe; ctx.fillRect(0, h * (1 - k) - h * 0.06, w, h * 0.12); });
    ctx.strokeStyle = 'rgba(38,50,122,0.35)'; ctx.lineWidth = 2;
    for (let y = 0; y < h; y += 6) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y + 2); ctx.stroke(); }
    ctx.beginPath(); ctx.rect(w * 0.5, 0, w * 0.5, h); hatch(ctx, w, h, 'rgba(7,11,28,0.35)');
    for (let i = 0; i < 5; i++) { ctx.fillStyle = PAL.ink; ctx.fillRect(w * (0.1 + r(i) * 0.3), h * (0.15 + i * 0.16), 10, 34); }
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6; ctx.strokeRect(0, 0, w, h);
    grain(ctx, w, h, 33);
  }), 'paper'));
}
export function rockMat() {
  return cached('rock', () => {
    const m = mat(canvasTexture('p_rock', 512, 512, (ctx, w, h) => {
      ctx.fillStyle = PAL.ink; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 7; i++) {                                              // flat shard facets + crack lines
        ctx.fillStyle = i % 2 ? PAL.deep : '#0d1230';
        ctx.beginPath(); ctx.moveTo(r(i) * w, r(i * 3) * h); ctx.lineTo(r(i * 5) * w, r(i * 7) * h); ctx.lineTo(r(i * 9) * w, r(i * 11) * h); ctx.fill();
        ctx.strokeStyle = PAL.mid; ctx.lineWidth = 2; ctx.stroke();
      }
      for (let i = 0; i < 60; i++) { ctx.fillStyle = 'rgba(90,108,192,0.6)'; ctx.beginPath(); ctx.arc(r(i * 13) * w, h * (0.7 + r(i * 17) * 0.3), 2 + r(i) * 4, 0, Math.PI * 2); ctx.fill(); }
      grain(ctx, w, h, 41);
    }), 'ink');
    return m;
  });
}
export function brassMat() {
  return cached('brass', () => mat(canvasTexture('p_brass', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = PAL.brass; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = PAL.brassLit; ctx.fillRect(0, 0, w, h * 0.35);
    ctx.fillStyle = PAL.brassShade; ctx.fillRect(0, h * 0.78, w, h * 0.22);
    for (let i = 0; i < 160; i++) {                                              // hammered: short random hatch ticks
      ctx.strokeStyle = r(i) > 0.5 ? 'rgba(42,26,12,0.5)' : 'rgba(255,217,160,0.35)'; ctx.lineWidth = 1.5;
      const x = r(i * 3) * w, y = r(i * 5) * h; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 4, y - 2); ctx.stroke();
    }
    for (let i = 0; i < 6; i++) { ctx.fillStyle = PAL.brassShade; ctx.beginPath(); ctx.ellipse(20 + i * 42, h * 0.55, 4, 3, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; ctx.strokeRect(0, 0, w, h);
  }), 'ink'));
}
/** The Fresnel lens as painted glass: 6-9 broken concentric prism rings, banded, no rainbow. */
export function fresnelMat() {
  return cached('fresnel', () => mat(canvasTexture('p_fresnel', 1024, 1024, (ctx, w, h) => {
    const c = w / 2;
    for (let k = 0; k < 9; k++) {
      const R = w * (0.06 + k * 0.05);
      for (let s = 0; s < 6; s++) {
        const a0 = s * (Math.PI / 3) + r(k * 7 + s) * 0.3, a1 = a0 + Math.PI / 3 - 0.12 - r(k + s) * 0.2;
        ctx.strokeStyle = s % 3 === 0 ? 'rgba(255,217,160,0.55)' : k % 2 ? 'rgba(223,230,255,0.45)' : 'rgba(170,182,236,0.32)';
        ctx.lineWidth = 1 + (k % 3) * 2.5; ctx.beginPath(); ctx.arc(c, c, R, a0, a1); ctx.stroke();
      }
    }
    ctx.strokeStyle = 'rgba(7,11,28,0.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(c, c, w * 0.48, 0, Math.PI * 2); ctx.stroke();
  }), 'paper', {transparent: true, depthWrite: false, side: THREE.DoubleSide}));
}
function plankMat() {
  return cached('plank', () => mat(canvasTexture('p_plank', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = PAL.deep; ctx.fillRect(0, 0, w, h);
    const c = w / 2;
    for (let i = 0; i < 48; i++) {                                               // radial plank lines
      const a = (i / 48) * Math.PI * 2; ctx.strokeStyle = i % 2 ? PAL.ink : PAL.mid; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(c + Math.cos(a) * 60, c + Math.sin(a) * 60); ctx.lineTo(c + Math.cos(a) * c, c + Math.sin(a) * c); ctx.stroke();
    }
    for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(107,74,28,0.6)'; ctx.fillRect(r(i * 3) * w, r(i * 5) * h, 4, 3); }   // rust dabs
    ctx.strokeStyle = PAL.mid; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(c, c, c - 4, 0, Math.PI * 2); ctx.stroke();
    grain(ctx, w, h, 51);
  }), 'ink', {side: THREE.DoubleSide}));
}
function glassMat() {
  return cached('glass', () => mat(canvasTexture('p_glass', 1024, 256, (ctx, w, h) => {
    for (let i = 0; i < 40; i++) {                                               // diagonal highlight strokes, 2 widths
      ctx.strokeStyle = `rgba(223,230,255,${0.12 + r(i) * 0.18})`; ctx.lineWidth = r(i * 3) > 0.6 ? 5 : 2;
      const x = r(i * 5) * w; ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + 50, 0); ctx.stroke();
    }
    for (let i = 0; i < 70; i++) { ctx.fillStyle = 'rgba(170,182,236,0.35)'; ctx.fillRect(r(i * 7) * w, r(i * 9) * h, 2, 10 + r(i) * 20); }   // rain drips
  }), 'clear', {transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: 0.9}));
}
/** The lamp: a disc with three flat concentric rings and 8-12 hard radial spikes. */
function lampMat() {
  return cached('lamp', () => mat(canvasTexture('p_lamp', 512, 512, (ctx, w, h) => {
    const c = w / 2;
    ctx.fillStyle = 'rgba(255,217,160,0.35)';
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.2; ctx.beginPath(); ctx.moveTo(c, c);
      ctx.lineTo(c + Math.cos(a - 0.05) * c, c + Math.sin(a - 0.05) * c); ctx.lineTo(c + Math.cos(a + 0.05) * c, c + Math.sin(a + 0.05) * c); ctx.fill();
    }
    [[0.42, PAL.lamp], [0.3, PAL.core], [0.16, '#ffffff']].forEach(([rr, col]) => { ctx.fillStyle = col as string; ctx.beginPath(); ctx.arc(c, c, c * (rr as number), 0, Math.PI * 2); ctx.fill(); });
  }), 'paper', {transparent: true, depthWrite: false}));
}

/** The lantern room at HER scale (11_WORLD_build section 2): gallery floor y H+0.38 r 2.6 + rail 1.1 m, glass r 1.6
 *  from H+0.9 to H+3.3, the brass frame ring at H+1.4 + mullions, the lamp at H+1.7, the Fresnel lens as painted rings. */
export const LanternRoom: React.FC<{x: number; z: number; H: number; f: number; fps: number; camPos: P3; fresnelFront: boolean; violet: number; v?: number; glass?: boolean}> = ({x, z, H, f, fps, camPos, fresnelFront, violet, v = 1, glass = true}) => {
  const t = f / fps;
  const g = H + 0.38, lampY = H + 1.7;
  const toCam = Math.atan2(camPos[0] - x, camPos[2] - z);
  const ink = cached('inkbasic', () => { const m = new THREE.MeshBasicMaterial({color: PAL.ink, toneMapped: false, fog: false}); m.userData.tone = 'ink'; return m; });
  return (
    <group>
      <mesh position={[x, g - 0.06, z]} material={plankMat()} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[2.6, 48]} /></mesh>
      <mesh position={[x, g - 0.2, z]} material={ink}><cylinderGeometry args={[2.62, 2.2, 0.28, 48, 1, true]} /></mesh>
      {[0.55, 1.1].map((hh) => <mesh key={hh} position={[x, g + hh, z]} rotation={[Math.PI / 2, 0, 0]} material={ink}><torusGeometry args={[2.6, 0.03, 6, 72]} /></mesh>)}
      {Array.from({length: 24}, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return <mesh key={`b${i}`} position={[x + Math.sin(a) * 2.6, g + 0.55, z + Math.cos(a) * 2.6]} material={ink}><boxGeometry args={[0.035, 1.1, 0.035]} /></mesh>;
      })}
      {/* the turning base she stands on, the brass ring of the frame and its mullions up to the roof */}
      <mesh position={[x, H + 0.64, z]} material={brassMat()}><cylinderGeometry args={[1.5, 1.6, 0.52, 40]} /></mesh>
      <mesh position={[x, H + 1.4, z]} rotation={[Math.PI / 2, 0, 0]} material={brassMat()}><torusGeometry args={[1.25, 0.05, 8, 64]} /></mesh>
      {Array.from({length: 8}, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + t * 0.1;
        return <mesh key={`m${i}`} position={[x + Math.sin(a) * 1.6, H + 2.1, z + Math.cos(a) * 1.6]} material={brassMat()}><boxGeometry args={[0.06, 2.4, 0.06]} /></mesh>;
      })}
      {glass ? <mesh position={[x, H + 2.1, z]} material={glassMat()}><cylinderGeometry args={[1.6, 1.6, 2.4, 48, 1, true]} /></mesh> : null}
      <mesh position={[x, H + 3.55, z]} material={cached('roof', () => { const m = new THREE.MeshBasicMaterial({color: PAL.stripe, toneMapped: false, fog: false}); m.userData.tone = 'ink'; return m; })}>
        <coneGeometry args={[1.9, 0.9, 32]} /></mesh>
      {/* the lamp, facing the lens (a painted disc), breathing 4 % */}
      {v > 0.05 ? <mesh position={[x, lampY, z]} rotation={[0, toCam, 0]} scale={0.9 * v * (1 + 0.04 * Math.sin(t * 3))} material={lampMat()} renderOrder={9}><planeGeometry args={[1, 1]} /></mesh> : null}
      {/* the Fresnel lens round the lamp, its painted rings turning so the highlights slide */}
      <mesh position={[x, lampY, z]} rotation={[0, toCam + t * 0.1, 0]} material={fresnelMat()} renderOrder={10}><planeGeometry args={[1.5, 1.5]} /></mesh>
      {fresnelFront ? (() => {
        const d = 0.55;                                                          // a card of rings just in front of the lens
        const dir = new THREE.Vector3(x - camPos[0], lampY - 0.4 - camPos[1], z - camPos[2]).normalize();
        const p = new THREE.Vector3(...camPos).addScaledVector(dir, d);
        return <mesh position={p} rotation={[0, Math.atan2(-dir.x, -dir.z), t * 0.1]} material={fresnelMat()} renderOrder={11}><planeGeometry args={[1.1, 1.1]} /></mesh>;
      })() : null}
      <pointLight position={[x, lampY, z]} color={violet > 0 ? '#c9a8ff' : '#ffe9bd'} intensity={3.5 * v} distance={6} decay={1.5} />
      {violet > 0 ? <mesh position={[x, lampY, z]} scale={3.2 * violet} renderOrder={8}><sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial color={PAL.violet} {...add} opacity={0.18 * violet} /></mesh> : null}
    </group>
  );
};

/** The ladder up the tower face to the ledge: two rails + rungs, ink with a mid edge (11_WORLD_build). */
export const Ladder: React.FC<{x: number; z: number; nx: number; nz: number; r: number; y0: number; y1: number}> = ({x, z, nx, nz, r: rr, y0, y1}) => {
  const ink = cached('inkbasic', () => { const m = new THREE.MeshBasicMaterial({color: PAL.ink, toneMapped: false, fog: false}); m.userData.tone = 'ink'; return m; });
  const px = x + nx * (rr + 0.12), pz = z + nz * (rr + 0.12);
  const sx = nz, sz = -nx;                                                        // sideways along the face
  const n = Math.floor((y1 - y0) / 0.3);
  return (
    <group>
      {[-0.22, 0.22].map((s) => <mesh key={s} position={[px + sx * s, (y0 + y1) / 2, pz + sz * s]} material={ink}><boxGeometry args={[0.05, y1 - y0, 0.05]} /></mesh>)}
      {Array.from({length: n}, (_, i) => <mesh key={i} position={[px, y0 + 0.15 + i * 0.3, pz]} rotation={[0, Math.atan2(sx, sz), 0]} material={ink}><boxGeometry args={[0.03, 0.03, 0.46]} /></mesh>)}
    </group>
  );
};

// ---------------------------------------------------------------- the deep

/** The surface ceiling seen from below (11_WORLD_build section 3): concentric ripple polygons in 3 steps, a caustic web
 *  of broken light lines; the beam enters as a hard wedge that sweeps across at each `beam` time. */
function ceilingMat() {
  return cached('ceiling', () => mat(canvasTexture('p_ceiling', 1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = PAL.ink; ctx.fillRect(0, 0, w, h);
    const c = w / 2;
    for (let k = 9; k > 0; k--) {
      ctx.fillStyle = k % 3 === 0 ? PAL.mid : k % 3 === 1 ? PAL.deep : '#0d1230';
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2, rr = (k / 9) * c * (0.92 + 0.08 * r(k * 41 + i)); i ? ctx.lineTo(c + Math.cos(a) * rr, c + Math.sin(a) * rr) : ctx.moveTo(c + Math.cos(a) * rr, c + Math.sin(a) * rr); }
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(170,182,236,0.45)'; ctx.lineWidth = 2;
    for (let i = 0; i < 220; i++) {                                              // the caustic web: broken short lines
      const x = r(i * 3) * w, y = r(i * 5) * h, a = r(i * 7) * Math.PI;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 26, y + Math.sin(a) * 26); ctx.stroke();
    }
    grain(ctx, w, h, 61);
  }), 'ink', {side: THREE.DoubleSide}));
}
function wedgeMat() {
  return cached('wedge', () => mat(canvasTexture('p_wedge', 256, 512, (ctx, w, h) => {
    [[0.5, 'rgba(255,184,96,0.30)'], [0.32, 'rgba(255,233,189,0.65)'], [0.14, PAL.core]].forEach(([k, col]) => {
      ctx.fillStyle = col as string; ctx.beginPath(); ctx.moveTo(w / 2 - w * (k as number) * 0.15, 0); ctx.lineTo(w / 2 + w * (k as number) * 0.15, 0);
      ctx.lineTo(w / 2 + w * (k as number), h); ctx.lineTo(w / 2 - w * (k as number), h); ctx.fill();
    });
  }), 'paper', {transparent: true, depthWrite: false, side: THREE.DoubleSide}));
}

export const PaintedDeep: React.FC<{o: Record<string, unknown>; f: number; fps: number; camPos: P3}> = ({o, f, fps, camPos}) => {
  const y = Number(o.ceiling_y ?? 14);
  const lit = Number(o.ceiling_light ?? 0);
  const beams = frames(o.ceiling_beam);
  return (
    <group>
      <mesh position={[camPos[0], y, camPos[2] - 10]} rotation={[Math.PI / 2, 0, (f / fps) * 0.02]} material={ceilingMat()} renderOrder={-6}>
        <planeGeometry args={[160, 160]} />
      </mesh>
      {lit > 0 ? <mesh position={[camPos[0], y - 0.05, camPos[2] - 10]} rotation={[Math.PI / 2, 0, 0]} renderOrder={-5}><planeGeometry args={[160, 160]} />
        <meshBasicMaterial color={PAL.mist} {...add} opacity={0.35 * lit} /></mesh> : null}
      {beams.map((b, k) => {
        const d = (f - b) / fps;                                                   // the wedge sweeps across over ~1.2 s
        if (d < -0.8 || d > 0.8) return null;
        return <mesh key={k} position={[camPos[0] + d * 40, y - 0.2, camPos[2] - 12]} rotation={[Math.PI / 2, 0, 0.6]} material={wedgeMat()} renderOrder={-4}>
          <planeGeometry args={[14, 60]} /></mesh>;
      })}
      {/* marine snow: flat specks with a dark lower edge, 3 sizes */}
      {Array.from({length: 70}, (_, i) => {
        const p: P3 = [camPos[0] + (r(i * 3) - 0.5) * 8, camPos[1] + (r(i * 5) - 0.5) * 5 - ((f / fps) * 0.1) % 1, camPos[2] - 0.3 - r(i * 7) * 4];
        return <mesh key={`s${i}`} position={p} scale={0.006 + r(i * 9) * 0.014} renderOrder={6}><circleGeometry args={[1, 8]} />
          <meshBasicMaterial color={PAL.mist} transparent opacity={0.2 + r(i) * 0.15} depthWrite={false} fog={false} /></mesh>;
      })}
    </group>
  );
};
