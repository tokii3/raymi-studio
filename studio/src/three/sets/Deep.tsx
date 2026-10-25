// SET deep - "The Lamp in the Dark": the abyss, 4,000 m down. Black basalt floor, pillow rocks, black-smoker chimneys
// (hydrothermal vents - the only real fire on the sea floor), a network of cracks that glow when the fire reaches them,
// mineral smoke, marine snow. Dark by default: only what burns lights the place (clean frame, PRINCIPLES 10).
// Four zones (FIRESTARTER): her sleeping dip (`dip` mark, stones + knick-knacks), the main vent (`vent`), the chimney
// forest (the five others), the giant at the back (a 7th, tallest vent on a rise, `giant`); behind it a sea-mount
// cliff rises to the surface (`cliff`), and a heat column can stand on the giant (`column`).
// Options (times are song seconds in shots.json, compiled to film frames; *_s are seconds):
//   ignite 0..1 | ignite_at + ignite_s   how far the fire has run over the floor from `origin` (1 = ~10 m)
//   origin [x, z]; crack_dir (rad) + crack_n   the crack network: n walks (default 9 all round; 1-3 + a dir = ONE crack
//                                       that runs one way, e.g. toward the lens / up a 9:16 frame)
//   rewind_at + rewind_s                 the fire runs BACK into the origin (the cold open's rewind)
//   dark_at + dark_s | kill_at           everything that burns dies (slow / in one frame: the cold current at the stop)
//   vents_at [t | null, ...] + vents_s   per-vent ignite times (one per syllable); null = lit by the crack front
//   flares [[t, "vent"], ...]            a vent flares on a hit; shells [[t, "vent"], ...] = a bubble firework from it
//   vent_cap 0..1                        caps the vents' brightness (the hero flame stays the brightest thing)
//   erupt 0..1 | erupt_at                every lit vent blows: tall flames, bubble columns, bubble fireworks
//   current 0..1 | current_at [t, ...] + current_s + current_dir   the cold current: cyan streaks, snow blown sideways,
//                                        every flame bent flat
//   tint_at + tint_s + tint              a ring of red-violet colour spreading through the WATER from the origin
//   red 0..1                             the water itself is red-violet (after the wave: the deep is hers)
//   cliff true; cliff_ignite 0..1 | cliff_ignite_at + _s; cliff_steps [t, ...]   the sea-mount wall + its cracks lit
//                                        from the bottom up (one step per hit)
//   column 0..1 | column_at + column_s; column_bend 0..1 | column_bend_at + _s + column_unbend_at; column_pulse [t]
//   pulse "beats"                        the crack network breathes on every beat
//   dip true                             her sleeping dip: a ring of stones she arranged
//   lanterns n / lit / rise              the festival dressing (idea C)
//   snow 0..1, smoke false, vents false, fog_far (m)
//   fires / sparks                       flames and strikes anywhere (three/fire.tsx)
//   fish / school / sauna / salmon / props   creatures and props (three/creatures.tsx)
import React from 'react';
import * as THREE from 'three';
import {Bubbles, Ground, RBox, Rock} from '../parts';
import {SetLight, blobTexture, canvasTexture, rnd, toon} from '../look';
import {Fires, Flame, Sparks, add, glowTex} from '../fire';
import {DeepLife} from '../creatures';
import {Things} from '../routine';
import {flare, frames} from '../events';
import {SeaCables} from '../cables';
import type {SetProps} from './index';

type P3 = [number, number, number];
const BASALT = '#161a2a', ROCK = '#1e2336', CHIMNEY = '#17141d', HOT = '#ff7a3d', VIOLET = '#b45cff', COLD = '#9fe6ff';

export const VENTS: {pos: P3; h: number; r: number}[] = [
  {pos: [1.3, 0, -1.7], h: 2.2, r: 0.42},     // 0 the main vent ("vent" mark): where she strikes
  {pos: [-2.7, 0, -3.3], h: 3.1, r: 0.5},     // 1-5 the chimney forest
  {pos: [3.6, 0, -4.1], h: 2.6, r: 0.45},
  {pos: [-0.7, 0, -5.8], h: 3.8, r: 0.6},
  {pos: [5.2, 0, -1.8], h: 1.5, r: 0.32},
  {pos: [-4.8, 0, -1.2], h: 1.8, r: 0.36},
  {pos: [0.8, 0.7, -10.5], h: 5.6, r: 0.95},  // 6 the giant at the back, on its rise (the rap's 7th day, the column)
];
export const GIANT = VENTS[6];
const CLIFF_Z = -13.2;                        // the sea-mount wall behind the giant, facing the field (+z)

/** Crack network: seeded random walks from the origin outwards; each segment knows its distance from the start. */
type Seg = {a: [number, number]; b: [number, number]; d: number};
const crackCache = new Map<string, Seg[]>();
function cracks(ox: number, oz: number, dir: number | null, n: number): Seg[] {
  const k = `${ox},${oz},${dir},${n}`;
  const hit = crackCache.get(k);
  if (hit) return hit;
  const out: Seg[] = [];
  const walk = (x: number, z: number, ang: number, d: number, steps: number, seed: number, depth: number, wild: number) => {
    for (let i = 0; i < steps; i++) {
      const len = 0.25 + rnd(seed + i) * 0.3;
      ang += (rnd(seed + i * 3) - 0.5) * wild;
      const nx = x + Math.cos(ang) * len, nz = z + Math.sin(ang) * len;
      out.push({a: [x, z], b: [nx, nz], d});
      d += len; x = nx; z = nz;
      if (depth < 2 && rnd(seed + i * 7) > 0.8) walk(x, z, ang + (rnd(seed + i) > 0.5 ? 0.9 : -0.9), d, Math.floor(steps * 0.5), seed + i * 31, depth + 1, wild);
    }
  };
  for (let r = 0; r < n; r++) {
    const ang = dir === null ? (r / n) * Math.PI * 2 + rnd(r) * 0.5 : dir + (r - (n - 1) / 2) * 0.35;
    walk(ox, oz, ang, 0, 26, r * 101 + 7, 0, dir === null ? 0.9 : 0.5);
  }
  crackCache.set(k, out);
  return out;
}

/** The cliff's cracks: walks climbing the wall from its foot; d = height reached. */
type Seg2 = {a: [number, number]; b: [number, number]; d: number};
let cliffCache: Seg2[] | null = null;
function cliffCracks(): Seg2[] {
  if (cliffCache) return cliffCache;
  const out: Seg2[] = [];
  for (let r = 0; r < 6; r++) {
    let x = -3 + r * 1.3 + rnd(r * 9) * 0.6, y = 0.3, ang = Math.PI / 2;
    for (let i = 0; i < 70; i++) {
      const len = 0.35 + rnd(r * 77 + i) * 0.4;
      ang = Math.PI / 2 + (rnd(r * 55 + i * 3) - 0.5) * 1.3;
      const nx = x + Math.cos(ang) * len, ny = y + Math.sin(ang) * len;
      out.push({a: [x, y], b: [nx, ny], d: y});
      if (rnd(r * 13 + i * 7) > 0.85) {
        const bx = nx + (rnd(i + r) > 0.5 ? 0.6 : -0.6), by = ny + 0.3;
        out.push({a: [nx, ny], b: [bx, by], d: ny});
      }
      x = nx; y = ny;
    }
  }
  cliffCache = out;
  return out;
}

/** 0..1 progress of an option: `key` (a number) or `key_at` (frame) eased over `key_s` seconds. */
export const prog = (o: Record<string, unknown>, key: string, f: number, fps: number, dflt = 3): number => {
  const at = o[`${key}_at`];
  if (typeof at === 'number') {
    const dur = Math.max(1, Number(o[`${key}_s`] ?? dflt) * fps);
    const t = Math.max(0, Math.min(1, (f - at) / dur));
    return t * t * (3 - 2 * t);
  }
  return Math.max(0, Math.min(1, Number(o[key] ?? 0)));
};

/** Strength of the cold current at frame f: a steady value, or puffs at `current_at` (attack 6 f, hold, decay). */
function currentAt(o: Record<string, unknown>, f: number, fps: number): number {
  let c = Number(o.current ?? 0);
  const dur = Number(o.current_s ?? 1.2) * fps;
  for (const t of frames(o.current_at)) {
    const d = f - t;
    if (d < 0 || d > dur + 12) continue;
    c = Math.max(c, Math.min(1, d / 6) * (d > dur ? 1 - (d - dur) / 12 : 1));
  }
  return Math.max(0, Math.min(1, c));
}

/** How far the current has pushed things sideways by frame f (m): its integral. */
function currentDrift(o: Record<string, unknown>, f: number, fps: number): number {
  let x = 0;
  const steady = Number(o.current ?? 0);
  const first = Math.min(f, ...frames(o.current_at));
  for (let k = Math.max(0, first); k <= f; k++) x += (currentAt(o, k, fps) - steady) * 0.08;
  return x + steady * f * 0.08;
}

const Chimney: React.FC<{pos: P3; h: number; r: number; seed: number; heat: number; f: number; erupt: number; smoke: boolean;
  bend: number; dir: number; cap: number; boost: number}> = ({pos, h, r, seed, heat, f, erupt, smoke, bend, dir, cap, boost}) => {
  const rings = 6;
  const glowC = new THREE.Color(VIOLET).lerp(new THREE.Color(HOT), Math.min(1, heat * 1.2));
  const lit = heat * rings;                                         // the lava seams light ring by ring from the bottom
  const flame = Math.max(0, (heat - 0.6) / 0.4);
  return (
    <group position={pos}>
      {Array.from({length: rings}, (_, i) => {
        const t0 = i / rings, t1 = (i + 1) / rings;
        const r0 = r * (1 - t0 * 0.55) * (0.9 + 0.2 * rnd(seed + i)), r1 = r * (1 - t1 * 0.55) * (0.9 + 0.2 * rnd(seed + i + 1));
        const seam = Math.max(0, Math.min(1, lit - i + 1));
        return (
          <group key={i}>
            <mesh position={[0.07 * (rnd(seed + i * 3) - 0.5), (t0 + t1) / 2 * h, 0.07 * (rnd(seed + i * 5) - 0.5)]} rotation={[0.06 * (rnd(seed + i) - 0.5), rnd(seed + i * 9) * 3, 0.06 * (rnd(seed + i * 2) - 0.5)]}
              material={toon(CHIMNEY)} castShadow receiveShadow>
              <cylinderGeometry args={[r1, r0, h / rings + 0.03, 7]} />
            </mesh>
            {seam > 0 && i > 0 ? (
              <mesh position={[0, t0 * h, 0]} rotation={[0.05 * (rnd(seed + i * 4) - 0.5), 0, 0.05 * (rnd(seed + i * 6) - 0.5)]}>
                <cylinderGeometry args={[r0 * 1.015, r0 * 1.015, 0.018 * (1 + h / 4), 7, 1, true]} />
                <meshBasicMaterial color={glowC} toneMapped={false} transparent opacity={seam * cap * (1 - t0 * 0.5)} side={THREE.DoubleSide} />
              </mesh>
            ) : null}
          </group>
        );
      })}
      {[0, 1, 2, 3].map((k) => {
        const a = rnd(seed + k * 7) * Math.PI * 2, rr = r * (0.9 + 0.3 * rnd(seed + k));
        const sz = r * (0.45 + 0.35 * rnd(seed + k * 3));
        return <Rock key={`c${k}`} pos={[Math.cos(a) * rr, sz * 0.3 + (k === 3 ? h * 0.35 : 0), Math.sin(a) * rr]} size={[sz, sz * 0.8, sz]} seed={seed + k + 90} c={CHIMNEY} rotY={a} />;
      })}
      {/* the glowing mouth */}
      <mesh position={[0, h + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[r * 0.4, 16]} />
        <meshBasicMaterial color={heat > 0.8 ? glowC.clone().multiplyScalar(0.4 + 0.6 * cap) : new THREE.Color('#0c0b12')} toneMapped={false} />
      </mesh>
      {flame > 0 ? <Flame pos={[0, h, 0]} f={f} size={r * (1.1 + 3.2 * erupt + 1.6 * boost) * flame} c={erupt > 0.3 || boost > 0.3 ? HOT : VIOLET} core="#ffe2b8" seed={seed}
        light={0.8 + erupt + boost} embers={8 + Math.round(erupt * 12)} bend={bend} dir={dir} dim={cap} /> : null}
      {smoke ? Array.from({length: 7}, (_, i) => {
        const life = 160, t = ((f + rnd(seed + i) * life) % life) / life;
        const s = r * (0.45 + t * 1.6);
        return (
          <mesh key={`s${i}`} position={[0.3 * Math.sin(t * 4 + i) + dir * bend * t * 3, h + t * 4.5 * (1 - 0.5 * bend), 0.2 * Math.cos(t * 3 + i)]} scale={s} renderOrder={6}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshBasicMaterial color={heat > 0 ? '#24161e' : '#0f0e16'} transparent opacity={0.13 * (1 - t) * Math.min(1, t * 6)} depthWrite={false} />
          </mesh>
        );
      }) : null}
      {erupt > 0 && flame > 0 ? <Bubbles pos={[0, h, 0]} f={f} n={Math.round(30 * erupt)} h={7} spread={r * 1.5} seed={seed + 50} size={0.07} c="#ffd7b0" /> : null}
    </group>
  );
};

/** Bubble fireworks ("펑펑 터져 마치 축제 같지"): a shell rises from a vent and bursts into a ring of glowing bubbles.
 *  Periodic while a vent erupts, or once from `start` (a hit). */
const BubbleBurst: React.FC<{from: P3; f: number; seed: number; c: string; start?: number; top?: number}> = ({from, f, seed, c, start, top: topIn}) => {
  const period = 54;
  let t: number;
  if (start !== undefined) { t = (f - start) / period; if (t < 0 || t >= 1) return null; } else t = ((f + seed * 13) % period) / period;
  const top = topIn ?? 4 + rnd(seed) * 3;
  if (t < 0.45) {
    const y = from[1] + (t / 0.45) * top;
    return <mesh position={[from[0], y, from[2]]} scale={0.08}><sphereGeometry args={[1, 10, 8]} /><meshBasicMaterial color="#fff1d6" toneMapped={false} /></mesh>;
  }
  const b = (t - 0.45) / 0.55, R = 0.3 + b * 1.6;
  return (
    <group position={[from[0], from[1] + top, from[2]]}>
      {b < 0.2 ? <mesh scale={1.5 * (1 + b * 4)} renderOrder={11}><sphereGeometry args={[0.5, 12, 8]} /><meshBasicMaterial map={glowTex(c)} {...add} opacity={0.7 * (1 - b * 5)} side={THREE.BackSide} /></mesh> : null}
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
      <mesh position={[0, -0.2, 0]} scale={[1, 1.3, 1]} material={toon(col.getStyle(), on > 0 ? c : '#000000', 0.95 * on)}><sphereGeometry args={[0.15, 16, 12]} /></mesh>
      {[-0.12, -0.2, -0.28].map((yy, k) => <mesh key={k} position={[0, yy, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.152 * Math.sqrt(1 - ((yy + 0.2) / 0.2) ** 2 * 0.9), 0.004, 4, 24]} /><meshBasicMaterial color={on > 0 ? '#7a4a20' : '#1a1418'} /></mesh>)}
      <mesh position={[0, -0.01, 0]} material={toon('#1a1418')}><cylinderGeometry args={[0.045, 0.05, 0.03, 10]} /></mesh>
      <mesh position={[0, -0.395, 0]}><cylinderGeometry args={[0.05, 0.045, 0.02, 10]} /><meshBasicMaterial color={on > 0 ? c : '#1a1418'} toneMapped={false} /></mesh>
      {on > 0 ? <mesh position={[0, -0.2, 0]} scale={0.9 * on}><sphereGeometry args={[0.5, 14, 10]} /><meshBasicMaterial map={blobTexture(c)} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.BackSide} /></mesh> : null}
      {on > 0.5 && seed % 3 === 0 ? <pointLight position={[0, -0.18, 0]} color={c} intensity={2.2 * on} distance={2.6} decay={1.8} /> : null}
    </group>
  );
};

/** A vertical shimmer texture for the heat column: streaks rising (scrolled by the frame). */
function columnTex(): THREE.CanvasTexture {
  return canvasTexture('heatcolumn', 64, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      const x = rnd(i * 3) * w, y = rnd(i * 5) * h, l = 20 + rnd(i * 7) * 70;
      const g = ctx.createLinearGradient(0, y, 0, y + l);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, `rgba(255,255,255,${0.25 + rnd(i) * 0.5})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(x, y, 1.5 + rnd(i * 11) * 3, l);
    }
    const s = ctx.createLinearGradient(0, 0, w, 0);
    s.addColorStop(0, 'rgba(255,255,255,0)'); s.addColorStop(0.5, 'rgba(255,255,255,0.35)'); s.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = s; ctx.fillRect(0, 0, w, h);
  });
}

/** The heat column: a shimmering violet-amber pillar of rising heat from a vent mouth up to the surface (she rides it).
 *  grow 0..1 = how high it stands; bend 0..1 = the cold current bends and thins it; pulse 0..1 = a hit flares it. */
export const HeatColumn: React.FC<{base: P3; f: number; grow: number; bend: number; dir: number; pulse: number; height?: number; r?: number}> = ({
  base, f, grow, bend, dir, pulse, height = 46, r = 0.85,
}) => {
  if (grow <= 0.001) return null;
  const tex = columnTex();
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.offset.set(0, -f * 0.012);                                  // the shimmer rises
  const H = height * grow, segs = 24;
  const thin = 1 - 0.55 * bend;
  const bright = (0.8 + 0.4 * pulse) * (1 - 0.5 * bend);
  return (
    <group position={base}>
      {Array.from({length: segs}, (_, i) => {
        const y0 = (i / segs) * H, y1 = ((i + 1) / segs) * H;
        const u0 = y0 / height, u1 = y1 / height;
        const x0 = dir * bend * 6 * u0 * u0, x1 = dir * bend * 6 * u1 * u1;
        const len = Math.hypot(x1 - x0, y1 - y0), tilt = Math.atan2(x1 - x0, y1 - y0);
        const wob = 1 + 0.06 * Math.sin(f / 5 + i * 0.8);
        return (
          <group key={i} position={[(x0 + x1) / 2, (y0 + y1) / 2, 0]} rotation={[0, 0, -tilt]}>
            {([[1.3, '#ffb35c', 0.22], [0.75, VIOLET, 0.45], [0.32, '#ffe6c8', 0.6]] as [number, string, number][]).map(([k, c, op], j) => (
              <mesh key={j} scale={[r * k * thin * wob, len, r * k * thin * wob]} renderOrder={7}>
                <cylinderGeometry args={[1, 1, 1, 18, 1, true]} />
                <meshBasicMaterial map={tex} color={c} {...add} opacity={op * bright * (i < 2 ? (i + 1) / 3 : 1)} />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* sparks and bubbles streaming up the column */}
      {Array.from({length: 46}, (_, i) => {
        const life = 70 + rnd(i * 3) * 50, t = ((f * 1.6 + rnd(i * 5) * life) % life) / life;
        const y = t * Math.min(H, 18) + rnd(i) * Math.max(0, H - 18) * 0.0;
        const u = y / height, a = rnd(i * 7) * Math.PI * 2, rr = r * thin * (0.2 + 0.8 * rnd(i * 9));
        return (
          <mesh key={`p${i}`} position={[Math.cos(a + f / 30) * rr + dir * bend * 6 * u * u, y, Math.sin(a + f / 30) * rr]} scale={0.03 + rnd(i) * 0.03} renderOrder={9}>
            <sphereGeometry args={[1, 6, 5]} />
            <meshBasicMaterial color={i % 3 ? '#ffd2a6' : '#e2b8ff'} {...add} opacity={0.9 * (1 - t)} />
          </mesh>
        );
      })}
      <pointLight position={[0, Math.min(H, 4), 0]} color="#ff9b66" intensity={10 * bright} distance={14} decay={1.4} />
      <pointLight position={[dir * bend * 2, Math.min(H, 14), 0]} color={VIOLET} intensity={9 * bright} distance={16} decay={1.4} />
    </group>
  );
};

/** The sea-mount wall: rough basalt rising to the surface, ledges, and its own crack network lit from the bottom up. */
/** The cliff face's relief (local x, y from its foot): the wall mesh and the cracks on it share it. */
const cliffZ = (x: number, y: number) => {
  const yl = y - 24;
  return 0.6 * Math.sin(x * 0.7 + yl * 0.3) * Math.cos(yl * 0.5) + 0.25 * Math.sin(x * 2.1 - yl * 1.7) + 0.4 * Math.sin(yl * 0.9);
};

const Cliff: React.FC<{front: number; f: number; cap: number}> = ({front, f, cap}) => {
  const geo = React.useMemo(() => {
    const g = new THREE.PlaneGeometry(34, 48, 60, 80);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setZ(i, cliffZ(p.getX(i), p.getY(i) + 24));
    g.computeVertexNormals();
    return g;
  }, []);
  const segs = cliffCracks();
  return (
    <group position={[0, 0, CLIFF_Z]}>
      <mesh geometry={geo} material={toon('#3a4268', '#2a1650', 0.9)} position={[0, 24, 0]} receiveShadow />
      {Array.from({length: 18}, (_, i) => {
        const x = (rnd(i * 3 + 400) - 0.5) * 24, y = 1 + rnd(i * 5 + 400) * 40, s = 0.6 + rnd(i * 7 + 400) * 1.4;
        return <Rock key={i} pos={[x, y, 0.4]} size={[s * 1.6, s * 0.45, s]} seed={i + 400} c={ROCK} rotY={rnd(i) * 3} />;
      })}
      {segs.map((s, i) => {
        if (s.d > front) return null;
        const [ax, ay] = s.a, [bx, by] = s.b;
        const len = Math.hypot(bx - ax, by - ay), heat = Math.max(0, 1 - (front - s.d) / 3);
        const c = new THREE.Color(VIOLET).lerp(new THREE.Color('#ff5a6e'), Math.min(1, s.d / 30)).lerp(new THREE.Color('#fff1d6'), heat * 0.7);
        return (
          <group key={i} position={[(ax + bx) / 2, (ay + by) / 2, cliffZ((ax + bx) / 2, (ay + by) / 2) + 0.08]} rotation={[0, 0, Math.atan2(by - ay, bx - ax)]}>
            <mesh><planeGeometry args={[len + 0.03, (0.04 + 0.05 * heat + 0.01 * Math.sin(f / 5 + i)) * cap]} />
              <meshBasicMaterial color={c} toneMapped={false} /></mesh>
            <mesh position={[0, 0, 0.01]} renderOrder={3}><planeGeometry args={[len + 0.2, 0.5 * cap]} />
              <meshBasicMaterial map={glowTex(VIOLET)} {...add} opacity={0.3 * cap} /></mesh>
          </group>
        );
      })}
      {front > 0 ? <pointLight position={[0.5, front, 2.5]} color="#ff7aa8" intensity={8 * cap} distance={9} decay={1.5} /> : null}
    </group>
  );
};

export const Deep: React.FC<SetProps> = ({f, fps, opts, beats, camPos}) => {
  const o = opts;
  // life of the fire: a rewind runs it back into the origin, dark / kill puts every flame out
  const rewind = prog(o, 'rewind', f, fps, 0.4);
  const killed = typeof o.kill_at === 'number' && f >= o.kill_at;
  const live = killed ? 0 : 1 - prog(o, 'dark', f, fps, 0.5);
  const ignite = prog(o, 'ignite', f, fps) * (1 - rewind);
  const erupt = prog(o, 'erupt', f, fps) * live;
  const lit = prog(o, 'lit', f, fps);
  const rise = prog(o, 'rise', f, fps);
  const [ox, oz] = (o.origin as [number, number]) ?? [VENTS[0].pos[0] - 0.5, VENTS[0].pos[2] + 0.7];
  const front = ignite * 10;
  const nLanterns = Number(o.lanterns ?? 0);
  const snow = Number(o.snow ?? 1);
  const smoke = o.smoke !== false;
  const segs = cracks(ox, oz, typeof o.crack_dir === 'number' ? o.crack_dir : null, Number(o.crack_n ?? 9));
  const cur = currentAt(o, f, fps), cdir = Number(o.current_dir ?? 1);
  const cap = Number(o.vent_cap ?? 1);
  const pulse = o.pulse === 'beats' ? flare(beats, f, 8) : 0;
  const ventsAt = Array.isArray(o.vents_at) ? (o.vents_at as (number | null)[]) : [];
  const ventDur = Math.max(1, Number(o.vents_s ?? 0.3) * fps);
  const heatOf = (i: number) => {
    const v = VENTS[i];
    const d = Math.hypot(v.pos[0] - ox, v.pos[2] - oz);
    let h = Math.max(0, Math.min(1, (front - d) / 1.5));
    const at = ventsAt[i];
    if (typeof at === 'number' && f >= at) h = Math.max(h, Math.min(1, (f - at) / ventDur));
    return h * live;
  };
  const boostOf = (i: number) => {
    const fl = Array.isArray(o.flares) ? (o.flares as [number, string][]).filter(([, v]) => Number(v) === i).map(([t]) => t) : [];
    return flare(fl, f, 14);
  };
  const heats = VENTS.map((_, i) => heatOf(i));
  const warm = Math.min(1, ignite * 1.3 + erupt * 0.5 + lit * 0.6 + Math.max(...heats) * 0.4) * live;
  // the red wave through the water: its radius now, and how far the camera is from the origin
  const tintR = typeof o.tint_at === 'number' && f >= o.tint_at ? ((f - o.tint_at) / (Number(o.tint_s ?? 2) * fps)) * 26 : -1;
  const tint = String(o.tint ?? '#c2275e');
  const camD = camPos ? Math.hypot(camPos[0] - ox, camPos[1] - 1, camPos[2] - oz) : 99;
  const inRed = Math.max(Number(o.red ?? 0), tintR > camD ? Math.min(1, (tintR - camD) / 3) : 0);   // red: the water stays red (acts 6-7)
  const fogC = new THREE.Color('#0e0a26').lerp(new THREE.Color('#1c0410'), inRed).getStyle();   // dark violet, never dead black (pilot 1)
  const fogFar = Number(o.fog_far ?? 24);
  // the cliff and the column
  const cliffFront = prog(o, 'cliff_ignite', f, fps) * 30 + Number(o.cliff_base ?? 0)
    + frames(o.cliff_steps).filter((t) => t <= f).reduce((a, t) => a + 3.2 * Math.min(1, (f - t) / 8), 0);   // one climb per hit
  const colGrow = prog(o, 'column', f, fps, 1.5);
  const colBend = prog(o, 'column_bend', f, fps, 0.6) * (1 - prog(o, 'column_unbend', f, fps, 1));
  const colPulse = flare(o.column_pulse, f, 10);
  const drift = cur > 0 || o.current_at ? currentDrift(o, f, fps) * cdir : 0;
  const cx = camPos ? camPos[0] : 0, cy = camPos ? camPos[1] : 3, cz = camPos ? camPos[2] : 0;
  return (
    <group>
      <SetLight neutral={Number(o.neutral_sky ?? 0)} sky="#2c2470" ground="#0a0718" fill={0.42 + 0.3 * warm} key="#8f8cff" keyI={0.6 + 0.4 * warm} keyPos={[-2, 9, 4]}
        target={[0.5, 0, -2]} shadowSize={9} fog={fogC} fogNear={7} fogFar={fogFar} bg={fogC} />
      {warm > 0 ? <pointLight position={[ox, 1.2, oz - 1]} color={erupt > 0.3 ? HOT : '#ff8a5c'} intensity={12 * warm * cap} distance={10 + front} decay={1.4} /> : null}
      <Ground size={[40, 34]} c={BASALT} pos={[0, 0, -5]} dunes={0.12} seed={11} />
      {/* the giant's rise: a low mound of crust it stands on */}
      <mesh position={[GIANT.pos[0], -0.2, GIANT.pos[2]]} scale={[3.2, 0.9, 2.6]} material={toon(ROCK)} receiveShadow castShadow>
        <sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      {/* pillow rocks */}
      {Array.from({length: 30}, (_, i) => {
        const x = (rnd(i * 3 + 1) - 0.5) * 18, z = -1 - rnd(i * 5 + 2) * 12 + (i < 6 ? 3 : 0);
        if (Math.hypot(x - 0.3, z + 0.6) < 1.6) return null;          // keep her stage clear
        if (Math.hypot(x - GIANT.pos[0], z - GIANT.pos[2]) < 3.2) return null;
        const s = 0.25 + rnd(i * 7) * 0.7;
        return <Rock key={i} pos={[x, s * 0.25, z]} size={[s * 1.3, s * 0.8, s]} seed={i + 40} c={ROCK} rotY={rnd(i) * 6} />;
      })}
      {/* her sleeping dip: a ring of stones she arranged */}
      {o.dip ? Array.from({length: 11}, (_, i) => {
        const a = (i / 11) * Math.PI * 2 + 0.2, s = 0.09 + rnd(i + 300) * 0.07;
        return <Rock key={`d${i}`} pos={[0.3 + Math.cos(a) * 1.05, s * 0.3, -0.6 + Math.sin(a) * 0.8]} size={[s * 1.3, s, s]} seed={i + 300} c="#2a2f45" rotY={a} />;
      }) : null}
      {/* glowing cracks: lit where the fire front has passed, hottest right at the front */}
      {segs.map((s, i) => {
        // nothing burns before the front has left the origin (stills run 2: the first segments showed at ignite 0)
        if (front <= 0.001 || s.d >= front || live <= 0) return null;
        const [ax, az] = s.a, [bx0, bz0] = s.b;
        const len0 = Math.hypot(bx0 - ax, bz0 - az), u = Math.min(1, (front - s.d) / len0);   // the front runs INTO a segment
        const bx = ax + (bx0 - ax) * u, bz = az + (bz0 - az) * u, len = len0 * u;
        const heat = Math.max(0, 1 - (front - s.d) / 4);
        const breathe = pulse * Math.max(0, 1 - Math.abs(s.d - (1 - pulse) * 8) / 2);   // one ring runs out on the beat
        // a hot line, never a white plank: thin core, violet -> amber by distance, only the front glows pale
        const c = new THREE.Color(VIOLET).lerp(new THREE.Color(HOT), Math.min(1, s.d / 5)).lerp(new THREE.Color('#ffd9f0'), Math.min(0.45, heat * 0.4 + breathe * 0.3));
        const w = (0.018 + 0.022 * heat + 0.02 * breathe + 0.006 * Math.sin(f / 5 + i)) * live;
        const rot: [number, number, number] = [-Math.PI / 2, 0, -Math.atan2(bz - az, bx - ax)];
        return (
          <group key={i}>
            <mesh position={[(ax + bx) / 2, 0.012, (az + bz) / 2]} rotation={rot}>
              <planeGeometry args={[len + 0.01, w]} />
              <meshBasicMaterial color={c} toneMapped={false} />
            </mesh>
            <mesh position={[(ax + bx) / 2, 0.014, (az + bz) / 2]} rotation={rot} renderOrder={3}>
              <planeGeometry args={[len + 0.08, w * 7]} />
              <meshBasicMaterial map={glowTex(s.d < 2.5 ? VIOLET : HOT)} {...add} opacity={0.35 * live} />
            </mesh>
          </group>
        );
      })}
      {o.vents !== false ? VENTS.map((v, i) => (
        <Chimney key={i} pos={v.pos} h={v.h} r={v.r} seed={i * 19 + 5} heat={heats[i]} f={f} erupt={erupt * heats[i]} smoke={smoke}
          bend={cur} dir={cdir} cap={cap} boost={boostOf(i) * live} />
      )) : null}
      {erupt > 0 && o.vents !== false ? VENTS.map((v, i) => (heats[i] > 0.6 ? <BubbleBurst key={`b${i}`} from={[v.pos[0], v.pos[1] + v.h, v.pos[2]]} f={f} seed={i * 7 + 1} c={i % 2 ? HOT : VIOLET} /> : null)) : null}
      {Array.isArray(o.shells) ? (o.shells as [number, string][]).map(([t, v], k) => {
        const vv = VENTS[Number(v)] ?? VENTS[0];
        return <BubbleBurst key={`sh${k}`} from={[vv.pos[0], vv.pos[1] + vv.h, vv.pos[2]]} f={f} seed={k * 11 + 3} c={k % 2 ? '#ffd27a' : VIOLET} start={t} />;
      }) : null}
      {o.cliff ? <Cliff front={cliffFront} f={f} cap={cap} /> : null}
      <HeatColumn base={(o.column_pos as P3) ?? [GIANT.pos[0], GIANT.pos[1] + GIANT.h, GIANT.pos[2]]} f={f} grow={colGrow} bend={colBend} dir={cdir} pulse={colPulse} />
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
                  const drift2 = up * (rnd(r * 13 + i) - 0.5) * 3;
                  return <Lantern key={i} pos={[x + drift2, y + lift, z - up * 2]} on={on} f={f} seed={r * 31 + i} c={(i + r) % 4 === 0 ? '#c27bff' : '#ffb35c'} />;
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
      {/* marine snow: drifts down slowly around the lens wherever it is (the rise too), blown sideways by the current */}
      {Array.from({length: Math.round(150 * snow)}, (_, i) => {
        const W = 14, H = 8, D = 11;
        const wrap = (v: number, c: number, span: number) => c - span / 2 + ((((v - c + span / 2) % span) + span) % span);
        const y = wrap(H - ((f * (0.004 + rnd(i * 3) * 0.004) + rnd(i * 5) * H) % H), cy, H);
        const x = wrap((rnd(i * 7) - 0.5) * W + 0.1 * Math.sin(f / 40 + i) + drift * (0.7 + 0.6 * rnd(i)), cx, W);
        const z = wrap(2.5 - rnd(i * 11) * D, cz - 4, D);
        const streak = 1 + cur * 5;
        return (
          <mesh key={`n${i}`} position={[x, y, z]} scale={[(0.012 + rnd(i) * 0.012) * streak, 0.012 + rnd(i) * 0.012, 0.012 + rnd(i) * 0.012]}>
            <sphereGeometry args={[1, 6, 4]} />
            <meshBasicMaterial color={cur > 0.2 ? COLD : warm > 0.3 ? '#ffd9c0' : '#9fb0ff'} transparent opacity={0.35 + 0.35 * Math.max(warm, cur)} toneMapped={false} />
          </mesh>
        );
      })}
      {/* the cold current itself: pale cyan streaks sweeping through the water */}
      {cur > 0.02 ? Array.from({length: 22}, (_, i) => {
        const span = 16, sp = 0.45 + rnd(i * 3) * 0.3;
        const x = ((f * sp * cdir + rnd(i * 5) * span) % span + span) % span - span / 2 + cx;
        const y = 0.3 + rnd(i * 7) * 3.2 + (cy > 4 ? cy - 2 : 0), z = cz - 1.5 - rnd(i * 11) * 7;
        return (
          <mesh key={`cs${i}`} position={[x, y + 0.1 * Math.sin(f / 9 + i), z]} rotation={[0, 0, 0.04 * Math.sin(f / 13 + i)]} scale={[2.2 + rnd(i) * 2.5, 0.025 + rnd(i * 13) * 0.03, 1]} renderOrder={7}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={glowTex(COLD)} {...add} opacity={0.5 * cur} />
          </mesh>
        );
      }) : null}
      {/* the red wave: a shell of red-violet colour spreading through the water */}
      {tintR > 0 && tintR < 40 ? (
        <group position={[ox, 1, oz]}>
          <mesh scale={tintR} renderOrder={7}>
            <sphereGeometry args={[1, 40, 24]} />
            <meshBasicMaterial color={tint} {...add} opacity={0.35 * Math.max(0, 1 - tintR / 40)} side={THREE.DoubleSide} />
          </mesh>
          <mesh scale={tintR * 0.98} renderOrder={6}>
            <sphereGeometry args={[1, 32, 20]} />
            <meshBasicMaterial color={tint} transparent opacity={0.12} depthWrite={false} side={THREE.BackSide} toneMapped={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.97, 0]} renderOrder={6}>
            <ringGeometry args={[Math.max(0, tintR - 0.6), tintR, 64]} />
            <meshBasicMaterial color={tint} {...add} opacity={0.8} />
          </mesh>
        </group>
      ) : null}
      <Fires list={o.fires} f={f} bend={cur} dir={cdir} kill={live} />
      <Sparks list={o.sparks} f={f} />
      <DeepLife opts={o} f={f} fps={fps} camPos={camPos} />
      <Things list={o.things} f={f} />
      {/* Love is War (2026-10-25): undersea data cables, pulses of light on the beat (three/cables.tsx) */}
      <SeaCables opts={o} f={f} fps={fps} beats={beats} />
    </group>
  );
};
