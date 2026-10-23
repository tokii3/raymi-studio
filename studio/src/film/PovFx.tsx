// The POV layer (2026-10-23): the lens is the viewer, so some things happen ON the lens / the glass in front of it.
// Drawn over the 3D picture like the other 2D effects (Fx2D.tsx), reusable by every later video:
//   cover    - HER hand slaps over the lens from one side: dark palm + fingers, light through the finger gaps; gap: true
//              leaves a slit where her eye shows through
//   pov_hand - YOUR hand in the frame (a built, flat, graphic hand - never a generated one): a knuckle that taps the glass
//              at `taps` frames ('knuckle'), or an open hand reaching in ('open'); x/y = the tap spot (frame fractions)
//   ripple   - a ring that spreads on the glass at x/y from each frame in `taps` (a tap on aquarium glass; `big` = harder)
//   algae    - a green algae film on the glass (edges + a patch at x/y); `text` is wiped into it stroke by stroke over
//              [write0, write1] frames (her finger, from the other side: written mirrored so YOU read it)
//   freeze   - the picture holds on its first frame (Film.tsx renders the 3D scene at `from`), desaturated by `desat`
//   polaroid - the same hold inside a white instant-photo border with a flash at its start
//   stamp    - a word in her heavy font placed in the frame (x/y centre, size = cap height in frame heights, rot deg)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {rnd} from '../three/look';

export type PovFx =
  | {kind: 'cover'; from: number; to: number; side?: 'left' | 'right'; gap?: boolean}
  | {kind: 'pov_hand'; from: number; to: number; taps?: number[]; x?: number; y?: number; pose?: 'knuckle' | 'open'; side?: 'left' | 'right'}
  | {kind: 'ripple'; from: number; to: number; taps: number[]; x?: number; y?: number; big?: number[]}
  | {kind: 'algae'; from: number; to: number; text?: string; write0?: number; write1?: number; x?: number; y?: number}
  | {kind: 'freeze'; from: number; to: number; desat?: number}
  | {kind: 'polaroid'; from: number; to: number; flash?: boolean}
  | {kind: 'stamp'; from: number; to: number; text: string; x?: number; y?: number; size?: number; rot?: number; color?: string};

export const POV_KINDS = ['cover', 'pov_hand', 'ripple', 'algae', 'freeze', 'polaroid', 'stamp'];

/** The scene frame under a freeze / polaroid (the 3D world holds still), else f. */
export function sceneFrame(fx: {kind: string; from: number; to: number}[] | undefined, f: number): number {
  for (const x of fx ?? []) if ((x.kind === 'freeze' || x.kind === 'polaroid') && f >= x.from && f < x.to) return x.from;
  return f;
}

/** CSS filter for the 3D layer under a freeze (desaturated) - joined with the grade + duo filters by Film.tsx. */
export function povFilter(fx: {kind: string; from: number; to: number; desat?: number}[] | undefined, f: number): string {
  for (const x of fx ?? []) if (x.kind === 'freeze' && f >= x.from && f < x.to) return `grayscale(${x.desat ?? 0.7})`;
  return '';
}

const SKIN = '#f3dfe0', SKIN_SHADE = '#d9bcc2', INK = '#1a1030';

const Cover: React.FC<{x: Extract<PovFx, {kind: 'cover'}>; f: number; W: number; H: number}> = ({x, f, W, H}) => {
  const t = Math.min(1, (f - x.from) / 4);              // slaps in over 4 frames
  const out = x.to - f < 6 ? (x.to - f) / 6 : 1;          // lifts off over the last 6
  const dir = x.side === 'left' ? -1 : 1;
  const shift = (1 - t * out) * W * 1.1 * dir;
  return (
    <AbsoluteFill style={{transform: `translateX(${shift}px)`}}>
      <svg viewBox="0 0 100 178" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
        <defs>
          <radialGradient id="palm" cx="50%" cy="55%" r="65%"><stop offset="0%" stopColor="#3a2433" /><stop offset="100%" stopColor="#0b0610" /></radialGradient>
          <linearGradient id="slitEdge" x1="0" x2="1"><stop offset="0" stopColor="black" /><stop offset="0.5" stopColor="black" stopOpacity={0.2} /><stop offset="1" stopColor="black" /></linearGradient>
          {/* the eye gap is a real hole in the hand: the picture (her eye) shows through it */}
          <mask id="handHole">
            <rect x={-10} y={-10} width={120} height={200} fill="white" />
            {x.gap ? <rect x={41} y={40} width={8} height={70} rx={4} fill="black" /> : null}
          </mask>
        </defs>
        {/* the palm pressed on the lens: almost black, warm at the centre where light comes through the skin */}
        <rect x={-10} y={-10} width={120} height={200} fill="url(#palm)" mask="url(#handHole)" />
        {/* light leaking through the other finger gaps */}
        {[22, 60, 78].map((gx, i) => <rect key={i} x={gx} y={-5} width={1.2} height={110 + i * 6} fill="#ffcfb8" opacity={0.35} />)}
      </svg>
    </AbsoluteFill>
  );
};

// a flat graphic hand (POV): skin with an ink outline, drawn in a 100 x 100 box, knuckle pointing up
const HAND_PATHS: Record<string, string> = {
  knuckle: 'M18 100 L22 58 Q20 40 34 36 L40 22 Q46 12 54 20 L60 18 Q68 12 74 22 L78 30 Q88 30 86 46 L82 62 Q90 70 84 100 Z',
  open: 'M14 100 L18 60 Q10 52 12 40 Q16 32 24 38 L28 44 L26 12 Q28 4 34 6 Q40 8 40 16 L42 36 L44 6 Q46 0 52 0 Q58 2 58 8 L58 36 L62 10 Q64 4 70 6 Q75 9 74 16 L72 40 L78 22 Q82 16 88 20 Q92 24 88 34 L80 66 Q86 78 82 100 Z',
};

const PovHand: React.FC<{x: Extract<PovFx, {kind: 'pov_hand'}>; f: number; W: number; H: number}> = ({x, f, W, H}) => {
  const tx = x.x ?? 0.5, ty = x.y ?? 0.55;
  // rest: low in the frame; each tap: up to the spot in 4 frames, contact, back in 6
  let reach = 0.35;
  for (const t of x.taps ?? []) {
    const d = f - t;
    if (d >= -4 && d < 0) reach = Math.max(reach, 0.35 + 0.65 * (1 + d / 4));
    else if (d >= 0 && d < 6) reach = Math.max(reach, 1 - 0.65 * (d / 6));
  }
  const enter = Math.min(1, (f - x.from) / 6), leave = Math.min(1, Math.max(0, (x.to - f) / 6));
  const vis = enter * leave;
  const size = H * 0.36;
  const left = tx * W - size * 0.5;
  const top = H - (H - ty * H + size * 0.08) * reach * vis - size * 0.15 * (1 - vis) + (1 - vis) * size;
  const flip = x.side === 'left' ? -1 : 1;
  return (
    <svg viewBox="0 0 100 100" style={{position: 'absolute', left, top, width: size, height: size * 1.4, transform: `scaleX(${flip}) rotate(${-8 * flip}deg)`, overflow: 'visible'}}>
      <path d={HAND_PATHS[x.pose ?? 'knuckle']} fill={SKIN} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <path d="M30 60 Q50 66 76 58" fill="none" stroke={SKIN_SHADE} strokeWidth={4} strokeLinecap="round" />
      <rect x={14} y={98} width={74} height={60} fill="#5a4a7a" stroke={INK} strokeWidth={3} />{/* your sleeve */}
    </svg>
  );
};

const Ripple: React.FC<{x: Extract<PovFx, {kind: 'ripple'}>; f: number; W: number; H: number}> = ({x, f, W, H}) => {
  const cx = (x.x ?? 0.5) * W, cy = (x.y ?? 0.55) * H;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {x.taps.map((t, i) => {
        const d = f - t;
        if (d < 0 || d > 18) return null;
        const big = (x.big ?? []).includes(t) ? 1.6 : 1;
        return [0, 1, 2].map((k) => {
          const r = (W * 0.04 + d * W * 0.018 * big) * (1 + k * 0.35);
          return <circle key={`${i}${k}`} cx={cx} cy={cy} r={r} fill="none" stroke="#e9fbff" strokeWidth={W * 0.006 * (1 - d / 18)} opacity={(1 - d / 18) * (0.8 - k * 0.2)} />;
        });
      })}
    </svg>
  );
};

const Algae: React.FC<{x: Extract<PovFx, {kind: 'algae'}>; f: number; W: number; H: number}> = ({x, f, W, H}) => {
  const cx = (x.x ?? 0.5) * W, cy = (x.y ?? 0.5) * H;
  const p = x.write0 !== undefined && x.write1 !== undefined
    ? Math.max(0, Math.min(1, (f - x.write0) / Math.max(1, x.write1 - x.write0))) : 1;
  const spots = Array.from({length: 26}, (_, i) => [rnd(i * 3.1), rnd(i * 7.7), 0.04 + 0.08 * rnd(i * 1.3)]);
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="alg"><stop offset="0%" stopColor="#5f8f3a" stopOpacity={0.55} /><stop offset="100%" stopColor="#5f8f3a" stopOpacity={0} /></radialGradient>
        <mask id="wipe">
          <rect width={W} height={H} fill="white" />
          {x.text ? (
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontFamily="RaymiHeavy, Raymi" fontSize={H * 0.16}
              fill="black" stroke="black" strokeWidth={H * 0.012} style={{clipPath: `inset(0 ${100 - p * 100}% 0 0)`}}>{x.text}</text>
          ) : null}
        </mask>
      </defs>
      <g mask="url(#wipe)">
        {/* the film: thick at the frame edges and in a patch where she wipes */}
        {spots.map(([sx, sy, r], i) => {
          const edge = i % 2 ? [sx < 0.5 ? 0 : 1, sy] : [sx, sy < 0.5 ? 0 : 1];
          return <circle key={i} cx={edge[0] * W} cy={edge[1] * H} r={r * W * 2.2} fill="url(#alg)" />;
        })}
        <ellipse cx={cx} cy={cy} rx={W * 0.36} ry={H * 0.13} fill="#5f8f3a" opacity={0.5} />
      </g>
    </svg>
  );
};

const Polaroid: React.FC<{x: Extract<PovFx, {kind: 'polaroid'}>; f: number; W: number; H: number}> = ({x, f, W, H}) => {
  const d = f - x.from;
  const flash = x.flash !== false && d < 6 ? 1 - d / 6 : 0;
  const t = x.flash === false ? 1 : Math.min(1, d / 10);
  const m = W * 0.08 * t, bottom = H * 0.16 * t;
  return (
    <>
      <AbsoluteFill style={{borderStyle: 'solid', borderColor: '#fbfaf4', borderWidth: `${m}px ${m}px ${bottom}px ${m}px`,
        transform: `rotate(${-2 * t}deg) scale(${1 - 0.04 * t})`, boxShadow: `0 0 ${H * 0.04}px rgba(0,0,0,${0.5 * t})`}} />
      {flash > 0 ? <AbsoluteFill style={{background: '#ffffff', opacity: flash}} /> : null}
    </>
  );
};

const StampFx: React.FC<{x: Extract<PovFx, {kind: 'stamp'}>; f: number; W: number; H: number}> = ({x, f, W, H}) => {
  const d = f - x.from;
  const pop = interpolate(d, [0, 4, 8], [1.7, 0.92, 1], {extrapolateRight: 'clamp'});
  const out = x.to - f < 5 ? (x.to - f) / 5 : 1;
  const px = (x.size ?? 0.07) * H * 1.35;
  return (
    <div style={{position: 'absolute', left: (x.x ?? 0.5) * W, top: (x.y ?? 0.5) * H, transform: `translate(-50%, -50%) rotate(${x.rot ?? -6}deg) scale(${pop})`,
      opacity: out, fontFamily: 'RaymiHeavy, Raymi', fontSize: px, color: x.color ?? '#ffffff', whiteSpace: 'nowrap', lineHeight: 1,
      WebkitTextStroke: `${px * 0.09}px ${INK}`, paintOrder: 'stroke', textShadow: `0 ${px * 0.06}px 0 ${INK}`}}>
      {x.text}
    </div>
  );
};

/** Every live POV effect, drawn over the picture. */
export const PovLayer: React.FC<{fx?: PovFx[]; f: number; W: number; H: number}> = ({fx, f, W, H}) => {
  const live = (fx ?? []).filter((x) => f >= x.from && f < x.to);
  if (!live.length) return null;
  return (
    <>
      {live.map((x, i) => {
        switch (x.kind) {
          case 'cover': return <Cover key={i} x={x} f={f} W={W} H={H} />;
          case 'pov_hand': return <PovHand key={i} x={x} f={f} W={W} H={H} />;
          case 'ripple': return <Ripple key={i} x={x} f={f} W={W} H={H} />;
          case 'algae': return <Algae key={i} x={x} f={f} W={W} H={H} />;
          case 'polaroid': return <Polaroid key={i} x={x} f={f} W={W} H={H} />;
          case 'stamp': return <StampFx key={i} x={x} f={f} W={W} H={H} />;
          default: return null;
        }
      })}
    </>
  );
};
