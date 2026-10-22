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

export type Fx =
  | {kind: 'duo' | 'spread'; from: number; to: number; dark: string; light: string; levels?: number; mix?: number;
      r0?: number; r1?: number; soft?: number}
  | {kind: 'speed'; from: number; to: number; mode?: 'radial' | 'flow'; angle?: number; color?: string; density?: number; opacity?: number}
  | {kind: 'impact'; from: number; to: number}
  | {kind: 'halftone'; from: number; to: number; color?: string; size?: number; opacity?: number};

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
  const duos = live(fx, f).filter(isDuo);
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
              <feColorMatrix in="SourceGraphic" type="matrix"
                values="0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0 0 0 1 0" result="lum" />
              <feComponentTransfer in="lum" result="post">
                <feFuncR type="discrete" tableValues={steps} /><feFuncG type="discrete" tableValues={steps} /><feFuncB type="discrete" tableValues={steps} />
              </feComponentTransfer>
              <feComponentTransfer in="post" result="duo">
                <feFuncR type="table" tableValues={`${dr} ${lr}`} /><feFuncG type="table" tableValues={`${dg} ${lg}`} /><feFuncB type="table" tableValues={`${db} ${lb}`} />
              </feComponentTransfer>
              <feComposite in="duo" in2="SourceGraphic" operator="arithmetic" k1={0} k2={mix} k3={1 - mix} k4={0} result="all" />
              {(() => {
                const h = hole(d, f, center);
                if (!h) return null;
                // mask: black (= her colour) inside the circle, white (= grey) outside; a soft rim
                const rx = h.r * 100, ry = h.r * 100 * aspect, inner = Math.max(0, 1 - h.soft / Math.max(0.01, h.r));
                const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' preserveAspectRatio='none'><defs><radialGradient id='g' cx='${h.x * 100}' cy='${h.y * 100}' r='${rx}' gradientUnits='userSpaceOnUse' gradientTransform='translate(${h.x * 100} ${h.y * 100}) scale(1 ${ry / rx}) translate(${-h.x * 100} ${-h.y * 100})'><stop offset='${inner}' stop-color='black'/><stop offset='1' stop-color='white'/></radialGradient></defs><rect width='100' height='100' fill='url(%23g)'/></svg>`;
                return (
                  <>
                    <feImage href={`data:image/svg+xml;utf8,${svg}`} x="0%" y="0%" width="100%" height="100%" preserveAspectRatio="none" result="mask" />
                    <feComposite in="all" in2="mask" operator="arithmetic" k1={1} k2={0} k3={0} k4={0} result="greyPart" />
                    <feComponentTransfer in="mask" result="inv"><feFuncR type="table" tableValues="1 0" /><feFuncG type="table" tableValues="1 0" /><feFuncB type="table" tableValues="1 0" /></feComponentTransfer>
                    <feComposite in="SourceGraphic" in2="inv" operator="arithmetic" k1={1} k2={0} k3={0} k4={0} result="colourPart" />
                    <feComposite in="greyPart" in2="colourPart" operator="arithmetic" k1={0} k2={1} k3={1} k4={0} />
                  </>
                );
              })()}
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
    if (isDuo(x)) out.push(`url(#raymi-duo-${duo++})`);
    if (x.kind === 'impact') out.push('grayscale(1) invert(1) contrast(2.4)');
  }
  return out.join(' ');
}

/** Overlays drawn on top of the picture: speed lines and halftone. */
export const Fx2D: React.FC<{fx?: Fx[]; f: number}> = ({fx, f}) => {
  const items = live(fx, f);
  if (!items.length) return null;
  return (
    <>
      {items.map((x, i) => {
        if (x.kind === 'speed') return <Speed key={i} x={x} f={f} />;
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
