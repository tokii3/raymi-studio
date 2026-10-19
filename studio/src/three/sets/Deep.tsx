// SET deep - "The Lamp in the Dark": the abyss, 4,000 m down. Black basalt floor, pillow rocks, black-smoker chimneys
// (hydrothermal vents - the only real fire on the sea floor), a network of cracks that glow when the fire reaches them,
// mineral smoke, marine snow. Dark by default: only what burns lights the place (clean frame, PRINCIPLES 10).
// Options:
//   ignite 0..1         how far the fire has run over the floor from `origin` (0 = all dark, 1 = ~10 m)
//   ignite_at + ignite_s  the same, animated: starts at film frame ignite_at (song s in shots.json), full after ignite_s s
//   origin [x, z]       where the fire starts (default: the main vent's foot)
//   erupt 0..1 / erupt_at  the vents blow: tall flames, bubble columns, bubble-firework bursts rising
//   lanterns n          the festival dressing: n strings of paper lanterns + stalls; lit 0..1 / lit_at + lit_s
//   rise 0..1 / rise_at + rise_s  the lit lanterns let go and rise to the surface (staggered, drifting)
//   snow 0..1           marine snow density (default 1); smoke false = no mineral smoke
//   fires [...]         flames anywhere (three/fire.tsx Fires), e.g. the one in her hand
import React from 'react';
import * as THREE from 'three';
import {Bubbles, Ground, RBox, Rock} from '../parts';
import {SetLight, rnd, toon} from '../look';
import {Fires, Flame} from '../fire';
import type {SetProps} from './index';

type P3 = [number, number, number];
const BASALT = '#161a2a', ROCK = '#1e2336', CHIMNEY = '#23202c', HOT = '#ff7a3d', VIOLET = '#b45cff';

export const VENTS: {pos: P3; h: number; r: number}[] = [
  {pos: [1.3, 0, -1.7], h: 2.2, r: 0.42},     // the main vent ("vent" mark): where she strikes
  {pos: [-2.7, 0, -3.3], h: 3.1, r: 0.5},
  {pos: [3.6, 0, -4.1], h: 2.6, r: 0.45},
  {pos: [-0.7, 0, -5.8], h: 3.8, r: 0.6},
  {pos: [5.2, 0, -1.8], h: 1.5, r: 0.32},
  {pos: [-4.8, 0, -1.2], h: 1.8, r: 0.36},
];

/** Crack network: seeded random walks from the origin outwards; each segment knows its distance from the start. */
type Seg = {a: [number, number]; b: [number, number]; d: number};
const crackCache = new Map<string, Seg[]>();
function cracks(ox: number, oz: number): Seg[] {
  const k = `${ox},${oz}`;
  const hit = crackCache.get(k);
  if (hit) return hit;
  const out: Seg[] = [];
  const walk = (x: number, z: number, ang: number, d: number, n: number, seed: number, depth: number) => {
    for (let i = 0; i < n; i++) {
      const len = 0.25 + rnd(seed + i) * 0.3;
      ang += (rnd(seed + i * 3) - 0.5) * 0.9;
      const nx = x + Math.cos(ang) * len, nz = z + Math.sin(ang) * len;
      out.push({a: [x, z], b: [nx, nz], d});
      d += len; x = nx; z = nz;
      if (depth < 2 && rnd(seed + i * 7) > 0.8) walk(x, z, ang + (rnd(seed + i) > 0.5 ? 0.9 : -0.9), d, Math.floor(n * 0.5), seed + i * 31, depth + 1);
    }
  };
  for (let r = 0; r < 9; r++) walk(ox, oz, (r / 9) * Math.PI * 2 + rnd(r) * 0.5, 0, 26, r * 101 + 7, 0);
  crackCache.set(k, out);
  return out;
}

const Chimney: React.FC<{pos: P3; h: number; r: number; seed: number; heat: number; f: number; erupt: number; smoke: boolean}> = ({pos, h, r, seed, heat, f, erupt, smoke}) => {
  const rings = 6;
  const glowC = new THREE.Color(VIOLET).lerp(new THREE.Color(HOT), Math.min(1, heat * 1.2));
  return (
    <group position={pos}>
      {Array.from({length: rings}, (_, i) => {
        const t0 = i / rings, t1 = (i + 1) / rings;
        const r0 = r * (1 - t0 * 0.55) * (0.9 + 0.2 * rnd(seed + i)), r1 = r * (1 - t1 * 0.55) * (0.9 + 0.2 * rnd(seed + i + 1));
        return (
          <mesh key={i} position={[0.05 * (rnd(seed + i * 3) - 0.5), (t0 + t1) / 2 * h, 0.05 * (rnd(seed + i * 5) - 0.5)]} material={toon(CHIMNEY, heat > 0 ? glowC.getStyle() : '#000000', heat * 0.25 * (1 - t0))} castShadow receiveShadow>
            <cylinderGeometry args={[r1, r0, h / rings + 0.02, 9]} />
          </mesh>
        );
      })}
      {/* the glowing mouth */}
      <mesh position={[0, h + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[r * 0.4, 16]} />
        <meshBasicMaterial color={heat > 0 ? glowC : new THREE.Color('#0c0b12')} toneMapped={false} />
      </mesh>
      {heat > 0 ? <Flame pos={[0, h, 0]} f={f} size={r * (1.1 + 3.2 * erupt) * Math.min(1, heat * 1.5)} c={erupt > 0.3 ? HOT : VIOLET} core="#ffe2b8" seed={seed} light={0.8 + erupt} embers={8 + Math.round(erupt * 12)} /> : null}
      {smoke ? Array.from({length: 7}, (_, i) => {
        const life = 160, t = ((f + rnd(seed + i) * life) % life) / life;
        const s = r * (0.6 + t * 2.2);
        return (
          <mesh key={`s${i}`} position={[0.3 * Math.sin(t * 4 + i), h + t * 4.5, 0.2 * Math.cos(t * 3 + i)]} scale={s} renderOrder={6}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshBasicMaterial color={heat > 0 ? '#3a2430' : '#14131c'} transparent opacity={0.35 * (1 - t)} depthWrite={false} />
          </mesh>
        );
      }) : null}
      {erupt > 0 ? <Bubbles pos={[0, h, 0]} f={f} n={Math.round(30 * erupt)} h={7} spread={r * 1.5} seed={seed + 50} size={0.07} c="#ffd7b0" /> : null}
    </group>
  );
};

/** Bubble fireworks ("펑펑 터져 마치 축제 같지"): a shell rises from a vent and bursts into a ring of glowing bubbles. */
const BubbleBurst: React.FC<{from: P3; f: number; seed: number; c: string}> = ({from, f, seed, c}) => {
  const period = 54, t = ((f + seed * 13) % period) / period;
  const top = 4 + rnd(seed) * 3;
  if (t < 0.45) {
    const y = from[1] + (t / 0.45) * top;
    return <mesh position={[from[0], y, from[2]]} scale={0.08}><sphereGeometry args={[1, 10, 8]} /><meshBasicMaterial color="#fff1d6" toneMapped={false} /></mesh>;
  }
  const b = (t - 0.45) / 0.55, R = 0.3 + b * 1.6;
  return (
    <group position={[from[0], from[1] + top, from[2]]}>
      {Array.from({length: 14}, (_, i) => {
        const a = (i / 14) * Math.PI * 2, e = (rnd(seed + i) - 0.5) * 1.2;
        return (
          <mesh key={i} position={[Math.cos(a) * R, Math.sin(e) * R * 0.8 - b * 0.4, Math.sin(a) * R]} scale={0.06 * (1 - b * 0.5)} renderOrder={11}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial color={i % 2 ? c : '#ffe2b8'} transparent opacity={1 - b} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/** A paper lantern on a string (灯): dull when dark, warm and lit when `on`. */
const Lantern: React.FC<{pos: P3; on: number; f: number; seed: number; c: string}> = ({pos, on, f, seed, c}) => {
  const sw = 0.06 * Math.sin(f / 28 + seed);
  const col = new THREE.Color('#3a2c3c').lerp(new THREE.Color(c), on);
  return (
    <group position={pos} rotation={[0, 0, sw]}>
      <mesh position={[0, -0.18, 0]} material={toon(col.getStyle(), on > 0 ? c : '#000000', 0.9 * on)}><sphereGeometry args={[0.16, 14, 10]} /></mesh>
      <mesh position={[0, -0.02, 0]} material={toon('#1a1418')}><cylinderGeometry args={[0.07, 0.09, 0.05, 10]} /></mesh>
      <mesh position={[0, -0.35, 0]} material={toon('#1a1418')}><cylinderGeometry args={[0.09, 0.07, 0.04, 10]} /></mesh>
      {on > 0.5 && seed % 3 === 0 ? <pointLight position={[0, -0.18, 0]} color={c} intensity={2.2 * on} distance={2.6} decay={1.8} /> : null}
    </group>
  );
};

const prog = (o: Record<string, unknown>, key: string, f: number, fps: number): number => {
  const at = o[`${key}_at`];
  if (typeof at === 'number') {
    const dur = Math.max(1, Number(o[`${key}_s`] ?? 3) * fps);
    const t = Math.max(0, Math.min(1, (f - at) / dur));
    return t * t * (3 - 2 * t);
  }
  return Math.max(0, Math.min(1, Number(o[key] ?? 0)));
};

export const Deep: React.FC<SetProps> = ({f, fps, opts}) => {
  const ignite = prog(opts, 'ignite', f, fps);
  const erupt = prog(opts, 'erupt', f, fps);
  const lit = prog(opts, 'lit', f, fps);
  const rise = prog(opts, 'rise', f, fps);
  const [ox, oz] = (opts.origin as [number, number]) ?? [VENTS[0].pos[0] - 0.5, VENTS[0].pos[2] + 0.7];
  const front = ignite * 10;
  const nLanterns = Number(opts.lanterns ?? 0);
  const snow = Number(opts.snow ?? 1);
  const smoke = opts.smoke !== false;
  const segs = cracks(ox, oz);
  const warm = Math.min(1, ignite * 1.3 + erupt * 0.5 + lit * 0.6);
  return (
    <group>
      <SetLight sky="#1b2150" ground="#06050d" fill={0.18 + 0.3 * warm} key="#7b86ff" keyI={0.35 + 0.4 * warm} keyPos={[-2, 9, 4]}
        target={[0.5, 0, -2]} shadowSize={9} fog="#05060f" fogNear={7} fogFar={24} bg="#04050c" />
      {warm > 0 ? <pointLight position={[ox, 1.2, oz - 1]} color={erupt > 0.3 ? HOT : '#ff8a5c'} intensity={12 * warm} distance={10 + front} decay={1.4} /> : null}
      <Ground size={[34, 26]} c={BASALT} pos={[0, 0, -3]} dunes={0.12} seed={11} />
      {/* pillow rocks */}
      {Array.from({length: 26}, (_, i) => {
        const x = (rnd(i * 3 + 1) - 0.5) * 18, z = -1 - rnd(i * 5 + 2) * 12 + (i < 6 ? 3 : 0);
        if (Math.hypot(x - 0.3, z + 0.6) < 1.6) return null;          // keep her stage clear
        const s = 0.25 + rnd(i * 7) * 0.7;
        return <Rock key={i} pos={[x, s * 0.25, z]} size={[s * 1.3, s * 0.8, s]} seed={i + 40} c={ROCK} rotY={rnd(i) * 6} />;
      })}
      {/* glowing cracks: lit where the fire front has passed, hottest right at the front */}
      {segs.map((s, i) => {
        if (s.d > front) return null;
        const [ax, az] = s.a, [bx, bz] = s.b;
        const len = Math.hypot(bx - ax, bz - az), heat = Math.max(0, 1 - (front - s.d) / 4);
        const c = new THREE.Color(VIOLET).lerp(new THREE.Color(HOT), Math.min(1, s.d / 5)).lerp(new THREE.Color('#fff1d6'), heat * 0.7);
        return (
          <mesh key={i} position={[(ax + bx) / 2, 0.012, (az + bz) / 2]} rotation={[-Math.PI / 2, 0, -Math.atan2(bz - az, bx - ax)]}>
            <planeGeometry args={[len + 0.02, 0.035 + 0.05 * heat + 0.02 * Math.sin(f / 5 + i)]} />
            <meshBasicMaterial color={c} toneMapped={false} />
          </mesh>
        );
      })}
      {VENTS.map((v, i) => {
        const d = Math.hypot(v.pos[0] - ox, v.pos[2] - oz);
        const heat = Math.max(0, Math.min(1, (front - d) / 1.5));
        return <Chimney key={i} pos={v.pos} h={v.h} r={v.r} seed={i * 19 + 5} heat={heat} f={f} erupt={erupt * heat} smoke={smoke} />;
      })}
      {erupt > 0 ? VENTS.slice(0, 4).map((v, i) => <BubbleBurst key={`b${i}`} from={[v.pos[0], v.h, v.pos[2]]} f={f} seed={i * 7 + 1} c={i % 2 ? HOT : VIOLET} />) : null}
      {/* the festival dressing (idea C): lantern strings over a street of driftwood stalls */}
      {nLanterns > 0 ? (
        <group>
          {Array.from({length: nLanterns}, (_, r) => {
            const z = -0.8 - r * 1.6, n = 11;
            return (
              <group key={r}>
                {[-4.6, 4.6].map((x, k) => <RBox key={k} size={[0.12, 3.2, 0.12]} pos={[x, 1.6, z]} r={0.03} c="#2a2228" />)}
                {rise < 0.05 ? <mesh position={[0, 3.05, z]} rotation={[0, 0, Math.PI / 2]} material={toon('#1a1418')}><cylinderGeometry args={[0.008, 0.008, 9.2, 4]} /></mesh> : null}
                {Array.from({length: n}, (_, i) => {
                  const x = -4.2 + (i / (n - 1)) * 8.4, y = 3.0 - 0.35 * Math.sin((i / (n - 1)) * Math.PI);
                  const order = Math.hypot(x - ox, z - oz) / 10;
                  const on = Math.max(0, Math.min(1, (lit - order) * 6));
                  const up = Math.max(0, rise * 1.6 - rnd(r * 31 + i) * 0.6);            // staggered release
                  const lift = up * up * (6 + rnd(r * 17 + i) * 8);
                  const drift = up * (rnd(r * 13 + i) - 0.5) * 3;
                  return <Lantern key={i} pos={[x + drift, y + lift, z - up * 2]} on={on} f={f} seed={r * 31 + i} c={(i + r) % 4 === 0 ? '#c27bff' : '#ffb35c'} />;
                })}
              </group>
            );
          })}
          {[-3.4, 3.4].map((x, k) => (
            <group key={`st${k}`} position={[x, 0, -2.6]} rotation={[0, k ? -0.3 : 0.3, 0]}>
              <RBox size={[1.8, 0.9, 0.8]} pos={[0, 0.45, 0]} r={0.05} c="#3b2a26" />
              {[-0.8, 0.8].map((px, j) => <RBox key={j} size={[0.08, 1.9, 0.08]} pos={[px, 0.95, 0.35]} r={0.02} c="#2e2220" />)}
              <RBox size={[2.1, 0.08, 1.2]} pos={[0, 1.95, 0.1]} rot={[0.18, 0, 0]} r={0.03} c={k ? '#5a2f6e' : '#7a3b2c'} />
            </group>
          ))}
        </group>
      ) : null}
      {/* marine snow: drifts down slowly, catches the light */}
      {Array.from({length: Math.round(140 * snow)}, (_, i) => {
        const H = 7, y = H - ((f * (0.004 + rnd(i * 3) * 0.004) + rnd(i * 5) * H) % H);
        return (
          <mesh key={`n${i}`} position={[(rnd(i * 7) - 0.5) * 14 + 0.1 * Math.sin(f / 40 + i), y, 2.5 - rnd(i * 11) * 10]} scale={0.012 + rnd(i) * 0.012}>
            <sphereGeometry args={[1, 6, 4]} />
            <meshBasicMaterial color={warm > 0.3 ? '#ffd9c0' : '#9fb0ff'} transparent opacity={0.35 + 0.35 * warm} toneMapped={false} />
          </mesh>
        );
      })}
      <Fires list={opts.fires} f={f} />
    </group>
  );
};
