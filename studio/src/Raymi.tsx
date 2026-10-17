import React from 'react';
import {Img, interpolate, spring, staticFile, useVideoConfig} from 'remotion';
import type {Beat} from './types';
import type {Placement} from './framing';

/**
 * Raymi as a puppet until her Live2D rig exists: she is never a still. Always breathing + swaying, every beat
 * enters with its act (squash & stretch, overshoot, smear blur on fast moves), and she is lit by the world
 * (rim light in the accent colour + a contact shadow when her feet are visible).
 */
export const Raymi: React.FC<{beat: Beat; place: Placement; local: number; accent: string; keyHits: number[]}> = ({
  beat, place, local, accent, keyHits,
}) => {
  const {fps} = useVideoConfig();
  const [sw, sh] = beat.size;
  const t = local / fps;
  const enter = spring({frame: local, fps, config: {damping: 11, stiffness: 170, mass: 0.7}});
  let dx = 0, dy = 0, rot = 0, sx = 1, sy = 1, blur = 0;
  // ambient life (always on)
  sy *= 1 + 0.012 * Math.sin(t * 2 * Math.PI * 0.42);
  sx *= 1 - 0.006 * Math.sin(t * 2 * Math.PI * 0.42);
  rot += 0.9 * Math.sin(t * 2 * Math.PI * 0.21);
  switch (beat.act) {
    case 'pop': sx *= interpolate(enter, [0, 1], [1.14, 1]); sy *= interpolate(enter, [0, 1], [0.84, 1]); break;
    case 'hop': {
      const h = Math.max(0, Math.sin(Math.min(local / 14, 1) * Math.PI));
      dy -= 70 * h; const land = local > 12 && local < 18 ? 1 : 0;
      sx *= 1 + 0.08 * land; sy *= 1 - 0.08 * land; sy *= 1 + 0.06 * h; break;
    }
    case 'tilt': rot += interpolate(enter, [0, 1], [0, beat.side === 'left' ? 6 : -6]); break;
    case 'lean': rot += interpolate(enter, [0, 1], [0, -4]); dx += interpolate(enter, [0, 1], [0, 40]); sx *= 1 + 0.03 * enter; sy *= 1 + 0.03 * enter; break;
    case 'shake': if (local < 14) { dx += Math.sin(local * 2.3) * 16 * (1 - local / 14); rot += Math.sin(local * 1.7) * 2; } break;
    case 'slide_in': {
      const from = beat.side === 'right' ? 1 : -1;
      dx += interpolate(enter, [0, 1], [from * 700, 0]);
      blur = interpolate(enter, [0, 0.6, 1], [14, 4, 0], {extrapolateRight: 'clamp'});
      sx *= interpolate(enter, [0, 0.7, 1], [1.12, 1.02, 1]); break;
    }
    case 'bounce': dy -= 18 * Math.abs(Math.sin(t * Math.PI * 2.2)); break;
    case 'shrink': sx *= interpolate(enter, [0, 1], [1, 0.9]); sy *= interpolate(enter, [0, 1], [1, 0.9]); dy += 40 * enter; break;
    default: break;
  }
  // key words land on her body: a small squash on each hit
  for (const k of keyHits) {
    const d = local - k;
    if (d >= 0 && d < 8) { const e = Math.sin((d / 8) * Math.PI); sy *= 1 - 0.035 * e; sx *= 1 + 0.035 * e; }
  }
  // entrance blur for every beat change (3-frame smear, cut before the syllable reads as snappy)
  if (beat.act !== 'slide_in' && local < 3) blur = Math.max(blur, (3 - local) * 2.2);
  const w = sw * place.scale, h = sh * place.scale;
  // a figure cut by its source image may never lift or tilt its cut edge into view
  if (beat.cuts.includes('bottom') && dy < 0) { sy *= 1 + (-dy / h) * 0.6; dy = 0; }
  if (beat.cuts.length) { sx *= 1.02; sy *= 1.02; rot *= 0.5; }
  return (
    <>
      {place.feetVisible ? (
        <div style={{position: 'absolute', left: place.x + dx + w * 0.18, top: place.y + h - h * 0.025, width: w * 0.64, height: h * 0.05,
          borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(5,0,20,0.55) 0%, rgba(5,0,20,0) 70%)', filter: 'blur(6px)'}} />
      ) : null}
      <div style={{position: 'absolute', left: place.x + dx, top: place.y + dy, width: w, height: h,
        transformOrigin: '50% 100%', transform: `rotate(${rot}deg) scale(${sx}, ${sy})`,
        filter: `drop-shadow(0 0 3px ${accent}aa)${blur > 0.3 ? ` blur(${blur.toFixed(1)}px)` : ''}`}}>
        <Img src={staticFile(beat.sprite)} style={{width: '100%', height: '100%'}} />
      </div>
    </>
  );
};
