// FIRE - built, never generated (hard rule 8). Fire in Raymi's world is LIGHT: a flame of three crossed glowing planes
// (reads from every side the camera can travel), a hot white core, embers / steam bubbles rising, and a real point light
// that lights the set and her surroundings. Deterministic flicker from the frame only (all render workers agree).
// Used by any set through the shot option `fires: [{pos, size?, c?, at?, grow?}]` (Fires) or directly (Flame).
import React from 'react';
import * as THREE from 'three';
import {canvasTexture, rnd} from './look';

type P3 = [number, number, number];

/** A flame-shaped glow texture: teardrop, soft edge, colour ramp from core to tip (cached per colour pair). */
function flameTex(c: string, core: string): THREE.CanvasTexture {
  return canvasTexture(`flame${c}${core}`, 128, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const path = new Path2D();
    path.moveTo(w / 2, h * 0.02);
    path.bezierCurveTo(w * 0.62, h * 0.3, w * 0.98, h * 0.55, w * 0.9, h * 0.76);
    path.bezierCurveTo(w * 0.82, h * 0.97, w * 0.18, h * 0.97, w * 0.1, h * 0.76);
    path.bezierCurveTo(w * 0.02, h * 0.55, w * 0.38, h * 0.3, w / 2, h * 0.02);
    ctx.save();
    ctx.filter = 'blur(6px)';
    const g = ctx.createLinearGradient(0, h, 0, 0);
    g.addColorStop(0, core); g.addColorStop(0.35, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fill(path);
    ctx.restore();
    const r = ctx.createRadialGradient(w / 2, h * 0.74, 0, w / 2, h * 0.74, w * 0.34);
    r.addColorStop(0, 'rgba(255,255,255,0.6)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = r; ctx.fillRect(0, 0, w, h);
  });
}

function glowTex(c: string): THREE.CanvasTexture {
  return canvasTexture(`fglow${c}`, 128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
}

const add = {transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide} as const;

/** One flame. size = height in metres; c = its colour (her violet by default), core = the hot base; seed varies it. */
export const Flame: React.FC<{pos: P3; f: number; size?: number; c?: string; core?: string; seed?: number; light?: number; embers?: number}> = ({
  pos, f, size = 0.4, c = '#b45cff', core = '#ffd9a8', seed = 1, light = 1, embers = 10,
}) => {
  if (size <= 0.001) return null;
  const tex = flameTex(c, core);
  const halo = glowTex(c);
  const fl = 1 + 0.12 * Math.sin(f * 0.9 + seed) + 0.08 * Math.sin(f * 2.3 + seed * 3) + 0.05 * Math.sin(f * 5.1 + seed * 7);
  const sway = 0.08 * Math.sin(f / 9 + seed);
  const w = size * 0.55;
  return (
    <group position={pos}>
      {[0, 1, 2].map((k) => (
        <mesh key={k} position={[0, (size * fl) / 2, 0]} rotation={[0, (k * Math.PI) / 3, sway]} scale={[w * (1 + 0.06 * Math.sin(f * 1.7 + k)), size * fl, 1]} renderOrder={9}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={tex} {...add} opacity={0.9} />
        </mesh>
      ))}
      {/* the hot inner tongue */}
      {[0, 1].map((k) => (
        <mesh key={`i${k}`} position={[0, size * 0.28 * fl, 0]} rotation={[0, (k * Math.PI) / 2 + 0.4, -sway]} scale={[w * 0.5, size * 0.56 * fl, 1]} renderOrder={10}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={flameTex(core, '#ffffff')} {...add} opacity={0.6} />
        </mesh>
      ))}
      {/* halo in the water around it */}
      <mesh position={[0, size * 0.4, 0]} scale={size * 2.6 * fl} renderOrder={8}>
        <sphereGeometry args={[0.5, 16, 12]} />
        <meshBasicMaterial map={halo} {...add} opacity={0.22} side={THREE.BackSide} />
      </mesh>
      {/* embers / steam: rise, drift, fade */}
      {Array.from({length: embers}, (_, i) => {
        const life = 40 + rnd(seed + i) * 40;
        const t = ((f + rnd(seed + i * 3) * life) % life) / life;
        const r = size * 0.035 * (0.6 + rnd(seed + i * 5));
        return (
          <mesh key={`e${i}`} renderOrder={11}
            position={[(rnd(seed + i * 7) - 0.5) * w + 0.1 * size * Math.sin(f / 7 + i), size * (0.4 + t * 2.2), (rnd(seed + i * 9) - 0.5) * w]} scale={r * (1 - t * 0.6)}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial color={i % 3 ? c : core} {...add} opacity={0.9 * (1 - t)} />
          </mesh>
        );
      })}
      {light > 0 ? <pointLight position={[0, size * 0.5, 0]} color={c} intensity={light * 14 * size * fl} distance={size * 9} decay={1.6} /> : null}
    </group>
  );
};

export type FireSpec = {pos: P3; size?: number; c?: string; core?: string; at?: number; grow?: number; light?: number};

/** Shot option `fires`: flames placed in any set; `at` = film frame it ignites (compiled from song seconds), `grow` =
 * frames to full size (a strike: small, then a whoosh). */
export const Fires: React.FC<{list: unknown; f: number}> = ({list, f}) => {
  if (!Array.isArray(list)) return null;
  return (
    <group>
      {(list as FireSpec[]).map((s, i) => {
        const at = typeof s.at === 'number' ? s.at : -Infinity;
        if (f < at) return null;
        const g = Math.max(1, s.grow ?? 6);
        const t = Number.isFinite(at) ? Math.min(1, (f - at) / g) : 1;
        const pop = t < 1 ? t * t * (3 - 2 * t) * (1 + 0.35 * Math.sin(t * Math.PI)) : 1;   // whoosh: overshoot then settle
        return <Flame key={i} pos={s.pos} f={f} size={(s.size ?? 0.4) * pop} c={s.c} core={s.core} seed={i * 17 + 3} light={s.light ?? 1} />;
      })}
    </group>
  );
};
