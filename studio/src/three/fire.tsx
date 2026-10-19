// FIRE - built, never generated (hard rule 8). Fire in Raymi's world is LIGHT: a flame of three crossed glowing planes
// (reads from every side the camera can travel), a hot white core, embers / steam bubbles rising, and a real point light
// that lights the set and her surroundings. Deterministic flicker from the frame only (all render workers agree).
// Used by any set through the shot options
//   fires: [{pos, size?, c?, core?, at?, grow?, out?, fade?, light?, dim?, uv?, uv2?, toss?}]   (Fires)
//   sparks: [{pos, at, n?, c?, ember?, size?, uv?}]                                         (Sparks: a strike)
// `uv` anchors a flame / burst to a point on HER sprite (u across, v from the top: her palm, her barb) - Film.tsx
// resolves it every frame, so the flame moves with her. `uv2` + `toss` (frames) = the flame jumps between two points
// (hand to hand) on an arc with a smear trail. `bend` (0..1, dir +-1) lays the flame over in a current.
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

export function glowTex(c: string): THREE.CanvasTexture {
  return canvasTexture(`fglow${c}`, 128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
}

/** A spark: a hot dot with a short streak (drawn along its velocity). */
function sparkTex(): THREE.CanvasTexture {
  return canvasTexture('spark', 64, 16, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.7, 'rgba(255,240,220,0.7)'); g.addColorStop(1, 'rgba(255,255,255,1)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(w / 2, h / 2, w / 2, h / 2.6, 0, 0, Math.PI * 2); ctx.fill();
  });
}

export const add = {transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide} as const;

/** One flame. size = height in metres; c = its colour (her violet by default), core = the hot base; seed varies it.
 *  bend 0..1 lays it over sideways (a current: dir +1 = blown to +x), dim 0..1 caps its brightness (vent_cap: the set's
 *  fires never outshine the hero flame). */
export const Flame: React.FC<{pos: P3; f: number; size?: number; c?: string; core?: string; seed?: number; light?: number; embers?: number;
  bend?: number; dir?: number; dim?: number}> = ({
  pos, f, size = 0.4, c = '#b45cff', core = '#ffd9a8', seed = 1, light = 1, embers = 10, bend = 0, dir = 1, dim = 1,
}) => {
  if (size <= 0.001 || dim <= 0.001) return null;
  const tex = flameTex(c, core);
  const halo = glowTex(c);
  const fl = 1 + 0.12 * Math.sin(f * 0.9 + seed) + 0.08 * Math.sin(f * 2.3 + seed * 3) + 0.05 * Math.sin(f * 5.1 + seed * 7);
  const sway = 0.08 * Math.sin(f / 9 + seed) - dir * bend * (1.15 + 0.12 * Math.sin(f * 1.3 + seed));   // a current lays it flat
  const tall = 1 - 0.35 * bend;                                                                         // ... and shorter
  const w = size * 0.55 * (1 + 0.25 * bend);
  return (
    <group position={pos}>
      <group rotation={[0, 0, sway]}>
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[0, (size * fl * tall) / 2, 0]} rotation={[0, (k * Math.PI) / 3, 0]} scale={[w * (1 + 0.06 * Math.sin(f * 1.7 + k)), size * fl * tall, 1]} renderOrder={9}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={tex} {...add} opacity={0.9 * dim} />
          </mesh>
        ))}
        {/* the hot inner tongue */}
        {[0, 1].map((k) => (
          <mesh key={`i${k}`} position={[0, size * 0.28 * fl * tall, 0]} rotation={[0, (k * Math.PI) / 2 + 0.4, 0]} scale={[w * 0.5, size * 0.56 * fl * tall, 1]} renderOrder={10}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={flameTex(core, '#ffffff')} {...add} opacity={0.6 * dim} />
          </mesh>
        ))}
      </group>
      {/* halo in the water around it */}
      <mesh position={[0, size * 0.4, 0]} scale={size * 2.6 * fl} renderOrder={8}>
        <sphereGeometry args={[0.5, 16, 12]} />
        <meshBasicMaterial map={halo} {...add} opacity={0.22 * dim} side={THREE.BackSide} />
      </mesh>
      {/* embers / steam: rise, drift (sideways in a current), fade */}
      {Array.from({length: embers}, (_, i) => {
        const life = 40 + rnd(seed + i) * 40;
        const t = ((f + rnd(seed + i * 3) * life) % life) / life;
        const r = size * 0.035 * (0.6 + rnd(seed + i * 5));
        return (
          <mesh key={`e${i}`} renderOrder={11}
            position={[(rnd(seed + i * 7) - 0.5) * w + 0.1 * size * Math.sin(f / 7 + i) + dir * bend * t * size * 3, size * (0.4 + t * 2.2 * (1 - 0.6 * bend)), (rnd(seed + i * 9) - 0.5) * w]} scale={r * (1 - t * 0.6)}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial color={i % 3 ? c : core} {...add} opacity={0.9 * (1 - t) * dim} />
          </mesh>
        );
      })}
      {light > 0 ? <pointLight position={[0, size * 0.5, 0]} color={c} intensity={light * 14 * size * fl * dim} distance={size * 9} decay={1.6} /> : null}
    </group>
  );
};

export type FireSpec = {pos: P3; size?: number; c?: string; core?: string; at?: number; grow?: number; out?: number; fade?: number;
  light?: number; dim?: number; uv?: [number, number]; uv2?: [number, number]; toss?: number | number[]};

/** How big a scheduled flame is at frame f (0 = not there): grows from `at` with a whoosh, dies at `out` over `fade`. */
export function fireScale(s: FireSpec, f: number): number {
  const at = typeof s.at === 'number' ? s.at : -Infinity;
  if (f < at) return 0;
  const g = Math.max(1, s.grow ?? 6);
  const t = Number.isFinite(at) ? Math.min(1, (f - at) / g) : 1;
  let k = t < 1 ? t * t * (3 - 2 * t) * (1 + 0.35 * Math.sin(t * Math.PI)) : 1;   // whoosh: overshoot then settle
  if (typeof s.out === 'number' && f >= s.out) {
    const d = Math.max(1, s.fade ?? 1);                                            // fade 1 = out in one frame (a kill)
    const u = (f - s.out) / d;
    if (u >= 1) return 0;
    k *= (1 - u) * (1 - u);                                                         // sucked back into a spark
  }
  return k;
}

/** Shot option `fires`: flames placed in any set; `at` = film frame it ignites (compiled from song seconds), `grow` =
 * frames to full size (a strike: small, then a whoosh); `out` + `fade` = it dies (a kill, a rewind). Anchored (`uv`)
 * fires are drawn by Film.tsx at her sprite point; this draws the world-placed ones. */
export const Fires: React.FC<{list: unknown; f: number; bend?: number; dir?: number; dim?: number; kill?: number}> = ({list, f, bend = 0, dir = 1, dim = 1, kill = 1}) => {
  if (!Array.isArray(list) || kill <= 0) return null;
  return (
    <group>
      {(list as FireSpec[]).map((s, i) => {
        if (s.uv) return null;
        const k = fireScale(s, f);
        if (k <= 0) return null;
        return <Flame key={i} pos={s.pos} f={f} size={(s.size ?? 0.4) * k} c={s.c} core={s.core} seed={i * 17 + 3} light={(s.light ?? 1) * kill}
          bend={bend} dir={dir} dim={(s.dim ?? 1) * dim * kill} />;
      })}
    </group>
  );
};

/** A flame that jumps between two points on an arc (tossed hand to hand) and leaves a smear trail of light. */
export const TossedFlame: React.FC<{a: THREE.Vector3; b: THREE.Vector3; tosses: number[]; f: number; size: number; c?: string; core?: string; seed?: number}> = ({a, b, tosses, f, size, c = '#b45cff', core, seed = 5}) => {
  const n = 7;                                                    // frames a toss takes
  const where = (ff: number): THREE.Vector3 => {
    const past = tosses.filter((t) => t <= ff);
    const last = past.length ? Math.max(...past) : -Infinity;
    const fromA = past.length % 2 === 1;                          // odd tosses fly a -> b
    const [p, q] = fromA ? [a, b] : [b, a];
    const u = Math.min(1, (ff - last) / n);
    if (!Number.isFinite(last) || u >= 1) return q.clone();
    const m = p.clone().lerp(q, u);
    m.y += Math.sin(Math.PI * u) * p.distanceTo(q) * 0.55;      // the arc over her head
    return m;
  };
  const now = where(f);
  const trail = Array.from({length: 6}, (_, i) => ({p: where(f - (i + 1) * 0.6), o: 0.5 * (1 - i / 6)}))
    .filter((t) => t.p.distanceTo(now) > 0.01);
  const halo = glowTex(c);
  return (
    <group>
      <Flame pos={[now.x, now.y, now.z]} f={f} size={size} c={c} core={core} seed={seed} />
      {trail.map((t, i) => (
        <mesh key={i} position={t.p} scale={size * (0.9 - i * 0.08)} renderOrder={9}>
          <sphereGeometry args={[0.5, 12, 8]} />
          <meshBasicMaterial map={halo} {...add} opacity={t.o} />
        </mesh>
      ))}
    </group>
  );
};

export type SparkSpec = {pos: P3; at: number; n?: number; c?: string; ember?: number; size?: number; uv?: [number, number]; seed?: number};

/** A strike: a flash, sparks flying out (they fall slowly in water and die in 8-16 frames), and a residual ember that
 *  glows on for `ember` frames (the script: every failed strike leaves a glow - never dead black). */
export const SparkBurst: React.FC<{s: SparkSpec; f: number; at?: P3}> = ({s, f, at}) => {
  const d = f - s.at;
  const emb = s.ember ?? 10;
  if (d < 0 || d > Math.max(18, emb)) return null;
  const pos = at ?? s.pos, n = s.n ?? 14, c = s.c ?? '#d9a6ff', size = s.size ?? 1, seed = s.seed ?? Math.round(s.at);
  const tex = sparkTex(), halo = glowTex(c);
  return (
    <group position={pos}>
      {d < 3 ? (
        <mesh scale={0.5 * size * (1 + d * 0.6)} renderOrder={12}>
          <sphereGeometry args={[0.5, 12, 8]} />
          <meshBasicMaterial map={halo} {...add} opacity={0.9 * (1 - d / 3)} side={THREE.BackSide} />
        </mesh>
      ) : null}
      {Array.from({length: n}, (_, i) => {
        const life = 8 + rnd(seed + i * 3) * 8;
        if (d > life) return null;
        const a = rnd(seed + i) * Math.PI * 2, e = (rnd(seed + i * 5) - 0.3) * 1.4;
        const v = (0.04 + rnd(seed + i * 7) * 0.05) * size;
        const drag = (1 - Math.exp(-d * 0.22)) / 0.22;              // water slows them fast
        const dx = Math.cos(a) * Math.cos(e) * v * drag, dy = Math.sin(e) * v * drag - 0.0008 * d * d, dz = Math.sin(a) * Math.cos(e) * v * drag;
        const ang = Math.atan2(Math.sin(e) - 0.05 * d, Math.cos(a) * Math.cos(e));
        return (
          <mesh key={i} position={[dx, dy, dz]} rotation={[0, 0, ang]} scale={[0.07 * size * (1 - d / life), 0.018 * size, 1]} renderOrder={12}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={tex} {...add} color={i % 3 ? '#ffffff' : c} opacity={1 - d / life} />
          </mesh>
        );
      })}
      {d <= emb ? (
        <group>
          <mesh scale={0.05 * size * (1 + 0.15 * Math.sin(d * 1.7))} renderOrder={12}>
            <sphereGeometry args={[0.5, 10, 8]} />
            <meshBasicMaterial color="#ffe6c4" {...add} opacity={1 - d / (emb + 1)} />
          </mesh>
          <mesh scale={0.35 * size} renderOrder={11}>
            <sphereGeometry args={[0.5, 12, 8]} />
            <meshBasicMaterial map={halo} {...add} opacity={0.5 * (1 - d / (emb + 1))} side={THREE.BackSide} />
          </mesh>
          <pointLight color={c} intensity={3.5 * size * (1 - d / (emb + 1))} distance={2.2 * size} decay={1.6} />
        </group>
      ) : null}
    </group>
  );
};

/** Shot option `sparks`: strikes placed in the world (anchored ones are drawn by Film.tsx). */
export const Sparks: React.FC<{list: unknown; f: number}> = ({list, f}) => {
  if (!Array.isArray(list)) return null;
  return <group>{(list as SparkSpec[]).map((s, i) => (s.uv ? null : <SparkBurst key={i} s={{seed: i * 13 + 2, ...s}} f={f} />))}</group>;
};
