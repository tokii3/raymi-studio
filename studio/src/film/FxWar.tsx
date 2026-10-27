// Effects as MOMENTS (Love is War build 2026-10-26, 4_SCRIPT v3c build list; 10_FX_boards3.md): drawn 2D on the
// picture, on twos (2d pro_rules: one clock for the drawn layer), arriving by moving / from oversize, never a fade-in.
// Reusable by any video - each kind is one designed moment, placed in a shot's fx with its reason.
//   crown     - the ink detonation: a black star blot (18-24 spikes) with a clean hole at her face, droplets drifting
//   dots      - her glow points lighting by PITCH (timeline fills notes from song_map.melody, like `melody`); heartbeat
//   ribbon    - a violet light ribbon from her hand, as long as each held note (`holds` [[f0, f1]]), whips up at `whip`
//   pillar    - a violet-white column from her up out of the frame, as long as the held note (`src` [f0, f1])
//   embers    - an ember lifts from her dots on every `taps` frame (the hi-hat living INSIDE a held shot)
//   halo      - the rain halo: a ring of drops round her when she is out of the water (`ramp` [a, b] brightness)
//   shards    - the megaphone breaks: n two-tone shards fly at the lens, on twos
//   starburst - 60-90 drawn stars burst from her dots in one pulse and stay (the ink night)
//   insert    - a 4-frame two-value insert filling the frame (>= 50 % empty): motif on ink or paper
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {rnd} from '../three/look';

export type WarFx =
  | {kind: 'crown'; from: number; to: number; size?: number; hole?: number; color?: string}
  | {kind: 'dots'; from: number; to: number; notes?: [number, number][]; heartbeat?: number; color?: string}
  | {kind: 'ribbon'; from: number; to: number; holds?: [number, number][]; whip?: number; color?: string}
  | {kind: 'pillar'; from: number; to: number; src?: [number, number]; fade?: number; color?: string}
  | {kind: 'embers'; from: number; to: number; taps?: number[]; color?: string}
  | {kind: 'halo'; from: number; to: number; ramp?: [number, number]}
  | {kind: 'shards'; from: number; to: number; n?: number; stutter?: number}
  | {kind: 'starburst'; from: number; to: number; n?: number}
  | {kind: 'insert'; from: number; to: number; motif: string; tone?: 'ink' | 'paper' | 'clear'; color?: string};

export const WAR_KINDS = new Set(['crown', 'dots', 'ribbon', 'pillar', 'embers', 'halo', 'shards', 'starburst', 'insert']);
const INK = '#0b0910', PAPER = '#f1ebe0', VIOLET = '#b98cff', WHITE_V = '#f3eeff';
const W = 160, H = 90;
const two = (f: number) => f - (f % 2);                          // on twos
/** The ink hand every drawn effect shares (toki 2026-10-27: the effects read as flat vector stickers): the edges are
 *  displaced by noise (a brush that frays), a paper grain eats into the fill. One filter, so every effect is one hand.
 *  Excerpt 8 look-critic FIX 4: the grain ate so much that the ink read as grey speckle - now it only nicks the fill. */
export const inkDefs = (id: string, seed = 3) => (
  <defs>
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={1.6} xChannelSelector="R" yChannelSelector="G" result="d" />
      <feTurbulence type="fractalNoise" baseFrequency="2.6" numOctaves={1} seed={seed + 7} result="g" />
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.6" result="gm" />
      <feComposite in="d" in2="gm" operator="in" />
    </filter>
  </defs>
);
let inkN = 0;
const svg = (children: React.ReactNode, blend?: React.CSSProperties['mixBlendMode']) => {
  const id = `ink${inkN++ % 997}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: blend}}>
      {inkDefs(id)}<g filter={`url(#${id})`}>{children}</g>
    </svg>
  );
};

/** arrival from oversize: 3 frames from `big` down to 1 with one small overshoot (the one spring of a hit) */
function arrive(d: number, big = 0.4): number {
  if (d < 0) return 0;
  if (d === 0) return big;
  if (d === 1) return 0.85;
  if (d === 2) return 1.08;
  return 1;
}

const Crown: React.FC<{x: Extract<WarFx, {kind: 'crown'}>; f: number; head: [number, number]}> = ({x, f, head}) => {
  const d = two(f - x.from), s = arrive(d) * (x.size ?? 0.55) * H, cx = head[0] * W, cy = head[1] * H;
  const n = 21, pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2, spike = i % 2 === 0;
    const r = spike ? s * (0.55 + rnd(i * 7.1) * 0.45) : s * (0.3 + rnd(i * 3.3) * 0.08);
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  const hole = (x.hole ?? 0.36) * W * 0.5 * Math.min(1, arrive(d));
  const drift = Math.max(0, d - 3) * 0.002;
  return svg(<>
    <defs><mask id={`crown${x.from}`}><rect x={0} y={0} width={W} height={H} fill="white" />
      <ellipse cx={cx} cy={cy} rx={hole * 0.62} ry={hole * 0.78} fill="black" /></mask></defs>
    <g mask={`url(#crown${x.from})`}>
      <polygon points={pts.join(' ')} fill={x.color ?? INK} />
      {Array.from({length: 64}, (_, k) => {
        const a = rnd(k * 5.3) * Math.PI * 2, rr = s * (1.05 + rnd(k * 2.7) * 0.7) * (1 + drift * 40);
        return <circle key={k} cx={cx + Math.cos(a) * rr} cy={cy + Math.sin(a) * rr} r={0.35 + rnd(k * 9.1) * 1.9} fill={x.color ?? INK} />;
      })}
    </g>
  </>);
};

const Dots: React.FC<{x: Extract<WarFx, {kind: 'dots'}>; f: number; center: [number, number]}> = ({x, f, center}) => {
  const d = f - x.from;
  if (x.heartbeat) {
    const k = Math.sin(Math.PI * Math.min(1, d / Math.max(1, x.to - x.from)));
    return svg(<g>{[-2, -1, 0, 1, 2].map((i) => <circle key={i} cx={W / 2 + i * 2.2} cy={H * 0.58 + Math.abs(i) * 0.6} r={0.5 + 0.9 * k} fill={x.color ?? VIOLET} opacity={0.4 + 0.6 * k} />)}</g>, 'screen');
  }
  const notes = (x.notes ?? []).filter(([df]) => df <= d);
  return svg(<g>{notes.map(([df, m], k) => {
    const age = d - df, pop = age < 2 ? 1.6 : age < 6 ? 1.2 : 1;
    const px = center[0] * W + (k - notes.length / 2) * 3.2, py = H * (0.85 - (m - 55) * 0.022);
    return <g key={k}><circle cx={px} cy={py} r={1.6 * pop} fill={x.color ?? VIOLET} opacity={0.35} />
      <circle cx={px} cy={py} r={0.7 * pop} fill={WHITE_V} /></g>;
  })}</g>, 'screen');
};

const Ribbon: React.FC<{x: Extract<WarFx, {kind: 'ribbon'}>; f: number; center: [number, number]}> = ({x, f, center}) => {
  let len = 0;
  for (const [a, b] of x.holds ?? []) len += Math.max(0, Math.min(f, b) - a);
  const whip = x.whip !== undefined && f >= x.whip ? Math.min(1, (f - x.whip) / 6) : 0;
  const L = Math.min(160, len * 1.6), x0 = center[0] * W + 8, y0 = center[1] * H - 6;
  const pts: string[] = [];
  for (let i = 0; i <= 30; i++) {
    const u = i / 30, xx = x0 + u * L, yy = y0 - u * L * 0.18 + Math.sin(u * 7 + two(f) * 0.2) * 3 - whip * u * u * 60;
    pts.push(`${xx.toFixed(1)},${yy.toFixed(1)}`);
  }
  return svg(<g fill="none" strokeLinecap="round">
    <polyline points={pts.join(' ')} stroke={x.color ?? VIOLET} strokeWidth={5} opacity={0.45} />
    <polyline points={pts.join(' ')} stroke={WHITE_V} strokeWidth={1.6} />
  </g>, 'screen');
};

const Pillar: React.FC<{x: Extract<WarFx, {kind: 'pillar'}>; f: number; center: [number, number]; head: [number, number]}> = ({x, f, center, head}) => {
  const [a, b] = x.src ?? [x.from, x.to];
  if (f < a) return null;
  const grow = Math.min(1, (f - a + 1) / 3), end = x.fade ? Math.max(0, 1 - Math.max(0, f - b) / 8) * 0.4 : f > b ? Math.max(0, 1 - (f - b) / 4) : 1;
  const cx = head[0] * W, w = 16 * grow, top = Math.max(0, head[1] - 0.06) * H;   // from just above her head up
  void center;
  const h = (top + 10) * grow, id = `pil${x.from}`;
  return svg(<g opacity={end}>
    <defs>
      <linearGradient id={`${id}g`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor={WHITE_V} stopOpacity={1} /><stop offset="0.55" stopColor={x.color ?? VIOLET} stopOpacity={0.55} /><stop offset="1" stopColor={x.color ?? VIOLET} stopOpacity={0} /></linearGradient>
      <filter id={`${id}b`} x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation={w * 0.25} /></filter>
    </defs>
    <rect x={cx - w * 1.4} y={top + 10 - h - 10} width={w * 2.8} height={h} fill={`url(#${id}g)`} filter={`url(#${id}b)`} opacity={0.6} />
    <rect x={cx - w * 0.4} y={top + 10 - h - 10} width={w * 0.8} height={h} fill={`url(#${id}g)`} filter={`url(#${id}b)`} />
    <ellipse cx={cx} cy={top + 1} rx={w * 1.6} ry={w * 0.35} fill={WHITE_V} opacity={0.5} filter={`url(#${id}b)`} />
    {Array.from({length: 18}, (_, k) => <circle key={k} cx={cx + (rnd(k * 3.3) - 0.5) * w * 2.2} cy={top - ((two(f) * (0.6 + rnd(k)) + rnd(k * 7) * 90) % Math.max(10, top))} r={0.3 + rnd(k * 5) * 0.5} fill={WHITE_V} opacity={0.8} />)}
  </g>, 'screen');
};

const Embers: React.FC<{x: Extract<WarFx, {kind: 'embers'}>; f: number; center: [number, number]}> = ({x, f, center}) => svg(<g>
  {(x.taps ?? []).map((t, k) => {
    const d = two(f) - t;
    if (d < 0 || d > 40) return null;
    const px = center[0] * W + (rnd(k * 3.7) - 0.5) * 14 + Math.sin(d * 0.2 + k) * 2, py = center[1] * H - d * 0.9;
    return <circle key={k} cx={px} cy={py} r={0.9 * (1 - d / 48)} fill={k % 3 ? VIOLET : '#ffd9a0'} opacity={1 - d / 40} />;
  })}
</g>, 'screen');

const Halo: React.FC<{x: Extract<WarFx, {kind: 'halo'}>; f: number; center: [number, number]}> = ({x, f, center}) => {
  const [a, b] = x.ramp ?? [0.7, 0.7];
  const u = Math.min(1, (f - x.from) / Math.max(1, x.to - x.from)), v = a + (b - a) * u;
  const cx = center[0] * W, cy = center[1] * H;
  return svg(<g>{Array.from({length: 46}, (_, k) => {
    const ang = (k / 46) * Math.PI * 2 + two(f) * 0.01, rr = 26 + rnd(k * 4.1) * 8;
    const px = cx + Math.cos(ang) * rr * 1.2, py = cy + Math.sin(ang) * rr;
    return <line key={k} x1={px} y1={py} x2={px + Math.cos(ang) * 2.4} y2={py + Math.sin(ang) * 2.4 + 1.2} stroke={WHITE_V} strokeWidth={0.6} opacity={v} />;
  })}</g>, 'screen');
};

const Shards: React.FC<{x: Extract<WarFx, {kind: 'shards'}>; f: number}> = ({x, f}) => {
  const d = two(f - x.from) / 2;
  return svg(<g>{Array.from({length: x.n ?? 12}, (_, k) => {
    const a = rnd(k * 6.1) * Math.PI * 2, sp = 6 + rnd(k * 2.2) * 10, r = d * sp;
    const s = 3 + d * (1.5 + rnd(k) * 2.5);
    const cx = W / 2 + Math.cos(a) * r, cy = H / 2 + Math.sin(a) * r * 0.7;
    const p = [0, 1, 2].map((i) => { const b = a + i * 2.1 + rnd(k + i); return `${cx + Math.cos(b) * s},${cy + Math.sin(b) * s * 0.8}`; }).join(' ');
    return <polygon key={k} points={p} fill={k % 2 ? PAPER : INK} stroke={k % 2 ? INK : PAPER} strokeWidth={0.5} />;
  })}</g>);
};

const Starburst: React.FC<{x: Extract<WarFx, {kind: 'starburst'}>; f: number; center: [number, number]}> = ({x, f, center}) => {
  const d = f - x.from, u = Math.min(1, d / 10), e = 1 - (1 - u) ** 3;
  return svg(<g>{Array.from({length: x.n ?? 75}, (_, k) => {
    const a = rnd(k * 1.7) * Math.PI * 2, rr = (8 + rnd(k * 3.9) * 110) * e;
    const px = center[0] * W + Math.cos(a) * rr, py = center[1] * H + Math.sin(a) * rr * 0.6 - rr * 0.25;
    const s = 0.5 + rnd(k * 5.3) * 1.3;
    const q = s * 0.28;   // a drawn four-point star (look-critic: the plus signs read as stock sparkles)
    return <path key={k} d={`M${px} ${py - s}Q${px + q} ${py - q} ${px + s} ${py}Q${px + q} ${py + q} ${px} ${py + s}Q${px - q} ${py + q} ${px - s} ${py}Q${px - q} ${py - q} ${px} ${py - s}Z`} fill={k % 4 ? WHITE_V : VIOLET} />;
  })}</g>, 'screen');
};

/** the two-value inserts (script v3b): simple, >= 50 % empty, 4 frames */
const Insert: React.FC<{x: Extract<WarFx, {kind: 'insert'}>; f: number}> = ({x, f}) => {
  const tone = x.tone ?? 'ink';
  const bg = tone === 'ink' ? INK : tone === 'paper' ? PAPER : 'none';
  const fg = x.color ?? (tone === 'ink' ? PAPER : INK);
  const t = two(f - x.from);
  let body: React.ReactNode = null;
  const m = x.motif;
  if (m === 'ribbon' || m === 'cable' || m === 'melody') {
    const pts = Array.from({length: 24}, (_, i) => `${i * 7},${45 - (m === 'cable' ? i * 2.2 - 20 : Math.sin(i * 0.5) * 12 + (m === 'melody' ? (i % 4) * 4 : 0))}`).join(' ');
    body = <polyline points={pts} fill="none" stroke={x.color ?? (m === 'melody' ? '#c81f37' : fg)} strokeWidth={m === 'cable' ? 5 : 3.2} strokeLinecap="round" />;
  } else if (m === 'dots') {
    const k = 0.6 + 0.4 * Math.sin(Math.PI * Math.min(1, t / 4));   // her five chest lights, one pulse
    body = [-2, -1, 0, 1, 2].map((i) => <g key={i}><circle cx={W / 2 + i * 9} cy={H / 2 + Math.abs(i) * 2.5} r={4.5 * k} fill={x.color ?? VIOLET} opacity={0.35} />
      <circle cx={W / 2 + i * 9} cy={H / 2 + Math.abs(i) * 2.5} r={1.8 * k} fill={WHITE_V} /></g>);
  } else if (m === 'rain' || m === 'bubbles') {
    body = Array.from({length: m === 'rain' ? 60 : 18}, (_, k) => {
      const px = rnd(k * 3.1) * W, py = rnd(k * 5.7) * H, r = m === 'bubbles' ? 2 + rnd(k) * 6 : m === 'rain' ? 0.6 : 1.4;
      return m === 'rain' ? <line key={k} x1={px} y1={py} x2={px - 1} y2={py + 6} stroke={fg} strokeWidth={0.6} />
        : <circle key={k} cx={px} cy={py} r={r} fill={m === 'bubbles' ? 'none' : (x.color ?? fg)} stroke={m === 'bubbles' ? fg : 'none'} strokeWidth={0.9} />;
    });
  } else if (m === 'speed') {
    body = Array.from({length: 30}, (_, k) => <rect key={k} x={rnd(k * 2.3 + t) * W - 40} y={rnd(k * 7.7) * H} width={30 + rnd(k) * 60} height={0.5 + rnd(k * 3) * 1.2} fill={fg} />);
  } else if (m === 'beam' || m === 'wedge') {
    body = <polygon points={m === 'beam' ? `0,40 ${W},34 ${W},52 0,46` : `${W * 0.15},${H} ${W * 0.62},0 ${W},0 ${W},${H * 0.2}`} fill={x.color ?? fg} />;
  } else if (m === 'slash' || m === 'smear' || m === 'claws') {
    const n = m === 'claws' ? 5 : 1;
    body = Array.from({length: n}, (_, k) => <polygon key={k} points={`-5,${60 - k * 9} ${W + 5},${18 - k * 9} ${W + 5},${(m === 'smear' ? 34 : 24) - k * 9} -5,${66 - k * 9}`} fill={fg} opacity={m === 'smear' ? 0.85 : 1} />);
  } else if (m === 'ink_drops') {
    body = Array.from({length: 22}, (_, k) => <circle key={k} cx={rnd(k * 4.4) * W} cy={rnd(k * 6.6) * H} r={0.6 + rnd(k * 8.8) * 3.5} fill={fg} />);
  } else if (m === 'rungs') {
    body = Array.from({length: 6}, (_, k) => <rect key={k} x={30} y={8 + k * 14} width={100} height={4} fill={fg} />);
  } else if (m === 'rings') {
    body = Array.from({length: 7}, (_, k) => <circle key={k} cx={W / 2} cy={H / 2} r={6 + k * 7} fill="none" stroke={fg} strokeWidth={0.6 + (k % 3)} strokeDasharray={`${18 + k * 4} 6`} />);
  }
  // an insert SLAMS in (2d pro_rules: arrival from oversize, never a still card - reality measured the 4-frame inserts
  // as static shots): 1.35x -> 1.0 with a small travel along the stroke, on every frame of its 4
  const d = Math.max(0, f - x.from), k = Math.min(1, d / 4), sc = 1.35 - 0.35 * (1 - (1 - k) ** 3);
  return <AbsoluteFill style={{backgroundColor: bg === 'none' ? undefined : bg, overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: `scale(${sc.toFixed(3)}) translate(${(-6 * k).toFixed(2)}%, ${(3 * k).toFixed(2)}%) rotate(${(-2 + 2 * k).toFixed(2)}deg)`}}>{svg(body)}</AbsoluteFill>
  </AbsoluteFill>;
};

export const FxWar: React.FC<{x: WarFx; f: number; center: [number, number]; head: [number, number]}> = ({x, f, center, head}) => {
  switch (x.kind) {
    case 'crown': return <Crown x={x} f={f} head={head} />;
    case 'dots': return <Dots x={x} f={f} center={center} />;
    case 'ribbon': return <Ribbon x={x} f={f} center={center} />;
    case 'pillar': return <Pillar x={x} f={f} center={center} head={head} />;
    case 'embers': return <Embers x={x} f={f} center={center} />;
    case 'halo': return null;   // read as a dashed HUD ring (look-critic, toki 2026-10-27 "sticker") - left out
    case 'shards': return <Shards x={x} f={f} />;
    case 'starburst': return <Starburst x={x} f={f} center={center} />;
    case 'insert': return <Insert x={x} f={f} />;
    default: return null;
  }
};
