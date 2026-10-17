import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import type {ShortProps} from './types';
import {causticTile, paperTile} from './textures';

// Built worlds (no generated backgrounds). Each is a few depth layers so the camera has parallax to move through.
const PALETTES: Record<ShortProps['world'], {top: string; mid: string; bottom: string; light: string; dust: string}> = {
  deep_sea: {top: '#06142e', mid: '#1b1150', bottom: '#2a0f4a', light: '#7fe3ff', dust: '#bfeaff'},
  night_sky: {top: '#05060f', mid: '#141236', bottom: '#2b1b4f', light: '#c9b8ff', dust: '#ffffff'},
  sunset_reef: {top: '#2b1950', mid: '#a2477a', bottom: '#f39a6b', light: '#ffd9a8', dust: '#fff2dc'},
  paper: {top: '#f3ead9', mid: '#eadcc3', bottom: '#dccaa8', light: '#ffffff', dust: '#b56bff'},
  screen: {top: '#0d0b1a', mid: '#1a1433', bottom: '#120e24', light: '#b56bff', dust: '#7fe3ff'},
};

export const World: React.FC<{world: ShortProps['world']; camX: number; camY: number}> = ({world, camX, camY}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const p = PALETTES[world];
  const t = f / 30;
  const particles = Array.from({length: 46}, (_, i) => {
    const depth = 0.3 + random(`d${i}`) * 0.7;
    const x = (random(`x${i}`) * W * 1.3 - W * 0.15 - camX * depth * 0.6 + Math.sin(t * 0.6 + i) * 14 * depth) % (W * 1.3);
    const rise = world === 'deep_sea' ? t * 40 * depth : t * 6 * depth;
    const y = ((random(`y${i}`) * H * 1.2 - rise - camY * depth * 0.4) % (H * 1.2) + H * 1.2) % (H * 1.2) - H * 0.1;
    const r = (world === 'deep_sea' ? 3 + depth * 9 : 1.2 + depth * 2.6) * (0.6 + random(`r${i}`));
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.8 + random(`t${i}`)) + i));
    return {x, y, r, a: (0.18 + depth * 0.5) * tw, blur: (1 - depth) * 3};
  });
  const rays = [0.18, 0.42, 0.66, 0.84];
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${p.top} 0%, ${p.mid} 55%, ${p.bottom} 100%)`}}>
      {world === 'paper' ? <PaperGrain /> : null}
      {/* far layer: soft light shafts from above, drifting slowly */}
      {world !== 'paper' && world !== 'screen'
        ? rays.map((rx, i) => (
            <div
              key={i}
              style={{
                position: 'absolute', left: rx * W - 160 - camX * 0.15, top: -200, width: 320, height: H * 1.2,
                background: `radial-gradient(ellipse 50% 70% at 50% 0%, ${p.light}55 0%, ${p.light}00 100%)`,
                transform: `rotate(${12 + Math.sin(t * 0.3 + i) * 4}deg)`,
                opacity: 0.35 + 0.25 * Math.sin(t * 0.7 + i * 1.7), mixBlendMode: 'screen',
              }}
            />
          ))
        : null}
      {world === 'screen' ? <ScanGrid camX={camX} /> : null}
      {/* mid layer: caustic shimmer on the floor */}
      {world === 'deep_sea' ? (
        <div style={{position: 'absolute', left: 0, top: H * 0.55, width: W, height: H * 0.45, overflow: 'hidden', mixBlendMode: 'screen',
          maskImage: 'linear-gradient(180deg, transparent 0%, black 35%)', WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 35%)'}}>
          {[0, 1].map((k) => {
            // two drifting static layers cross-fade = moving caustics without per-frame noise
            const ph = (t * 0.25 + k * 0.5) % 1;
            return <div key={k} style={{position: 'absolute', inset: -120, backgroundImage: causticTile(7 + k * 13),
              backgroundSize: '540px 480px', opacity: 0.22 * Math.sin(ph * Math.PI),
              transform: `translate(${Math.sin(t * 0.4 + k) * 60 - camX * 0.3}px, ${Math.cos(t * 0.3 + k) * 30}px)`}} />;
          })}
        </div>
      ) : null}
      {/* floor glow so she has ground to stand on */}
      <div style={{position: 'absolute', left: -W * 0.2 - camX * 0.3, top: H * 0.8, width: W * 1.4, height: H * 0.35,
        background: `radial-gradient(ellipse at 50% 30%, ${p.light}40 0%, ${p.bottom}00 65%)`}} />
      {/* near layer: particles (bubbles / stars / dust) with depth parallax */}
      {particles.map((q, i) => (
        <div key={i} style={{position: 'absolute', left: q.x, top: q.y, width: q.r * 2, height: q.r * 2, borderRadius: '50%',
          border: world === 'deep_sea' ? `1.5px solid ${p.dust}` : 'none', background: world === 'deep_sea' ? `${p.dust}22` : p.dust,
          opacity: q.a * (1 - q.blur * 0.12)}} />
      ))}
      <div style={{position: 'absolute', inset: 0, opacity: interpolate(Math.sin(t * 0.5), [-1, 1], [0.05, 0.12]),
        background: `radial-gradient(circle at 50% 35%, ${p.light} 0%, transparent 55%)`, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

const PaperGrain: React.FC = () => {
  const {width: W, height: H} = useVideoConfig();
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply'}}>
      <foreignObject width={W} height={H}><div style={{width: W, height: H, opacity: 0.35, backgroundImage: paperTile}} /></foreignObject>
      {Array.from({length: 40}, (_, i) => (
        <line key={i} x1={0} x2={W} y1={120 + i * 46} y2={120 + i * 46} stroke="#9fb7d8" strokeWidth={2} opacity={0.35} />
      ))}
    </svg>
  );
};

const ScanGrid: React.FC<{camX: number}> = ({camX}) => {
  const {width: W, height: H} = useVideoConfig();
  const f = useCurrentFrame();
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 0.35}}>
      {Array.from({length: 24}, (_, i) => (
        <line key={`v${i}`} x1={((i * 60 - camX * 0.3) % W + W) % W} x2={((i * 60 - camX * 0.3) % W + W) % W} y1={0} y2={H}
          stroke="#b56bff" strokeWidth={1} opacity={0.25} />
      ))}
      {Array.from({length: 40}, (_, i) => (
        <line key={`h${i}`} x1={0} x2={W} y1={(i * 60 + f * 2) % H} y2={(i * 60 + f * 2) % H} stroke="#7fe3ff" strokeWidth={1} opacity={0.18} />
      ))}
    </svg>
  );
};
