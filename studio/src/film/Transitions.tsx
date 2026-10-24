// Transitions THROUGH things (PRINCIPLES 13): the cut hides behind something of her world at full cover -
// a burst of bubbles, a cloud of Sumi ink, a foreground object passing the lens, a whip pan, a flash, a rewind
// (streaks rushing into the centre: time running back).
// The shot change happens at the boundary frame; the cover peaks there, so the switch is never seen.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {rnd} from '../three/look';
import {clamp01, ease} from './motion';
import type {Shot} from './types';

type Active = {shot: Shot; b: number; p: number; n: number};

function active(shots: Shot[], f: number): Active | null {
  for (let i = 0; i < shots.length - 1; i++) {
    const t = shots[i].transition;
    if (!t || t.kind === 'cut' || t.frames <= 0) continue;
    const b = shots[i + 1].from, n = t.frames;
    if (f >= b - n / 2 && f < b + n / 2) return {shot: shots[i], b, p: (f - (b - n / 2)) / n, n};
  }
  return null;
}

/** Cover amount 0..1 that is exactly 1 on the boundary frame. */
const cover = (p: number) => 1 - Math.abs(p - 0.5) * 2;

// whip blur 16 px (38 px smeared the words over the whip - final Short 1)
export function whipStyle(shots: Shot[], f: number, W: number): React.CSSProperties {
  const a = active(shots, f);
  if (a && a.shot.transition.kind === 'spin') {
    // a barrel roll: out of shot A turning, into shot B still turning the same way - 180 deg over the transition
    const dir = a.shot.transition.dir ?? 1, k = cover(a.p);
    const deg = a.p < 0.5 ? 90 * ease('in', a.p * 2) : -90 + 90 * ease('out', (a.p - 0.5) * 2);
    // the turned frame must still cover the picture (no corner of the void): cos + 16/9 sin of the angle
    const r = (Math.abs(deg) * Math.PI) / 180, fill = Math.cos(r) + (16 / 9) * Math.sin(r);
    return {transform: `rotate(${dir * deg}deg) scale(${(fill * 1.04).toFixed(3)})`, filter: `blur(${(k * 10).toFixed(1)}px)`};
  }
  if (a && a.shot.transition.kind === 'zoom') {
    // a punch-in: shot A rushes into the lens, shot B lands from too close
    const k = cover(a.p);
    const s = a.p < 0.5 ? 1 + 1.6 * ease('in', a.p * 2) : 2.6 - 1.6 * ease('out', (a.p - 0.5) * 2);
    return {transform: `scale(${s.toFixed(3)})`, filter: `blur(${(k * 12).toFixed(1)}px)`};
  }
  if (!a || a.shot.transition.kind !== 'whip') return {};
  const dir = a.shot.transition.dir ?? 1;
  const k = cover(a.p);
  const off = a.p < 0.5 ? -ease('in', a.p * 2) : 1 - ease('out', (a.p - 0.5) * 2);
  return {transform: `translateX(${dir * off * W * 0.35}px)`, filter: `blur(${(k * 16).toFixed(1)}px)`};
}

export const Transitions: React.FC<{shots: Shot[]; f: number}> = ({shots, f}) => {
  const a = active(shots, f);
  if (!a) return null;
  const t = a.shot.transition;
  const k = cover(a.p);
  switch (t.kind) {
    case 'flash':
      return <AbsoluteFill style={{background: '#fff8ff', opacity: 0.95 * k ** 1.5}} />;
    case 'bubbles': {
      // a wall of air bubbles rushes up past the lens; at the boundary they fill the frame
      const n = 46;
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
          {Array.from({length: n}, (_, i) => {
            const x = rnd(i * 3.3) * 110 - 5, r = 6 + rnd(i * 5.1) * 16;
            const y = 130 - a.p * 170 * (0.7 + 0.6 * rnd(i * 7.7)) + rnd(i) * 40;
            return (
              <g key={i} opacity={0.35 + 0.65 * k}>
                <ellipse cx={x} cy={y} rx={r * (0.8 + 0.4 * k)} ry={r * (0.8 + 0.4 * k) * 0.92} fill="#b9ecff" fillOpacity={0.55 + 0.4 * k} stroke="#ffffff" strokeOpacity={0.7} strokeWidth={0.5} />
                <ellipse cx={x - r * 0.3} cy={y - r * 0.35} rx={r * 0.22} ry={r * 0.14} fill="#ffffff" fillOpacity={0.85} />
              </g>
            );
          })}
        </svg>
      );
    }
    case 'ink': {
      // Sumi's ink: a cloud blooms from one side, swallows the frame, and drains away on the other
      const blobs = 26;
      const grow = clamp01(a.p * 2), drain = clamp01((a.p - 0.5) * 2);
      return (
        <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
          {Array.from({length: blobs}, (_, i) => {
            const cx = 10 + rnd(i * 2.1) * 140 + drain * 60, cy = 10 + rnd(i * 4.3) * 70;
            const r = (8 + rnd(i * 6.7) * 30) * ease('out', clamp01(grow * 1.6 - rnd(i) * 0.6)) * (1 - ease('in', drain));
            return <circle key={i} cx={cx} cy={cy} r={Math.max(0, r)} fill={i % 3 ? '#160a2c' : '#2a1157'} />;
          })}
        </svg>
      );
    }
    case 'pass': {
      // something of the world passes right in front of the lens (out of focus): kelp, a fish, a card, a curtain
      const dir = t.dir ?? 1;
      const x = dir > 0 ? 130 - a.p * 260 : -130 + a.p * 260;
      const obj = t.obj ?? 'kelp';
      const fill = obj === 'card' ? '#efe6d2' : obj === 'curtain' ? '#3d1250' : obj === 'fish' ? '#ff9f5a' : '#1f5c5a';
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', filter: 'blur(6px)'}}>
          <g transform={`translate(${x} 0)`}>
            {obj === 'fish' ? <ellipse cx={50} cy={50} rx={75} ry={62} fill={fill} />
              : obj === 'card' ? <rect x={-20} y={-10} width={140} height={120} rx={8} fill={fill} transform="rotate(-8 50 50)" />
                : <path d="M-10 110 C 10 60 -5 30 20 -10 L 120 -10 C 95 30 110 60 90 110 Z" fill={fill} />}
          </g>
        </svg>
      );
    }
    case 'rewind': {
      // time running backwards: streaks rush INTO the centre (the fire sucked back into her palm), a violet veil
      const n = 64;
      return (
        <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
          <rect x={0} y={0} width={160} height={90} fill="#1a0838" opacity={0.55 * k} />
          {Array.from({length: n}, (_, i) => {
            const ang = rnd(i * 2.7) * Math.PI * 2, r0 = 40 + rnd(i * 5.3) * 70;
            const r1 = r0 * (1 - 0.9 * ease('in', clamp01(a.p * 1.3 - rnd(i) * 0.25)));
            const len = 6 + 28 * k;
            return (
              <line key={i} x1={80 + Math.cos(ang) * r1} y1={45 + Math.sin(ang) * r1} x2={80 + Math.cos(ang) * (r1 + len)} y2={45 + Math.sin(ang) * (r1 + len)}
                stroke={i % 3 ? '#c98bff' : '#ffd9a8'} strokeWidth={0.35 + rnd(i * 9.1) * 0.6} strokeOpacity={0.85 * k} strokeLinecap="round" />
            );
          })}
          <defs><radialGradient id="rwcore"><stop offset="0%" stopColor="#fff1e0" stopOpacity={1} /><stop offset="35%" stopColor="#d9a6ff" stopOpacity={0.7} /><stop offset="100%" stopColor="#7a3cff" stopOpacity={0} /></radialGradient></defs>
          <circle cx={80} cy={45} r={4 + 14 * k} fill="url(#rwcore)" opacity={0.95 * k} />
        </svg>
      );
    }
    case 'cover': {
      // Watch Me: something of HER fills the lens - her palm, a swing of her hair, her tail, a gold frame bar - out of
      // focus right in front of the glass; it covers the whole frame on the boundary frames, the cut hides inside
      const obj = t.obj ?? 'palm';
      const C = COVER[obj] ?? COVER.palm;
      const dir = t.dir ?? 1;
      const go = a.p < 0.5 ? ease('out', a.p * 2) : 1 + ease('in', (a.p - 0.5) * 2);   // 0 off-frame -> 1 covering -> 2 gone
      const shift = (1 - go) * 120 * dir;                                            // in from one side, out the other
      return (
        <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', filter: 'blur(5px)'}}>
          <g transform={`translate(${shift.toFixed(2)} 0)`}>
            {obj === 'palm' ? (<>
              <ellipse cx={80} cy={58} rx={88} ry={70} fill={C[0]} />
              {[0, 1, 2, 3].map((i) => <rect key={i} x={30 + i * 28} y={-40} width={24} height={90} rx={12} fill={C[0]} />)}
              <path d="M 70 70 C 100 60 130 72 150 90" stroke={C[1]} strokeWidth={2} fill="none" opacity={0.6} />
            </>) : obj === 'hair' ? (<>
              <rect x={-20} y={-10} width={200} height={110} fill={C[0]} opacity={clamp01(k * 1.6)} />
              {Array.from({length: 14}, (_, i) => <path key={i} d={`M ${-30 + i * 15} -10 C ${i * 15 + 10} 30 ${i * 15 - 15} 60 ${i * 15 + 20} 110`}
                stroke={i % 3 ? C[0] : C[1]} strokeWidth={18} fill="none" strokeLinecap="round" />)}
            </>) : obj === 'tail' ? (<>
              <path d="M -40 120 C 20 60 90 50 210 -30 L 260 40 C 140 80 60 110 30 140 Z" fill={C[0]} />
              <rect x={-20} y={-10} width={200} height={110} fill={C[0]} opacity={clamp01((k - 0.55) * 4)} />
              <path d="M 150 18 L 196 4 L 176 40 Z" fill={C[1]} />
            </>) : (<>
              <rect x={-20} y={-30} width={200} height={150} fill={C[0]} />
              <rect x={-20} y={8} width={200} height={6} fill={C[1]} opacity={0.7} />
              <rect x={-20} y={70} width={200} height={4} fill="#5a3a10" opacity={0.5} />
            </>)}
          </g>
          {/* the boundary frames are fully covered whatever the shape (QC: lens >= 90 % covered at the cut) */}
          <rect x={0} y={0} width={160} height={90} fill={C[0]} opacity={k > 0.82 ? 1 : 0} />
        </svg>
      );
    }
    default:
      return null;
  }
};

/** Cover-cut colours [body, accent]: her skin, her hair, her tail + barb, the gold of the exhibit frames. */
export const COVER: Record<string, [string, string]> = {
  palm: ['#aab8cf', '#8796b2'], hair: ['#191530', '#2d2650'], tail: ['#2a1f45', '#7a3cf0'], frame_bar: ['#d9a441', '#f5d48a'],
};

/** How much of the frame a cover transition hides at its peak (the boundary frame) - always the whole frame. */
export const coverAt = (p: number) => (1 - Math.abs(p - 0.5) * 2 > 0.82 ? 1 : 0);
