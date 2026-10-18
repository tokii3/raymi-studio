// Built story props for the aquarium (KING build list; every one is an option of the aquarium set, reusable by any
// video): the hero phone, a knuckle tapping the glass, hand silhouettes on the glass, wish coins (drop down the chute,
// rain, pile), the souvenir deck on the chute ledge (tips, slides), hand-sized cards raining through the water, the
// scattered real deck, the dead work lamp, the salmon. Deterministic and frame-driven.
import React from 'react';
import * as THREE from 'three';
import {RBox, phoneUI} from './parts';
import {Card} from './cards';
import {blobTexture, canvasTexture, rnd, toon} from './look';
import {ease} from '../film/motion';

type P3 = [number, number, number];
export const CARD_REAL = 0.12;            // a real playing card next to her (1.55 m figure): ~22 cm, reads as hand-sized

/** A wish coin: gold disc, engraved star, rim. */
export const Coin: React.FC<{pos: P3; rot?: P3; scale?: number}> = ({pos, rot = [0, 0, 0], scale = 1}) => {
  const face = canvasTexture('coin_face', 128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#e3b84e'; ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#a07624'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 10, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#a07624'; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 16 : 36, a = (i / 10) * Math.PI * 2 - Math.PI / 2; ctx.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); }
    ctx.fill();
  });
  return (
    <group position={pos} rotation={rot} scale={scale}>
      <mesh castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.014, 28]} />
        {/* gold catches any light: a little self-glow so a coin never turns into a black slab at night (stills run 19) */}
        <meshToonMaterial attach="material-0" color="#c9982f" emissive="#7a5410" emissiveIntensity={0.55} />
        <meshToonMaterial attach="material-1" map={face} emissive="#7a5410" emissiveIntensity={0.45} />
        <meshToonMaterial attach="material-2" map={face} emissive="#7a5410" emissiveIntensity={0.45} />
      </mesh>
    </group>
  );
};

/** The hero phone held up in the dark hall: body, her on the screen, the camera app, a flash. */
export const HeroPhone: React.FC<{pos: P3; screen?: THREE.Texture; flash: number}> = ({pos, screen, flash}) => (
  <group position={pos} rotation={[0.08, Math.PI, 0.05]}>
    <RBox size={[0.36, 0.7, 0.03]} r={0.03} c="#4a4560" cast={false} />
    <mesh position={[0, 0, -0.017]} rotation={[0, Math.PI, 0]}><planeGeometry args={[0.32, 0.64]} />
      {screen ? <meshBasicMaterial map={screen} toneMapped={false} /> : <meshBasicMaterial color="#7fd8ff" toneMapped={false} />}</mesh>
    <mesh position={[0, 0, -0.019]} rotation={[0, Math.PI, 0]}><planeGeometry args={[0.32, 0.64]} />
      <meshBasicMaterial map={phoneUI()} transparent depthWrite={false} toneMapped={false} /></mesh>
    <mesh position={[0.02, -0.38, 0.05]} material={toon('#231b4a')}><boxGeometry args={[0.22, 0.26, 0.12]} /></mesh>
    {flash > 0 ? (
      <mesh position={[0.1, 0.27, 0.05]}><planeGeometry args={[1.2 * flash, 1.2 * flash]} />
        <meshBasicMaterial map={blobTexture('#ffffff')} transparent opacity={0.95 * flash} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} /></mesh>
    ) : null}
  </group>
);

/** A knuckle tapping the glass from the hall: it swings in, hits (ripple on the glass), swings back. d = frames since. */
export const KnuckleTap: React.FC<{pos: P3; d: number; big?: number}> = ({pos, d, big = 1}) => {
  if (d > 10) return null;
  const hit = d < 3 ? d / 3 : 1 - (d - 3) / 7;
  const ring = d >= 3 ? (d - 3) / 7 : 0;
  return (
    <group position={pos} scale={big}>
      <group position={[0, 0, 0.35 * (1 - hit)]}>
        <mesh material={toon('#1b1438')} castShadow><sphereGeometry args={[0.16, 14, 10]} /></mesh>
        {[-0.09, -0.03, 0.03, 0.09].map((x) => <mesh key={x} position={[x, 0.08, -0.1]} material={toon('#1b1438')}><sphereGeometry args={[0.05, 8, 6]} /></mesh>)}
        <mesh position={[0, -0.25, 0.2]} rotation={[0.6, 0, 0]} material={toon('#1b1438')}><cylinderGeometry args={[0.09, 0.11, 0.6, 10]} /></mesh>
      </group>
      {ring > 0 ? (
        <mesh position={[0, 0.05, -0.2]}><ringGeometry args={[0.1 + ring * 0.5, 0.13 + ring * 0.52, 40]} />
          <meshBasicMaterial color="#e8fbff" transparent opacity={0.6 * (1 - ring)} depthWrite={false} toneMapped={false} /></mesh>
      ) : null}
    </group>
  );
};

/** Two big hand silhouettes pressed on the glass from the hall; `fade` 0..1 = gone. */
export const GlassHands: React.FC<{pos: P3; fade: number}> = ({pos, fade}) => {
  const tex = canvasTexture('glass_hand', 256, 320, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#120c26';
    ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.66, w * 0.3, h * 0.26, 0, 0, Math.PI * 2); ctx.fill();
    for (const [x, len, a] of [[0.24, 0.28, -0.5], [0.38, 0.38, -0.12], [0.52, 0.42, 0], [0.65, 0.38, 0.12], [0.77, 0.3, 0.3]]) {
      ctx.save(); ctx.translate(w * x, h * 0.5); ctx.rotate(a); ctx.beginPath(); ctx.roundRect(-w * 0.05, -h * len, w * 0.1, h * len, w * 0.05); ctx.fill(); ctx.restore();
    }
  });
  return (
    <group position={pos}>
      {[-0.45, 0.45].map((x) => (
        <mesh key={x} position={[x, 0, 0]} scale={[x < 0 ? -1 : 1, 1, 1]}><planeGeometry args={[0.7, 0.88]} />
          <meshBasicMaterial map={tex} transparent opacity={0.85 * (1 - fade)} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      ))}
    </group>
  );
};

/** The souvenir deck on the chute ledge: her face on the top card; tip (frame) = the top card tips into the slot,
 *  slide (frame) = the rest follows card by card. */
export const LedgeDeck: React.FC<{pos: P3; f: number; tip?: number; slide?: number; sprite?: string}> = ({pos, f, tip, slide, sprite}) => {
  const n = 10;
  return (
    <group position={pos}>
      {Array.from({length: n}, (_, i) => {
        const top = i === n - 1;
        const start = top ? tip : slide !== undefined ? slide + (n - 2 - i) * 2 : undefined;
        const t = start === undefined ? 0 : Math.max(0, Math.min(1, (f - start) / 8));
        if (t >= 1) return null;
        const y = 0.01 + i * 0.006 + (t > 0 ? -0.2 * ease('in', t) : 0);
        return <Card key={i} pos={[0, y, -0.35 * ease('in', t)]} rot={[-Math.PI / 2 + 1.2 * t, 0, 0.15 + i * 0.01]} scale={CARD_REAL}
          back={!top} rank="K" sprite={top ? sprite : undefined} />;
      })}
    </group>
  );
};

/** Hand-sized cards sinking through the water around a point like leaves (born between frames a..b), some her face. */
export const CardRain: React.FC<{center: P3; f: number; a: number; b: number; n?: number; sprite?: string; spread?: number}> = ({center, f, a, b, n = 18, sprite, spread = 1.6}) => {
  if (f < a) return null;
  return (
    <group position={center}>
      {Array.from({length: n}, (_, i) => {
        const born = a + rnd(i + 3) * Math.max(1, b - a) * 0.6;
        if (f < born) return null;
        const t = (f - born) / 90;
        const y = 4.1 - Math.min(1, t) * 4.05;
        const sw = Math.sin(t * 7 + i) * 0.35;
        const x = (rnd(i) - 0.5) * spread * 2 + sw, z = (rnd(i + 7) - 0.5) * spread;
        const settled = t >= 1;
        return <Card key={i} pos={[x, y, z]} rot={settled ? [-Math.PI / 2, 0, rnd(i + 9) * 3] : [Math.sin(t * 5 + i) * 0.9, t * 3 + i, Math.cos(t * 4 + i) * 0.7]}
          scale={CARD_REAL} rank="K" sprite={i % 3 === 0 ? sprite : undefined} back={i % 3 === 1} />;
      })}
    </group>
  );
};

/** The real deck scattered on the sand (after the night), small next to her. */
export const ScatteredDeck: React.FC<{center: P3; n?: number; r?: number; sprite?: string}> = ({center, n = 22, r = 1.3, sprite}) => (
  <group position={center}>
    {Array.from({length: n}, (_, i) => {
      const a = rnd(i + 40) * Math.PI * 2, d = Math.sqrt(rnd(i + 41)) * r;
      return <Card key={i} pos={[Math.cos(a) * d, 0.01 + i * 0.002, Math.sin(a) * d * 0.7]} rot={[-Math.PI / 2, 0, rnd(i + 42) * 6]} scale={CARD_REAL}
        back={rnd(i + 43) < 0.4} rank={['K', 'A', '7', 'Q'][i % 4]} sprite={i % 5 === 0 ? sprite : undefined} />;
    })}
  </group>
);

/** The tank's night-service work lamp on its cable: caged, dark after the night, a coin stuck in its cage. */
export const WorkLamp: React.FC<{pos: P3; on?: number; coin?: boolean; swing?: number}> = ({pos, on = 0, coin = false, swing = 0}) => (
  <group position={pos} rotation={[0, 0, swing]}>
    <mesh position={[0, 1.2, 0]} material={toon('#151022')}><cylinderGeometry args={[0.012, 0.012, 2.4, 6]} /></mesh>
    <mesh material={toon('#2b2340')} castShadow><coneGeometry args={[0.16, 0.14, 16, 1, true]} /></mesh>
    <mesh position={[0, -0.09, 0]}><sphereGeometry args={[0.07, 14, 10]} />
      <meshBasicMaterial color={on > 0.2 ? '#fff1cc' : '#3d3328'} toneMapped={false} /></mesh>
    {Array.from({length: 6}, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return <mesh key={i} position={[Math.cos(a) * 0.1, -0.12, Math.sin(a) * 0.1]} material={toon('#5b5170')}><boxGeometry args={[0.008, 0.16, 0.008]} /></mesh>;
    })}
    {coin ? <Coin pos={[0.04, -0.14, 0.09]} rot={[1.2, 0.3, 0.2]} scale={0.7} /> : null}
  </group>
);

/** The salmon: a salmon-coloured fish holding at a point, or swimming in from `from` between frames a..b. */
export const Salmon: React.FC<{at: P3; f: number; a?: number; b?: number; from?: P3}> = ({at, f, a, b, from}) => {
  let p: P3 = at, yaw = 0;
  if (a !== undefined && b !== undefined && from) {
    const t = ease('inOut', (f - a) / Math.max(1, b - a));
    p = [from[0] + (at[0] - from[0]) * t, from[1] + (at[1] - from[1]) * t, from[2] + (at[2] - from[2]) * t];
    yaw = -Math.atan2(at[2] - from[2], at[0] - from[0]);
  }
  const wig = Math.sin(f * 0.5) * 0.4;
  return (
    <group position={[p[0], p[1] + 0.04 * Math.sin(f / 13), p[2]]} rotation={[0, yaw, 0]} scale={0.42}>
      <mesh material={toon('#ff8f6b')} castShadow scale={[1, 0.5, 0.3]}><sphereGeometry args={[0.5, 16, 12]} /></mesh>
      <mesh material={toon('#ffc3a8')} position={[0, -0.08, 0]} scale={[0.85, 0.25, 0.28]}><sphereGeometry args={[0.5, 12, 8]} /></mesh>
      <group position={[-0.48, 0, 0]} rotation={[0, wig, 0]}>
        <mesh position={[-0.16, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={toon('#e86d52')} scale={[1, 1, 0.25]}><coneGeometry args={[0.24, 0.34, 3]} /></mesh>
      </group>
      <mesh position={[0.32, 0.06, 0.13]} material={toon('#140b24')}><sphereGeometry args={[0.04, 8, 6]} /></mesh>
    </group>
  );
};
