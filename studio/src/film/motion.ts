// Pure motion math (no React): the camera and Raymi's puppet at any frame. The renderer AND the pre-render check
// (check.ts: are cut sprite edges ever on screen?) use the same functions, so what is checked is what is drawn.
import type {Act, CamKey, Ease, PuppetKey, V3} from './types';

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export function ease(kind: Ease | undefined, t: number): number {
  t = clamp01(t);
  switch (kind) {
    case 'linear': return t;
    case 'in': return t * t * t;
    case 'out': return 1 - (1 - t) ** 3;
    case 'snap': return 1 - (1 - t) ** 5;            // most of the move in the first frames (whip / dash)
    case 'hold': return t < 1 ? 0 : 1;
    case 'inOut':
    default: return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

export type Cam = {pos: V3; look: V3; fov: number; roll: number};

/** Deterministic smooth noise in [-1, 1] (sum of sines; no randomness between frames or workers). */
export const wobble = (t: number, seed: number) =>
  (Math.sin(t * 1.7 + seed) * 0.5 + Math.sin(t * 2.9 + seed * 2.1) * 0.3 + Math.sin(t * 5.3 + seed * 0.7) * 0.2);

// Catmull-Rom through p1..p2 with p0 / p3 as neighbours (centripetal enough for camera paths: no loops at keys)
function cr(p0: V3, p1: V3, p2: V3, p3: V3, t: number): V3 {
  const t2 = t * t, t3 = t2 * t;
  return [0, 1, 2].map((i) => 0.5 * ((2 * p1[i]) + (-p0[i] + p2[i]) * t + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2
    + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t3)) as V3;
}

/** Camera at frame f (shot-local keys use film frames). Handheld drift + a kick on music hits make it alive.
 *  v2: a key can be reached on a spline (`path`), keep the subject's size while the lens travels (`frameH`, the
 *  dolly zoom of the dissociation moment) and shake like a hand-held camera (`shake`). */
export function cameraAt(keys: CamKey[], f: number, hits: number[] = [], kick = 0, fps = 30): Cam {
  let c: Cam;
  let shake = keys[0].shake ?? 0;
  if (f <= keys[0].f) c = {pos: keys[0].pos, look: keys[0].look, fov: keys[0].fov, roll: keys[0].roll ?? 0};
  else {
    let i = keys.length - 1;
    for (let k = 0; k < keys.length - 1; k++) if (f < keys[k + 1].f) { i = k; break; }
    const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
    const t = b.f === a.f ? 1 : ease(b.ease, (f - a.f) / (b.f - a.f));
    const spline = b.path === 'spline' && a !== b;
    const p0 = keys[Math.max(0, i - 1)], p3 = keys[Math.min(keys.length - 1, i + 2)];
    const pos = spline ? cr(p0.pos, a.pos, b.pos, p3.pos, t) : lerp3(a.pos, b.pos, t);
    const look = spline ? cr(p0.look, a.look, b.look, p3.look, t) : lerp3(a.look, b.look, t);
    let fov = lerp(a.fov, b.fov, t);
    if (a.frameH && b.frameH) {
      const h = lerp(a.frameH, b.frameH, t);
      const d = Math.hypot(pos[0] - look[0], pos[1] - look[1], pos[2] - look[2]);
      fov = (2 * Math.atan(h / 2 / Math.max(0.05, d)) * 180) / Math.PI;
    }
    c = {pos, look, fov, roll: lerp(a.roll ?? 0, b.roll ?? 0, t)};
    shake = lerp(a.shake ?? 0, b.shake ?? 0, t);
  }
  const s = f / fps;
  const drift = 0.012 * (1 + shake * 5);               // a breathing lens, never a locked-off tripod
  let pos: V3 = [c.pos[0] + wobble(s * (0.6 + shake * 2.4), 1) * drift, c.pos[1] + wobble(s * (0.5 + shake * 2.6), 2) * drift, c.pos[2]];
  const look: V3 = shake ? [c.look[0] + wobble(s * 3.1, 5) * 0.025 * shake, c.look[1] + wobble(s * 2.7, 6) * 0.02 * shake, c.look[2]] : c.look;
  let fov = c.fov;
  if (kick > 0) {
    for (const h of hits) {
      const d = f - h;
      if (d >= 0 && d < 7) {                            // a 7-frame punch on each loud hit
        const e = Math.sin((d / 7) * Math.PI) * (1 - d / 7);
        fov *= 1 - 0.035 * kick * e;
        pos = [pos[0] + wobble(h, 3) * 0.02 * kick * e, pos[1] + wobble(h, 4) * 0.02 * kick * e, pos[2]];
      }
    }
  }
  let roll = c.roll + (shake ? wobble(s * 2.2, 7) * 1.4 * shake : 0);
  const o = keys[0].observer ?? 0;
  let lookOut = look;
  if (o > 0) {
    // a person watching: breath lifts the lens (~4 s), the body sways, the head drifts a fraction of a degree and
    // after the cut the gaze settles onto her (an eye finding its subject) - pure sines, the same in every worker
    const l = Math.max(0, f - keys[0].f);
    const settle = Math.exp(-l / 7);
    pos = [pos[0] + wobble(s * 0.33, 21) * 0.014 * o, pos[1] + Math.sin(s * Math.PI * 0.5) * 0.007 * o, pos[2] + wobble(s * 0.27, 22) * 0.01 * o];
    const dx = look[0] - pos[0], dy = look[1] - pos[1], dz = look[2] - pos[2];
    const dist = Math.hypot(dx, dy, dz);
    const yaw = ((wobble(s * 0.41, 23) * 0.7 + 1.3 * settle) * o * Math.PI) / 180;
    const pitch = ((wobble(s * 0.37, 24) * 0.45 - 0.5 * settle) * o * Math.PI) / 180;
    const h = Math.hypot(dx, dz) || 1;
    lookOut = [look[0] + (-dz / h) * Math.tan(yaw) * dist, look[1] + Math.tan(pitch) * dist, look[2] + (dx / h) * Math.tan(yaw) * dist];
    roll += wobble(s * 0.3, 25) * 0.5 * o;
  }
  return {pos, look: lookOut, fov, roll};
}

/** Vertical FOV for the real frame: keys are written for 16:9; a portrait frame keeps the subject across its width. */
export function fovFor(fov16x9: number, aspect: number): number {
  if (aspect >= 1) return fov16x9;
  const h = Math.atan(Math.tan((fov16x9 * Math.PI) / 360) * 0.95);   // portrait width ~ landscape height
  return (2 * Math.atan(Math.tan(h) / aspect) * 180) / Math.PI;
}

export type Pose = {
  key: PuppetKey;          // the held pose (sprite) on screen
  local: number;           // frames since that key
  pos: V3;                 // feet position now
  vel: V3;                 // m per frame
  sx: number; sy: number;  // squash & stretch
  rot: number;             // degrees, in the picture plane
  lift: number;            // m above the floor (hops)
  smear: number;           // 0..1 how much motion smear to draw
  turn: number;            // -1..1 horizontal scale through a turn-around
};

function rawPos(keys: PuppetKey[], f: number): {pos: V3; lift: number; moving: boolean} {
  let i = 0;
  for (let k = 0; k < keys.length; k++) if (keys[k].f <= f) i = k;
  const nxt = keys[i + 1];
  if (nxt && f >= nxt.f - nxt.move && f < nxt.f && nxt.move > 0) {
    const t = (f - (nxt.f - nxt.move)) / nxt.move;
    const e = ease(nxt.ease ?? 'inOut', t);
    return {pos: lerp3(keys[i].pos, nxt.pos, e), lift: nxt.arc * Math.sin(Math.PI * t), moving: true};
  }
  return {pos: keys[i].pos, lift: 0, moving: false};
}

/** Raymi at frame f: the held pose + motion. Breathing always; acts squash/stretch; fast moves smear; landings squash. */
export function puppetAt(keys: PuppetKey[], f: number, fps = 30): Pose | null {
  if (!keys.length || f < keys[0].f) return null;
  let i = 0;
  for (let k = 0; k < keys.length; k++) if (keys[k].f <= f) i = k;
  const key = keys[i];
  const local = f - key.f;
  const now = rawPos(keys, f), prev = rawPos(keys, f - 1);
  const vel: V3 = [now.pos[0] - prev.pos[0], now.pos[1] - prev.pos[1] + (now.lift - prev.lift), now.pos[2] - prev.pos[2]];
  const speed = Math.hypot(vel[0], vel[1], vel[2]);
  const t = f / fps;
  let sx = 1 - 0.008 * Math.sin(t * Math.PI * 0.84), sy = 1 + 0.014 * Math.sin(t * Math.PI * 0.84);   // breathing
  let rot = 0.8 * Math.sin(t * Math.PI * 0.42) + (key.rot ?? 0);
  let lift = now.lift, turn = 1;
  const spring = (d: number, k = 0.28, damp = 0.16) => Math.exp(-damp * d) * Math.cos(k * d);   // 1 -> 0 ringing
  const act: Act = key.act;
  switch (act) {
    case 'pop': { const s = spring(local); sx *= 1 + 0.12 * s; sy *= 1 - 0.12 * s; break; }
    case 'hop': {
      const u = Math.min(local / 12, 1);
      lift += 0.28 * Math.sin(Math.PI * u) * (local < 12 ? 1 : 0);
      if (local < 4) { sx *= 1.08; sy *= 0.9; }                       // anticipation
      else if (local < 12) { sx *= 0.94; sy *= 1.08; }                // stretch in the air
      else if (local < 16) { sx *= 1.1; sy *= 0.88; }                 // landing squash
      break;
    }
    case 'bounce': lift += 0.06 * Math.abs(Math.sin(t * Math.PI * 2.69)); break;   // ~161 BPM bob
    case 'shake': if (local < 16) { rot += Math.sin(local * 1.9) * 4 * (1 - local / 16); } break;
    case 'tilt': rot += 7 * ease('out', local / 8) * (key.flip ? -1 : 1); break;
    case 'lean': rot -= 5 * ease('out', local / 10); sx *= 1.03; break;
    case 'shrink': { const e = ease('out', local / 10); sx *= 1 - 0.1 * e; sy *= 1 - 0.14 * e; break; }
    case 'stomp': { const s = spring(local, 0.4, 0.22); sx *= 1 + 0.16 * Math.max(0, s); sy *= 1 - 0.16 * Math.max(0, s); rot += 2 * s; break; }
    case 'float': lift += 0.12 + 0.06 * Math.sin(t * Math.PI * 0.7); rot += 2 * Math.sin(t * Math.PI * 0.5); break;
    case 'turn': turn = local < 8 ? Math.cos(Math.PI * (local / 8)) : -1; break;   // scales through 0 = spins round
    default: break;
  }
  // a fresh pose enters with a small pop (no pose ever just appears)
  if (act !== 'pop' && local < 6) { const s = spring(local, 0.5, 0.5); sx *= 1 + 0.05 * s; sy *= 1 - 0.05 * s; }
  // landing after an arc move
  const prevKey = keys[i];
  if (prevKey.arc > 0 && local >= 0 && local < 6 && !now.moving) { const s = 1 - local / 6; sx *= 1 + 0.12 * s; sy *= 1 - 0.12 * s; }
  // stretch along fast moves
  if (now.moving) { sx *= 1 + Math.min(0.18, speed * 0.6); sy *= 1 - Math.min(0.08, speed * 0.25); rot += Math.max(-8, Math.min(8, -vel[0] * 60)); }
  // a height change between two keys is a TWEEN over the move (she shrinks into the card / grows back, KING 43 / 75)
  const nxt = keys[i + 1];
  if (nxt && nxt.move > 0 && nxt.height !== key.height && f >= nxt.f - nxt.move && f < nxt.f) {
    const k = 1 + (nxt.height / key.height - 1) * ease(nxt.ease ?? 'inOut', (f - (nxt.f - nxt.move)) / nxt.move);
    sx *= k; sy *= k;
  }
  const smear = clamp01((speed - 0.05) / 0.12);
  return {key, local, pos: now.pos, vel, sx, sy, rot, lift, smear, turn};
}

/** Size of her sprite plane in metres: the figure (top..feet) is `height` tall. */
export function planeSize(k: PuppetKey): {w: number; h: number} {
  const span = Math.max(0.2, k.feet - k.top);
  const h = k.height / span;
  return {w: (h * k.size[0]) / k.size[1], h};
}
