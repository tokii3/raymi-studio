// Creatures and props of the deep (FIRESTARTER build list, reusable by every set): deep-sea fish whose fins glow at the
// edges when a light reaches them (one may carry off a spark), a school that swims along a path, fish sitting round a
// hot vent in tiny towels (the sauna), and Salmon - her best friend - as an actor with a prop: the bucket (one of her
// knick-knacks; water into water), the fire extinguisher (it sprays ... bubbles), the bucket of glowing water (the toast).
// Built, never generated (hard rule 8); deterministic and frame-driven. Shot options (times in song s, compiled to frames
// by raymi/timeline.py; positions are marks or [x, y, z]):
//   fish:   [{from, to, at, dur_s, c?, glow?, scale?, spark?, wave?}]      one fish swimming from -> to (glow = fin edges lit)
//           [{pos, r?, speed?, phase?, ...}]                              or circling a point
//   school: {from, to, at, dur_s, n?, spread?, glow?, scale?}              a school swimming along a line together
//   sauna:  {pos, n?, r?, glow?}                                           fish round a vent in towels (+ eye shells on the boss)
//   salmon: {pos, from?, at?, dur_s?, hold?, water?, tip_at?, spray_at?, spray_s?, jump_at?, singe_at?, cover_at?,
//            toast_at?, icon?, icon_at?, yaw?, scale?}
//   props:  [{kind: bucket | extinguisher | towel, pos, rot?, scale?, buried?, water?}]
import React from 'react';
import * as THREE from 'three';
import {Bubbles, RBox} from './parts';
import {blobTexture, canvasTexture, rnd, toon} from './look';
import {ease} from '../film/motion';
import {add, glowTex} from './fire';

type P3 = [number, number, number];
const lerp3 = (a: P3, b: P3, t: number): P3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** Where a scheduled swimmer is: from -> to between at and at + dur (frames); before = at `from`, after = at `to`. */
function along(from: P3, to: P3, at: number, dur: number, f: number): {p: P3; yaw: number; moving: boolean} {
  const t = ease('inOut', (f - at) / Math.max(1, dur));
  return {p: lerp3(from, to, t), yaw: -Math.atan2(to[2] - from[2], to[0] - from[0]), moving: f > at && f < at + dur};
}

// ---------------------------------------------------------------- a deep-sea fish (hatchetfish / lanternfish, stylised)
/** Dark body, a big pale eye, belly photophores; `glow` lights the fin edges (her fire reached it). Head = +x. */
export const DeepFish: React.FC<{pos: P3; yaw?: number; f: number; c?: string; glow?: string | null; scale?: number; seed?: number; spark?: boolean}> = ({
  pos, yaw = 0, f, c = '#1d1a33', glow = null, scale = 0.3, seed = 1, spark = false,
}) => {
  const wig = Math.sin(f * 0.55 + seed * 2) * 0.45;
  const g = glow ?? '#2a2840';
  const fin = toon(glow ? '#3a2a55' : '#26233d', g, glow ? 1.1 : 0.1, {side: THREE.DoubleSide});
  const edge = glow ? <meshBasicMaterial color={glow} {...add} opacity={0.95} /> : null;
  const tri = (k: string, p: P3, r: P3, s: [number, number], withEdge: boolean) => (
    <group key={k} position={p} rotation={r}>
      <mesh material={fin} scale={[s[0], s[1], 1]}><circleGeometry args={[0.5, 3]} /></mesh>
      {withEdge && edge ? <mesh scale={[s[0] * 1.18, s[1] * 1.18, 1]} position={[0, 0, -0.002]} renderOrder={9}><ringGeometry args={[0.42, 0.5, 3]} />{edge}</mesh> : null}
    </group>
  );
  return (
    <group position={pos} rotation={[0, yaw, 0]} scale={scale}>
      <mesh material={toon(c, '#0a0814', 0.4)} scale={[1, 0.55, 0.28]} castShadow><sphereGeometry args={[0.5, 16, 12]} /></mesh>
      {/* the big eye of the deep */}
      <mesh position={[0.3, 0.07, 0.11]} material={toon('#e9e4ff', '#9ea0ff', 0.5)}><sphereGeometry args={[0.075, 12, 10]} /></mesh>
      <mesh position={[0.33, 0.07, 0.17]} material={toon('#0b0716')}><sphereGeometry args={[0.04, 10, 8]} /></mesh>
      {/* photophores along the belly */}
      {Array.from({length: 6}, (_, i) => (
        <mesh key={i} position={[0.25 - i * 0.1, -0.2 + 0.02 * Math.sin(i), 0.11]}><sphereGeometry args={[0.018, 6, 5]} />
          <meshBasicMaterial color={glow ?? '#7fd8ff'} toneMapped={false} /></mesh>
      ))}
      {tri('dorsal', [-0.05, 0.3, 0], [0, 0, 0.35], [0.38, 0.32], true)}
      {tri('anal', [-0.15, -0.27, 0], [0, 0, Math.PI - 0.3], [0.26, 0.2], true)}
      {tri('pect', [0.1, -0.06, 0.15], [0.3, 0.5, -1.2 + 0.3 * Math.sin(f * 0.4 + seed)], [0.18, 0.14], true)}
      <group position={[-0.48, 0, 0]} rotation={[0, wig, 0]}>
        {tri('tail', [-0.16, 0, 0], [0, 0, Math.PI / 2], [0.42, 0.34], true)}
      </group>
      {glow ? (
        <mesh scale={1.6} renderOrder={8}><sphereGeometry args={[0.5, 12, 8]} />
          <meshBasicMaterial map={glowTex(glow)} {...add} opacity={0.18} side={THREE.BackSide} /></mesh>
      ) : null}
      {spark ? (
        <group position={[-0.1, 0.42, 0]}>
          <mesh scale={0.14}><sphereGeometry args={[0.5, 10, 8]} /><meshBasicMaterial color="#fff0dc" {...add} /></mesh>
          <mesh scale={1.2} renderOrder={9}><sphereGeometry args={[0.5, 12, 8]} /><meshBasicMaterial map={glowTex(glow ?? '#b45cff')} {...add} opacity={0.6} side={THREE.BackSide} /></mesh>
          <pointLight color={glow ?? '#b45cff'} intensity={2.2} distance={2.6} decay={1.5} />
        </group>
      ) : null}
    </group>
  );
};

export type FishSpec = {from?: P3; to?: P3; at?: number; dur_s?: number; pos?: P3; r?: number; speed?: number; phase?: number;
  c?: string; glow?: string | null; scale?: number; spark?: boolean};

export const FishList: React.FC<{list: unknown; f: number; fps: number}> = ({list, f, fps}) => {
  if (!Array.isArray(list)) return null;
  return (
    <group>
      {(list as FishSpec[]).map((s, i) => {
        if (s.from && s.to) {
          const a = along(s.from, s.to, s.at ?? 0, (s.dur_s ?? 2) * fps, f);
          const bob = 0.05 * Math.sin(f / 9 + i);
          return <DeepFish key={i} pos={[a.p[0], a.p[1] + bob, a.p[2]]} yaw={a.yaw} f={f} c={s.c} glow={s.glow} scale={s.scale} seed={i + 1} spark={s.spark} />;
        }
        const c = s.pos ?? [0, 1, 0], r = s.r ?? 1.2, sp = s.speed ?? 0.012, ph = s.phase ?? i * 1.7;
        const a = ph + f * sp;
        const p: P3 = [c[0] + Math.cos(a) * r, c[1] + 0.12 * Math.sin(a * 2.3), c[2] + Math.sin(a) * r * 0.7];
        const yaw = Math.atan2(-Math.cos(a) * 0.7, -Math.sin(a)) * (sp > 0 ? 1 : -1);
        return <DeepFish key={i} pos={p} yaw={yaw + (sp > 0 ? 0 : Math.PI)} f={f} c={s.c} glow={s.glow} scale={s.scale} seed={i + 1} spark={s.spark} />;
      })}
    </group>
  );
};

export type SchoolSpec = {from: P3; to: P3; at?: number; dur_s?: number; n?: number; spread?: number; glow?: string | null; scale?: number; c?: string};

/** A school: n fish keeping loose formation around a centre that swims from -> to (the fire-finned crowd). */
export const School: React.FC<{s: SchoolSpec; f: number; fps: number}> = ({s, f, fps}) => {
  const n = s.n ?? 12, sp = s.spread ?? 1.2;
  const a = along(s.from, s.to, s.at ?? 0, (s.dur_s ?? 3) * fps, f);
  return (
    <group>
      {Array.from({length: n}, (_, i) => {
        const o: P3 = [(rnd(i * 3 + 1) - 0.5) * sp * 2, (rnd(i * 5 + 2) - 0.5) * sp, (rnd(i * 7 + 3) - 0.5) * sp * 1.4];
        const w = 0.12 * Math.sin(f / 11 + i * 1.3);
        return <DeepFish key={i} pos={[a.p[0] + o[0] + w, a.p[1] + o[1] + 0.08 * Math.sin(f / 7 + i), a.p[2] + o[2]]} yaw={a.yaw + 0.15 * Math.sin(f / 17 + i)}
          f={f + i * 5} c={s.c} glow={s.glow} scale={(s.scale ?? 0.26) * (0.8 + 0.4 * rnd(i + 9))} seed={i + 3} />;
      })}
    </group>
  );
};

// ---------------------------------------------------------------- props
/** A metal bucket (one of her knick-knacks): tapered pail, rim, handle; `water` = filled with glowing water (the toast);
 *  `buried` 0..1 sinks it into the sand on its side. */
export const Bucket: React.FC<{pos: P3; rot?: P3; scale?: number; water?: string | null; tip?: number}> = ({pos, rot = [0, 0, 0], scale = 1, water = null, tip = 0}) => (
  <group position={pos} rotation={rot} scale={scale}>
    <group rotation={[0, 0, -tip * 1.9]}>
      <mesh position={[0, 0.14, 0]} material={toon('#8f98b8', '#2a3048', 0.2, {side: THREE.DoubleSide})} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.115, 0.28, 24, 1, true]} />
      </mesh>
      <mesh position={[0, 0.001, 0]} material={toon('#6f7898')} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.115, 24]} /></mesh>
      <mesh position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]} material={toon('#b9c0dc')}><torusGeometry args={[0.15, 0.008, 6, 28]} /></mesh>
      {[0.09, 0.2].map((y) => <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={toon('#a7afcc')}><torusGeometry args={[0.15 - (0.28 - y) * 0.12, 0.004, 4, 28]} /></mesh>)}
      <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0]} material={toon('#5a6280')}><torusGeometry args={[0.15, 0.006, 6, 20, Math.PI]} /></mesh>
      {water ? (
        <group position={[0, 0.25, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.142, 24]} /><meshBasicMaterial color={water} toneMapped={false} /></mesh>
          <mesh scale={0.9} position={[0, 0.1, 0]} renderOrder={8}><sphereGeometry args={[0.5, 12, 8]} /><meshBasicMaterial map={glowTex(water)} {...add} opacity={0.5} side={THREE.BackSide} /></mesh>
          <pointLight color={water} intensity={2.4} distance={2.4} decay={1.5} position={[0, 0.15, 0]} />
        </group>
      ) : null}
    </group>
  </group>
);

/** A red fire extinguisher: body, shoulders, valve, hose, nozzle; `spray` 0..1 = it sprays (a cloud of bubbles). */
export const Extinguisher: React.FC<{pos: P3; rot?: P3; scale?: number; spray?: number; f?: number}> = ({pos, rot = [0, 0, 0], scale = 1, spray = 0, f = 0}) => (
  <group position={pos} rotation={rot} scale={scale}>
    <mesh position={[0, 0.2, 0]} material={toon('#d8343f', '#3a0610', 0.25)} castShadow><cylinderGeometry args={[0.075, 0.075, 0.4, 20]} /></mesh>
    <mesh position={[0, 0.4, 0]} material={toon('#d8343f', '#3a0610', 0.25)}><sphereGeometry args={[0.075, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
    <mesh position={[0, 0.12, 0.076]} material={toon('#f2efe6')}><planeGeometry args={[0.09, 0.12]} /></mesh>
    <RBox size={[0.05, 0.05, 0.05]} pos={[0, 0.49, 0]} r={0.01} c="#2b2b33" />
    <RBox size={[0.13, 0.02, 0.03]} pos={[0.04, 0.53, 0]} rot={[0, 0, 0.2]} r={0.008} c="#1d1d24" />
    <mesh position={[0.06, 0.45, 0]} rotation={[0, 0, -0.9]} material={toon('#1d1d24')}><cylinderGeometry args={[0.01, 0.01, 0.16, 8]} /></mesh>
    <mesh position={[0.13, 0.4, 0]} rotation={[0, 0, -Math.PI / 2]} material={toon('#1d1d24')}><coneGeometry args={[0.022, 0.06, 10]} /></mesh>
    {spray > 0 ? <group position={[0.16, 0.4, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <Bubbles pos={[0, 0, 0]} f={f * 3} n={Math.round(40 * spray)} h={1.1} spread={0.35 * spray} seed={77} size={0.03} c="#e8fbff" />
    </group> : null}
  </group>
);

/** A tiny towel (folded, or draped over a fish's head) and a shell (a spa eye pad). */
export const Towel: React.FC<{pos: P3; rot?: P3; scale?: number; c?: string}> = ({pos, rot = [0, 0, 0], scale = 1, c = '#f4eefa'}) => (
  <group position={pos} rotation={rot} scale={scale}>
    <RBox size={[0.16, 0.025, 0.1]} pos={[0, 0, 0]} r={0.01} c={c} />
    <mesh position={[0, 0.013, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon('#c9a6ff')}><planeGeometry args={[0.16, 0.012]} /></mesh>
  </group>
);

const EyeShell: React.FC<{pos: P3}> = ({pos}) => (
  <mesh position={pos} rotation={[0, Math.PI / 2, 0]} material={toon('#ffd9e8', '#5a2a40', 0.15)}>
    <sphereGeometry args={[0.07, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2.4]} />
  </mesh>
);

export type PropSpec = {kind: 'bucket' | 'extinguisher' | 'towel'; pos: P3; rot?: P3; scale?: number; buried?: number; water?: string};

export const PropList: React.FC<{list: unknown; f: number}> = ({list, f}) => {
  if (!Array.isArray(list)) return null;
  return (
    <group>
      {(list as PropSpec[]).map((p, i) => {
        const b = p.buried ?? 0;
        const pos: P3 = [p.pos[0], p.pos[1] - b * 0.18, p.pos[2]];
        const rot: P3 = p.rot ?? (b > 0 ? [0.2, 0.6, 1.25] : [0, 0, 0]);
        if (p.kind === 'bucket') return <Bucket key={i} pos={pos} rot={rot} scale={p.scale} water={p.water} />;
        if (p.kind === 'extinguisher') return <Extinguisher key={i} pos={pos} rot={rot} scale={p.scale} f={f} />;
        return <Towel key={i} pos={pos} rot={rot} scale={p.scale} />;
      })}
    </group>
  );
};

// ---------------------------------------------------------------- the sauna
/** Fish sitting round a hot vent in tiny towels, steam rising; the boss in front with a towel on its head and a shell
 *  over each eye, like at a spa. */
export const Sauna: React.FC<{pos: P3; f: number; n?: number; r?: number; glow?: string | null}> = ({pos, f, n = 7, r = 0.95, glow = '#ffb35c'}) => (
  <group position={pos}>
    {Array.from({length: n}, (_, i) => {
      const a = Math.PI * 0.15 + (i / Math.max(1, n - 1)) * Math.PI * 0.7;      // a half ring facing the lens (+z)
      const boss = i === Math.floor(n / 2);
      const rr = boss ? r * 1.25 : r;
      const p: P3 = [Math.cos(a) * rr, 0.16 + 0.02 * Math.sin(f / 23 + i), Math.sin(a) * rr];
      const yaw = Math.atan2(p[2], -p[0]) + Math.PI;                              // head toward the vent
      const s = boss ? 0.62 : 0.42 + 0.06 * rnd(i);              // big enough to read the towels (stills run 2)
      return (
        <group key={i}>
          <DeepFish pos={p} yaw={yaw} f={f * 0.25} glow={glow} scale={s} seed={i + 20} />
          <Towel pos={[p[0], p[1] - s * 0.18, p[2]]} rot={[0, -yaw, 0]} scale={s * 3.4} c={i % 3 === 1 ? '#ffd6e6' : '#f4eefa'} />
          {boss ? (
            <group position={p} rotation={[0, yaw, 0]}>
              <Towel pos={[0.02, s * 0.3, 0]} rot={[0, 0, 0.12]} scale={s * 3} />
              <EyeShell pos={[s * 0.31, s * 0.08, s * 0.11]} />
              <EyeShell pos={[s * 0.31, s * 0.08, -s * 0.11]} />
            </group>
          ) : null}
        </group>
      );
    })}
    {/* steam rising off the hot stones */}
    {Array.from({length: 10}, (_, i) => {
      const life = 120, t = ((f + rnd(i + 3) * life) % life) / life;
      return (
        <mesh key={`st${i}`} position={[(rnd(i) - 0.5) * r * 1.6 + 0.2 * Math.sin(t * 5 + i), 0.3 + t * 2.2, (rnd(i + 5) - 0.2) * r]} scale={0.25 + t * 0.9} renderOrder={7}>
          <sphereGeometry args={[0.5, 10, 8]} />
          <meshBasicMaterial map={blobTexture('#f6e6ff')} transparent opacity={0.16 * (1 - t) * Math.min(1, t * 5)} depthWrite={false} />
        </mesh>
      );
    })}
  </group>
);

// ---------------------------------------------------------------- Salmon, the fire fighter
/** Salmon's body (the same salmon as in the aquarium: salmon-coloured, pale belly). Head = +x, 0.42 m long. */
export const SalmonBody: React.FC<{f: number; cover?: number; jump?: number}> = ({f, cover = 0, jump = 0}) => {
  const wig = Math.sin(f * 0.5) * 0.4 * (1 + jump);
  return (
    <group>
      <mesh material={toon('#ff8f6b')} castShadow scale={[1, 0.5, 0.3]}><sphereGeometry args={[0.5, 16, 12]} /></mesh>
      <mesh material={toon('#ffc3a8')} position={[0, -0.08, 0]} scale={[0.85, 0.25, 0.28]}><sphereGeometry args={[0.5, 12, 8]} /></mesh>
      <group position={[-0.48, 0, 0]} rotation={[0, wig, 0]}>
        <mesh position={[-0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={toon('#e86d52')} scale={[1, 1, 0.25]}><coneGeometry args={[0.24, 0.34, 3]} /></mesh>
      </group>
      <mesh position={[0.32, 0.06, 0.13]} material={toon('#140b24')}><sphereGeometry args={[0.04, 8, 6]} /></mesh>
      <mesh position={[0.32, 0.06, -0.13]} material={toon('#140b24')}><sphereGeometry args={[0.04, 8, 6]} /></mesh>
      {/* pectoral fins: down at rest, raised over the eyes when it covers them */}
      {[1, -1].map((side) => (
        <mesh key={side} position={[0.18 + 0.1 * cover, -0.06 + 0.14 * cover, side * 0.15]}
          rotation={[side * (0.4 + 0.9 * cover), 0, -0.6 + 1.5 * cover]} material={toon('#e86d52', '#000000', 1, {side: THREE.DoubleSide})} scale={[0.16, 0.1, 1]}>
          <circleGeometry args={[0.5, 3]} />
        </mesh>
      ))}
    </group>
  );
};

export type SalmonSpec = {pos: P3; from?: P3; at?: number; dur_s?: number; hold?: 'bucket' | 'extinguisher' | null; water?: string | null;
  tip_at?: number; spray_at?: number; spray_s?: number; jump_at?: number; singe_at?: number; cover_at?: number[]; toast_at?: number;
  icon?: string; icon_at?: number; yaw?: number; scale?: number;
  // POV Shorts (2026-10-23): press_at (frame) = he presses his face to the glass in front of him (squish + a bump);
  // costume 'raymi' = he is dressed as HER (oversized tako ears, a stingray-barb tail, an ultraviolet ruffle)
  press_at?: number; costume?: 'raymi' | null};

/** Salmon dressed as Raymi (Halloween): oversized tako ears on his head, her ultraviolet ruffle around his middle,
 *  a thin tail with a stingray barb (in SalmonBody units: head at +x, up +y). */
const RaymiCostume: React.FC<{f: number}> = ({f}) => {
  const wag = Math.sin(f * 0.25) * 0.25;
  return (
    <group>
      {[-1, 1].map((sd) => (
        <group key={sd} position={[0.2, 0.26, sd * 0.1]}>
          <mesh material={toon('#2a1748')} scale={[1, 0.85, 1]} castShadow><sphereGeometry args={[0.09, 14, 10]} /></mesh>
          <mesh position={[0, 0.05, 0]} material={toon('#9b5cff', '#5a22c8', 0.6)}><sphereGeometry args={[0.03, 10, 8]} /></mesh>
        </group>
      ))}
      {/* the ultraviolet ruffle: two stacked frills */}
      {[0, 1].map((k) => (
        <mesh key={k} position={[-0.05 - k * 0.04, -0.02 - k * 0.02, 0]} rotation={[0, 0, Math.PI / 2]} material={toon(k ? '#c9a8ff' : '#7a3cf0', '#000', 1, {side: THREE.DoubleSide})}>
          <coneGeometry args={[0.2 - k * 0.03, 0.12, 14, 1, true]} />
        </mesh>
      ))}
      <group position={[-0.5, 0, 0]} rotation={[0, wag, 0]}>
        <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={toon('#2a1748')}><cylinderGeometry args={[0.012, 0.02, 0.4, 6]} /></mesh>
        <mesh position={[-0.42, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={toon('#9b5cff')} scale={[1, 1, 0.3]}><coneGeometry args={[0.05, 0.1, 3]} /></mesh>
      </group>
    </group>
  );
};

/** A little 3D reaction mark over Salmon's head (sweat / heart / !), facing the lens. */
function iconTex(kind: string): THREE.CanvasTexture {
  return canvasTexture(`sicon${kind}`, 128, 128, (ctx, w, h) => {
    ctx.lineWidth = 8; ctx.strokeStyle = '#1a0b33'; ctx.lineJoin = 'round';
    ctx.beginPath();
    if (kind === 'heart') {
      ctx.moveTo(64, 110); ctx.bezierCurveTo(10, 72, 2, 40, 26, 22); ctx.bezierCurveTo(44, 8, 60, 18, 64, 34);
      ctx.bezierCurveTo(68, 18, 84, 8, 102, 22); ctx.bezierCurveTo(126, 40, 118, 72, 64, 110); ctx.fillStyle = '#ff6fb5';
    } else if (kind === '!') {
      ctx.roundRect(50, 8, 28, 74, 12); ctx.fillStyle = '#ffd34d'; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(64, 104, 13, 0, Math.PI * 2);
    } else {
      ctx.moveTo(64, 8); ctx.bezierCurveTo(84, 40, 98, 60, 98, 80); ctx.arc(64, 80, 34, 0, Math.PI); ctx.bezierCurveTo(30, 60, 44, 40, 64, 8); ctx.fillStyle = '#8fd8ff';
    }
    ctx.fill(); ctx.stroke();
  });
}

export const SalmonActor: React.FC<{s: SalmonSpec; f: number; fps: number; camPos?: P3}> = ({s, f, fps, camPos}) => {
  let p: P3 = s.pos, yaw = s.yaw ?? 0;
  if (s.from) {
    const a = along(s.from, s.pos, s.at ?? 0, (s.dur_s ?? 1) * fps, f);
    p = a.p;
    if (s.yaw === undefined) yaw = a.yaw;
  } else if (s.yaw === undefined && camPos) yaw = -Math.atan2(camPos[2] - p[2], camPos[0] - p[0]) * 0.35;   // a 3/4 view toward the lens
  const since = (t?: number) => (typeof t === 'number' ? f - t : -1);
  const dj = since(s.jump_at);
  const jump = dj >= 0 && dj < 14 ? Math.sin((dj / 14) * Math.PI) : 0;
  const ds = since(s.singe_at);
  const cov = Array.isArray(s.cover_at) && s.cover_at.length >= 1 && f >= s.cover_at[0] && (s.cover_at.length < 2 || f < s.cover_at[1]) ? 1 : 0;
  const dt = since(s.tip_at);
  const tip = dt >= 0 ? ease('snap', dt / 6) : 0;                 // the throw: the bucket swings over
  const dsp = since(s.spray_at);
  const spray = dsp >= 0 && dsp < (s.spray_s ?? 1.2) * fps ? 1 : 0;
  const dto = since(s.toast_at);
  const toast = dto >= 0 && dto < 16 ? Math.sin((dto / 16) * Math.PI) : 0;
  const di = s.icon ? since(s.icon_at ?? -Infinity) : -1;
  const sc = s.scale ?? 1;
  const dp = since(s.press_at);
  const press = dp >= 0 ? Math.min(1, dp / 4) * (dp < 8 ? 1 + 0.2 * Math.sin((dp / 8) * Math.PI) : 1) : 0;
  return (
    <group position={[p[0], p[1] + 0.04 * Math.sin(f / 13) + 0.35 * jump, p[2]]} scale={sc}>
      <group rotation={[0, yaw, 0.25 * jump - 0.25 * tip]}>
        <group scale={0.42}>
          <group scale={[1 - 0.12 * press, 1 + 0.08 * press, 1 + 0.1 * press]} position={[0.06 * press, 0, 0]}><SalmonBody f={f} cover={cov} jump={jump} /></group>
          {s.costume === 'raymi' ? <RaymiCostume f={f} /> : null}
        </group>
        {/* the held prop rides in front of its pectoral fins */}
        {s.hold === 'bucket' ? <Bucket pos={[0.17, -0.2 + 0.12 * toast, 0.0]} rot={[0, 0, 0]} scale={0.75} water={s.water ?? null} tip={tip} /> : null}
        {s.hold === 'extinguisher' ? <Extinguisher pos={[0.13, -0.24, 0.04]} rot={[0, 0, -0.5]} scale={0.6} spray={spray} f={f} /> : null}
      </group>
      {/* singed fin: a thread of smoke from the tail */}
      {ds >= 0 && ds < 60 ? Array.from({length: 6}, (_, i) => {
        const t = ((ds + i * 6) % 36) / 36;
        return <mesh key={i} position={[-0.22 + 0.05 * Math.sin(t * 6 + i), 0.05 + t * 0.6, 0]} scale={0.04 + t * 0.12} renderOrder={7}>
          <sphereGeometry args={[0.5, 8, 6]} />
          <meshBasicMaterial map={blobTexture('#8a7f99')} transparent opacity={0.5 * (1 - t) * (1 - ds / 60)} depthWrite={false} />
        </mesh>;
      }) : null}
      {s.icon && di >= 0 && di < 60 ? (
        <mesh position={[0.05, 0.36 + 0.02 * Math.sin(di / 4), 0]} rotation={[0, camPos ? Math.atan2(camPos[0] - p[0], camPos[2] - p[2]) : 0, 0.1 * Math.sin(di / 5)]}
          scale={0.17 * Math.min(1, di / 4)} renderOrder={12}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={iconTex(s.icon)} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Everything of this file a set draws from its shot options. */
export const DeepLife: React.FC<{opts: Record<string, unknown>; f: number; fps: number; camPos?: P3}> = ({opts, f, fps, camPos}) => (
  <group>
    <FishList list={opts.fish} f={f} fps={fps} />
    {opts.school ? <School s={opts.school as SchoolSpec} f={f} fps={fps} /> : null}
    {opts.sauna ? <Sauna {...(opts.sauna as {pos: P3; n?: number; r?: number; glow?: string})} f={f} /> : null}
    {opts.salmon ? <SalmonActor s={opts.salmon as SalmonSpec} f={f} fps={fps} camPos={camPos} /> : null}
    <PropList list={opts.props} f={f} />
  </group>
);
