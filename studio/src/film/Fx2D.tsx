// The 2D layer over the 3D world (toki 2026-10-22: "mehr wie ein 2D-Video wie die Referenzen, aber mit 3D-Assets").
// Her reference MVs (Usseewa, Idol, Brain Fluid Explosion Girl, 39 Music) are flat and graphic: a whole shot in two
// colours (blue good student / red rage), posterised light, speed lines, a one-frame impact negative, halftone dots.
// These are drawn ON the rendered 3D frame, so every built set and Raymi's 3D body can wear them per shot.
//   duo      - two-colour poster look: luminance mapped from `dark` to `light`, posterised to `levels` steps
//   speed    - anime speed lines: `radial` (focus burst to the centre) or `flow` (parallel streaks at `angle`)
//   impact   - the impact frame: a few frames of high-contrast negative on a hit
//   halftone - printed dots over the picture (manga / comic panel)
//   spread   - (a duo with a hole) colour comes back in a circle around HER that grows from r0 to r1 (frame widths):
//              the grey routine around her, her own colour spreading when she dances (Beach 1-2, 49-57)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {rnd} from '../three/look';
import type {PovFx} from './PovFx';
import {FxWar, WAR_KINDS, inkDefs, type WarFx} from './FxWar';

export type Fx =
  | {kind: 'duo' | 'spread'; from: number; to: number; dark: string; light: string; levels?: number; mix?: number;
      r0?: number; r1?: number; soft?: number}
  | {kind: 'speed'; from: number; to: number; mode?: 'radial' | 'flow'; angle?: number; color?: string; density?: number; opacity?: number}
  | {kind: 'impact'; from: number; to: number}
  | {kind: 'halftone'; from: number; to: number; color?: string; size?: number; opacity?: number}
  // a brush slash ripping the frame on a hit (Love is War 2026-10-25: a slash planted in the 3D set read as a small
  // leaf twice - a slash is a graphic hit on the picture, refs hsr-hope-feathers@108, ado-usseewa@98)
  | {kind: 'slash'; from: number; to: number; angle?: number; y?: number; width?: number; color?: string; draw?: number; seed?: number}
  // the sung melody drawn as it is sung (timeline.py fills `notes` = [frames after `from`, midi] from song_map.melody):
  // a thick stroke that climbs and falls with the pitch, a blob head popping on every note (toki: "melodie effekte")
  | {kind: 'melody'; from: number; to: number; notes: [number, number][]; x0?: number; step?: number; base?: number;
      per?: number; width?: number; color?: string; head?: string}
  // a ring bursting at the lens (her ping / shout, T03): grows from 0 to r1 (share of the frame height) over the layer
  | {kind: 'ring'; from: number; to: number; x?: number; y?: number; r1?: number; band?: number; color?: string; n?: number}
  | WarFx    // Love is War moments (FxWar.tsx): crown, dots, ribbon, pillar, embers, halo, shards, starburst, insert
  | PovFx;   // the POV layer (PovFx.tsx): cover, pov_hand, ripple, algae, freeze, polaroid, stamp

type Duo = Extract<Fx, {kind: 'duo' | 'spread'}>;
const isDuo = (x: Fx): x is Duo => x.kind === 'duo' || x.kind === 'spread';

/** The colour hole of a spread at frame f: centre (frame fractions) + radius (fraction of the frame width). */
function hole(d: Duo, f: number, center: [number, number]): {x: number; y: number; r: number; soft: number} | null {
  if (d.kind !== 'spread') return null;
  const t = Math.max(0, Math.min(1, (f - d.from) / Math.max(1, d.to - 1 - d.from)));
  const e = 1 - (1 - t) ** 2;
  return {x: center[0], y: center[1], r: (d.r0 ?? 0.05) + ((d.r1 ?? 1.4) - (d.r0 ?? 0.05)) * e, soft: d.soft ?? 0.12};
}

const live = (fx: Fx[] | undefined, f: number) => (fx ?? []).filter((x) => f >= x.from && f < x.to);

const hex = (c: string) => {
  const n = parseInt(c.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
};

/** SVG filter definitions the 3D layer refers to by id (one per live duo effect). */
export const Fx2DDefs: React.FC<{fx?: Fx[]; f: number; center?: [number, number]; aspect?: number}> = ({fx, f, center = [0.5, 0.5], aspect = 16 / 9}) => {
  const duos = live(fx, f).filter((x): x is Duo => x.kind === 'duo');
  if (!duos.length) return null;
  return (
    <svg width={0} height={0} style={{position: 'absolute'}}>
      <defs>
        {duos.map((d, i) => {
          const [dr, dg, db] = hex(d.dark), [lr, lg, lb] = hex(d.light);
          const n = Math.max(2, d.levels ?? 4);
          const steps = Array.from({length: n}, (_, k) => (k / (n - 1)).toFixed(3)).join(' ');
          const mix = d.mix ?? 1;
          return (
            <filter key={i} id={`raymi-duo-${i}`} colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.7" result="soft" />
              <feColorMatrix in="soft" type="matrix"
                values="0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0 0 0 1 0" result="lum" />
              <feComponentTransfer in="lum" result="post">
                <feFuncR type="discrete" tableValues={steps} /><feFuncG type="discrete" tableValues={steps} /><feFuncB type="discrete" tableValues={steps} />
              </feComponentTransfer>
              <feComponentTransfer in="post" result="duo">
                <feFuncR type="table" tableValues={`${dr} ${lr}`} /><feFuncG type="table" tableValues={`${dg} ${lg}`} /><feFuncB type="table" tableValues={`${db} ${lb}`} />
              </feComponentTransfer>
              <feComposite in="duo" in2="SourceGraphic" operator="arithmetic" k1={0} k2={mix} k3={1 - mix} k4={0} />
            </filter>
          );
        })}
      </defs>
    </svg>
  );
};

/** CSS filter for the 3D layer: the duo poster look and the impact negative. */
export function fxFilter(fx: Fx[] | undefined, f: number): string {
  const out: string[] = [];
  let duo = 0;
  for (const x of live(fx, f)) {
    if (x.kind === 'duo') out.push(`url(#raymi-duo-${duo++})`);
    if (x.kind === 'impact') out.push('grayscale(1) invert(1) contrast(2.4)');
  }
  return out.join(' ');
}

/** Overlays drawn on top of the picture: speed lines and halftone. */
export const Fx2D: React.FC<{fx?: Fx[]; f: number; center?: [number, number]; head?: [number, number]; aspect?: number}> = ({fx, f, center = [0.5, 0.5], head = [0.5, 0.3], aspect = 16 / 9}) => {
  const items = live(fx, f);
  if (!items.length) return null;
  return (
    <>
      {items.map((x, i) => {
        if (WAR_KINDS.has(x.kind)) return <FxWar key={i} x={x as WarFx} f={f} center={center} head={head} />;
        if (x.kind === 'speed') return <Speed key={i} x={x} f={f} />;
        if (x.kind === 'spread') {
          // the grey world outside a circle around HER: desaturate + tint, with a soft hole that grows (CSS mask)
          const h = hole(x, f, center)!;
          const r = h.r * 100, soft = h.soft * 100;
          const mask = `radial-gradient(ellipse ${r}% ${r * aspect}% at ${h.x * 100}% ${h.y * 100}%, transparent ${Math.max(0, r - soft) / r * 100}%, black 100%)`;
          const st = {maskImage: mask, WebkitMaskImage: mask} as React.CSSProperties;
          return (
            <React.Fragment key={i}>
              <AbsoluteFill style={{...st, background: '#808080', mixBlendMode: 'saturation', opacity: x.mix ?? 1}} />
              <AbsoluteFill style={{...st, background: x.light, mixBlendMode: 'multiply', opacity: 0.35 * (x.mix ?? 1)}} />
            </React.Fragment>
          );
        }
        if (x.kind === 'slash') return <Slash key={i} x={x} f={f} head={head} />;
        if (x.kind === 'melody') return <MelodyLine key={i} x={x} f={f} />;
        if (x.kind === 'ring') return <Ring key={i} x={x} f={f} />;
        if (x.kind === 'halftone') {
          const s = x.size ?? 9;
          return (
            <AbsoluteFill key={i} style={{opacity: x.opacity ?? 0.22, mixBlendMode: 'multiply',
              backgroundImage: `radial-gradient(${x.color ?? '#1a1030'} 32%, transparent 34%)`, backgroundSize: `${s}px ${s}px`}} />
          );
        }
        return null;
      })}
    </>
  );
};

const Speed: React.FC<{x: Extract<Fx, {kind: 'speed'}>; f: number}> = ({x, f}) => {
  const n = Math.round(70 * (x.density ?? 1));
  const color = x.color ?? '#ffffff';
  // lines change every 2 frames like hand-drawn ones (on twos), never a smooth video effect
  const t = Math.floor(f / 2);
  if ((x.mode ?? 'radial') === 'radial') {
    return (
      <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: x.opacity ?? 0.8}}>
        {Array.from({length: n}, (_, i) => {
          const ang = rnd(i * 3.1 + t * 0.37) * Math.PI * 2;
          const r0 = 38 + rnd(i * 7.3 + t) * 30, r1 = 120;
          const w = 0.25 + rnd(i * 1.9 + t * 0.7) * 1.1;
          const cx = 80, cy = 45;
          const nx = Math.cos(ang), ny = Math.sin(ang), px = -ny * w, py = nx * w;
          return <polygon key={i} fill={color} points={`${cx + nx * r0},${cy + ny * r0} ${cx + nx * r1 + px},${cy + ny * r1 + py} ${cx + nx * r1 - px},${cy + ny * r1 - py}`} />;
        })}
      </svg>
    );
  }
  const ang = x.angle ?? 0;
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: x.opacity ?? 0.6}}>
      <g transform={`rotate(${ang} 80 45)`}>
        {Array.from({length: n}, (_, i) => {
          const y = -40 + rnd(i * 5.7) * 170, len = 20 + rnd(i * 2.3 + t) * 70;
          const xx = ((rnd(i * 9.1) * 300 + t * 37 * (0.6 + rnd(i))) % 300) - 70;
          return <rect key={i} x={xx} y={y} width={len} height={0.18 + rnd(i * 4.4) * 0.5} fill={color} />;
        })}
      </g>
    </svg>
  );
};

/** One brush slash across the whole frame: drawn in `draw` frames (default 3) from one side, a thick belly that tapers to
 *  a thin tail, ragged edges, a spray of drops thrown off the stroke. Held after it lands (ink stays). */
const Slash: React.FC<{x: Extract<Fx, {kind: 'slash'}>; f: number; head?: [number, number]}> = ({x, f, head}) => {
  const g = Math.min(1, (f - x.from + 1) / Math.max(1, x.draw ?? 3));
  const W = 160, H = 90, s = x.seed ?? 1;
  const w = (x.width ?? 0.2) * H;                         // the belly's thickness (share of the frame height)
  const top: string[] = [], bot: string[] = [];
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    if (u > g) break;
    const xx = -10 + u * (W + 20);
    const press = Math.sin(Math.PI * Math.min(1, u * 1.08)) ** 0.7 * (u > 0.82 ? Math.max(0.08, (1 - u) / 0.18) : 1);
    const rag = (rnd(s * 31 + i) - 0.5) * w * 0.18;
    top.push(`${xx.toFixed(2)},${(-w * press / 2 + rag).toFixed(2)}`);
    bot.unshift(`${xx.toFixed(2)},${(w * press / 2 + (rnd(s * 17 + i) - 0.5) * w * 0.18).toFixed(2)}`);
  }
  // the brand's war red, a solid accent (excerpt 8 look-critic FIX 4: the near-black stroke read grey and muddy over
  // the navy set and her face)
  const color = x.color ?? '#b3122f';
  // where the stroke crosses her head's column: closer than 0.2 of the frame -> it moves off her face (look-critic
  // stills 1: the slash parked across her mouth in m05 / m18)
  let cy = (x.y ?? 0.5) * H;
  if (head) {
    const at = cy + Math.tan(((x.angle ?? -14) * Math.PI) / 180) * (head[0] - 0.5) * W;
    // her face runs from a bit above the eyes down to the chin: the band head - 0.15 .. head + 0.32 of the frame
    const top = (head[1] - 0.15) * H, bot = (head[1] + 0.32) * H;
    if (at > top - w * 0.6 && at < bot + w * 0.6) cy += at - top < bot - at ? top - w * 0.6 - at : bot + w * 0.6 - at;
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
      {/* a clean brush stroke, no grain filter (take 13 look-critic + toki: the red slash read as pixel noise) */}<g><g transform={`translate(${W / 2} ${cy}) rotate(${x.angle ?? -14}) translate(${-W / 2} 0)`}>
        {top.length > 1 ? <polygon points={[...top, ...bot].join(' ')} fill={color} /> : null}
        {/* the spray thrown off the stroke */}
        {Array.from({length: 26}, (_, k) => {
          const u = rnd(s * 11 + k);
          if (u > g) return null;
          const xx = -10 + u * (W + 20), side = rnd(s * 13 + k) > 0.5 ? 1 : -1;
          const yy = side * (w * 0.55 + rnd(s * 19 + k) * w * 1.2);
          return <circle key={`d${k}`} cx={xx} cy={yy} r={0.25 + rnd(s * 23 + k) * 1.2} fill={color} />;
        })}
      </g></g>
    </svg>
  );
};

/** The melody line: one point per sung note (x steps across, y = pitch), drawn up to the current frame. */
const MelodyLine: React.FC<{x: Extract<Fx, {kind: 'melody'}>; f: number}> = ({x, f}) => {
  const W = 160, H = 90, d = f - x.from;
  const pts = x.notes.filter(([df]) => df <= d).map(([, m], k) => [
    ((x.x0 ?? 0.08) + k * (x.step ?? 0.12)) * W,
    ((x.base ?? 0.88) - (m - 59) * (x.per ?? 0.026)) * H] as [number, number]);
  if (!pts.length) return null;
  const color = x.color ?? '#0b0a10', w = (x.width ?? 0.05) * H;
  const path = pts.map(([px, py], k) => (k ? 'L' : 'M') + px.toFixed(2) + ' ' + py.toFixed(2)).join(' ');
  const last = x.notes.filter(([df]) => df <= d).slice(-1)[0];
  const pop = last ? Math.min(1, (d - last[0] + 1) / 3) : 1;          // the newest head pops in 3 frames
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
      {inkDefs(`ml${x.from}`, 5)}<g filter={`url(#ml${x.from})`}>
      <path d={path} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([px, py], k) => (
        <circle key={k} cx={px} cy={py} r={w * (k === pts.length - 1 ? 0.95 * pop : 0.8)} fill={x.head ?? '#c81f37'} />
      ))}</g>
    </svg>
  );
};

/** A ring (or a few) bursting outward at a point of the frame: thick, bright, thinning as it grows. */
const Ring: React.FC<{x: Extract<Fx, {kind: 'ring'}>; f: number}> = ({x, f}) => {
  const W = 160, H = 90, span = Math.max(1, x.to - x.from), u = Math.min(1, (f - x.from) / span);
  const n = x.n ?? 3, color = x.color ?? '#efe0ff';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'screen'}}>
      {Array.from({length: n}, (_, k) => {
        const v = u - k * 0.18;
        if (v <= 0) return null;
        const r = (x.r1 ?? 0.7) * H * Math.pow(v, 0.6);
        return <circle key={k} cx={(x.x ?? 0.5) * W} cy={(x.y ?? 0.5) * H} r={r} fill="none" stroke={color}
          strokeWidth={(x.band ?? 0.06) * H * (1 - 0.7 * v)} opacity={1 - 0.6 * v} />;
      })}
    </svg>
  );
};
