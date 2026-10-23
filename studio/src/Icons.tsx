import React from 'react';
import {spring, useVideoConfig} from 'remotion';

// Reaction icons are her body language (heart, !, ?, sweat, anger, Zz, bulb, sparkle, music) - they POP on the beat.
export const ReactionIcon: React.FC<{kind: string; x: number; y: number; local: number; accent: string}> = ({kind, x, y, local, accent}) => {
  const {fps} = useVideoConfig();
  if (local < 2) return null;
  const s = spring({frame: local - 2, fps, config: {damping: 8, stiffness: 220}});
  const wob = Math.sin(local / 5) * 6;
  const stroke = {stroke: '#1a0b33', strokeWidth: 7, strokeLinejoin: 'round' as const, paintOrder: 'stroke' as const};
  let body: React.ReactNode;
  switch (kind) {
    case 'heart': body = <path d="M60 104 C10 70 0 40 22 22 C40 8 56 18 60 32 C64 18 80 8 98 22 C120 40 110 70 60 104Z" fill="#ff6fb5" {...stroke} />; break;
    case '!': body = <><rect x={48} y={6} width={24} height={70} rx={10} fill="#ffd34d" {...stroke} /><circle cx={60} cy={98} r={13} fill="#ffd34d" {...stroke} /></>; break;
    case '?': body = <text x={60} y={100} textAnchor="middle" fontSize={120} fontFamily="Raymi" fill="#7fe3ff" {...stroke}>?</text>; break;
    case 'sweat': body = <path d="M60 8 C80 40 92 58 92 76 A32 32 0 0 1 28 76 C28 58 40 40 60 8Z" fill="#8fd8ff" {...stroke} />; break;
    case 'anger': body = <g stroke="#ff4d6d" strokeWidth={12} strokeLinecap="round" fill="none"><path d="M20 40 Q40 40 40 20" /><path d="M80 20 Q80 40 100 40" /><path d="M20 80 Q40 80 40 100" /><path d="M80 100 Q80 80 100 80" /></g>; break;
    case 'zz': body = <text x={60} y={90} textAnchor="middle" fontSize={80} fontFamily="Raymi" fill="#c9b8ff" {...stroke}>Zz</text>; break;
    case 'bulb': body = <><circle cx={60} cy={50} r={36} fill="#fff27a" {...stroke} /><rect x={44} y={84} width={32} height={22} rx={6} fill="#c9c9d9" {...stroke} /></>; break;
    case 'sparkle': body = <path d="M60 4 L72 48 L116 60 L72 72 L60 116 L48 72 L4 60 L48 48Z" fill="#fff" {...stroke} />; break;
    case 'bubbles': body = <>{[[38, 82, 20], [76, 60, 15], [50, 34, 11], [84, 22, 8]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#bdf2ff" fillOpacity={0.55} {...stroke} strokeWidth={5} />)}</>; break;
    case 'music': body = <><path d="M44 90 V24 L96 12 V78" fill="none" stroke={accent} strokeWidth={10} /><circle cx={36} cy={92} r={14} fill={accent} /><circle cx={88} cy={80} r={14} fill={accent} /></>; break;
    default: return null;
  }
  return (
    <svg width={120} height={120} viewBox="0 0 120 120"
      style={{position: 'absolute', left: x - 60, top: y - 60, transform: `scale(${s * 1.25}) rotate(${wob}deg)`, overflow: 'visible',
        filter: `drop-shadow(0 4px 0 rgba(0,0,0,0.25))`}}>
      {body}
    </svg>
  );
};
