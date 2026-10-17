import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Word} from './types';

// Raymi's own words always use her font (brand rule). Shorts safe zone: no text in the bottom 20 %.
const INK = '#ffffff';
const OUTLINE = '#1a0b33';

const outline = (px: number): React.CSSProperties => ({
  WebkitTextStroke: `${px}px ${OUTLINE}`, paintOrder: 'stroke fill', textShadow: `0 ${px}px 0 ${OUTLINE}`,
});

/** Groups words into short phrases (break on punctuation or after 4 words) so one phrase reads at a glance. */
export function phrases(words: Word[]): Word[][] {
  const out: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (/[.!?,]$/.test(w.w) || cur.length >= 4) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  return out;
}

export const Captions: React.FC<{words: Word[]; accent: string; top: number; hideFrom: number}> = ({words, accent, top, hideFrom}) => {
  const f = useCurrentFrame();
  const {fps, width: W} = useVideoConfig();
  if (f >= hideFrom) return null;
  const groups = phrases(words);
  const g = groups.find((p, i) => f >= p[0].from && (i + 1 >= groups.length || f < groups[i + 1][0].from));
  if (!g) return null;
  return (
    <div style={{position: 'absolute', left: 60, width: W - 120, top, display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
      alignItems: 'baseline', gap: '0 22px', fontFamily: 'Raymi', lineHeight: 1.05}}>
      {g.map((w, i) => {
        const shown = f >= w.from;
        const active = f >= w.from && f < w.to + 4;
        const pop = spring({frame: f - w.from, fps, config: {damping: 10, stiffness: 260}});
        const size = w.key ? 128 : 88;
        return (
          <span key={i} style={{
            fontSize: size, color: w.key ? accent : INK, opacity: shown ? 1 : 0,
            transform: `translateY(${interpolate(pop, [0, 1], [26, 0])}px) scale(${shown ? interpolate(pop, [0, 1], [0.6, active ? 1.08 : 1]) : 0.6}) rotate(${w.key ? -4 : 0}deg)`,
            display: 'inline-block', ...outline(w.key ? 12 : 10),
          }}>{w.w.replace(/[,]$/, '')}</span>
        );
      })}
    </div>
  );
};

export const Stamp: React.FC<{text: string; from: number; to: number; top: number; accent: string; size?: number; bubble?: boolean}> = ({
  text, from, to, top, accent, size = 104, bubble = false,
}) => {
  const f = useCurrentFrame();
  const {fps, width: W} = useVideoConfig();
  if (f < from || f >= to) return null;
  const s = spring({frame: f - from, fps, config: {damping: 9, stiffness: 200}});
  const out = interpolate(f, [to - 6, to], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <div style={{position: 'absolute', top, left: 40, width: W - 80, display: 'flex', justifyContent: 'center',
      transform: `scale(${interpolate(s, [0, 1], [1.6, 1])}) rotate(${interpolate(s, [0, 1], [-8, -2])}deg)`, opacity: Math.min(s * 1.5, 1) * out}}>
      <div style={{fontFamily: 'Raymi', fontSize: size, color: '#fff', textAlign: 'center', lineHeight: 1.05, padding: bubble ? '26px 44px' : 0,
        background: bubble ? `${accent}e6` : 'transparent', borderRadius: bubble ? 48 : 0, border: bubble ? `8px solid ${OUTLINE}` : 'none',
        ...outline(12)}}>
        {text}
      </div>
    </div>
  );
};
