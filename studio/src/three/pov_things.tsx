// Things of the POV Shorts (2026-10-23), reusable by every later video through opts.things (routine.tsx Things):
//   plate_sashimi  - a shell plate with orange salmon slices (the crime)
//   bff_drawing    - a framed crayon drawing of Raymi + Salmon with a heart and "BFF" (her font), built, never generated
//   glass_ray      - a small translucent glass ray figurine (her knick-knack shelf)
//   pumpkin        - a carved jack-o-lantern, glowing from inside (light: true adds its orange light)
//   beach_rock     - a rounded rock on the sand
//   paper_sheet    - a sheet of paper lying flat; blow_at (frame) = the wind lifts it and it flies away
//   crab           - a small red crab; snap: [frames] its claws snap; from + at + dur_s = it scuttles from there to pos
// Matte toon like every built prop (look.tsx); positions in set metres; frames from raymi/timeline.py.
import React from 'react';
import * as THREE from 'three';
import {Rock, drawText} from './parts';
import {canvasTexture, toon} from './look';

type P3 = [number, number, number];
export type PovThingSpec = {kind: string; pos: P3; rot?: P3; scale?: number; at?: number; blow_at?: number; snap?: number[];
  from?: P3; to?: P3; dur_s?: number; light?: boolean; c?: string};

const SALMON_SLICE = '#ff7a3d', FAT = '#fff1e6', INK = '#1a1030';

const PlateSashimi: React.FC<{t: PovThingSpec}> = ({t}) => (
  <group position={t.pos} rotation={t.rot ?? [0, 0, 0]} scale={t.scale ?? 1}>
    {/* a scallop-shell plate: a flat ribbed fan */}
    <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.85, 1]} material={toon('#f2e6f4')} castShadow receiveShadow>
      <circleGeometry args={[0.13, 12, 0, Math.PI]} />
    </mesh>
    <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon('#cdb6d8')}><ringGeometry args={[0.125, 0.135, 24, 1, 0, Math.PI]} /></mesh>
    {[-0.06, -0.02, 0.02, 0.06].map((x, i) => (
      <group key={i} position={[x, 0.022, 0.05 + 0.01 * (i % 2)]} rotation={[0, 0.3 - 0.2 * i, 0.12]}>
        <mesh material={toon(SALMON_SLICE)} castShadow><boxGeometry args={[0.035, 0.014, 0.07]} /></mesh>
        {[-0.018, 0, 0.018].map((z, j) => <mesh key={j} position={[0, 0.0075, z]} rotation={[0, 0.6, 0]} material={toon(FAT)}><boxGeometry args={[0.03, 0.002, 0.003]} /></mesh>)}
      </group>
    ))}
  </group>
);

const BffDrawing: React.FC<{t: PovThingSpec}> = ({t}) => {
  const tex = canvasTexture('bffdrawing', 384, 384, (ctx, w, h) => {
    ctx.fillStyle = '#fbf7ee'; ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // Raymi: a purple ray-girl doodle (round head, tako ears, a skirt triangle)
    ctx.fillStyle = '#7d4bd6'; ctx.strokeStyle = INK;
    ctx.beginPath(); ctx.arc(w * 0.32, h * 0.42, w * 0.11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(w * 0.32 + s * w * 0.07, h * 0.3, w * 0.035, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(w * 0.32, h * 0.52); ctx.lineTo(w * 0.2, h * 0.78); ctx.lineTo(w * 0.44, h * 0.78); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(w * 0.29, h * 0.42, 6, 0, Math.PI * 2); ctx.arc(w * 0.35, h * 0.42, 6, 0, Math.PI * 2); ctx.fill();
    // Salmon: an orange fish doodle
    ctx.fillStyle = '#ff8f6b';
    ctx.beginPath(); ctx.ellipse(w * 0.7, h * 0.55, w * 0.15, h * 0.08, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.55, h * 0.55); ctx.lineTo(w * 0.47, h * 0.47); ctx.lineTo(w * 0.47, h * 0.63); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(w * 0.78, h * 0.53, 6, 0, Math.PI * 2); ctx.fill();
    // a heart between them + BFF in her font
    ctx.fillStyle = '#ff5fa8';
    const hx = w * 0.52, hy = h * 0.3, r = w * 0.05;
    ctx.beginPath(); ctx.moveTo(hx, hy + r * 1.4); ctx.bezierCurveTo(hx - r * 2, hy, hx - r, hy - r * 1.2, hx, hy - r * 0.2);
    ctx.bezierCurveTo(hx + r, hy - r * 1.2, hx + r * 2, hy, hx, hy + r * 1.4); ctx.fill(); ctx.stroke();
    drawText(ctx, 'BFF', w * 0.5, h * 0.9, h * 0.13, '#7d4bd6');
  });
  return (
    <group position={t.pos} rotation={t.rot ?? [0, 0, 0]} scale={t.scale ?? 1}>
      <mesh material={toon('#c99a6a')} castShadow><boxGeometry args={[0.26, 0.26, 0.02]} /></mesh>
      <mesh position={[0, 0, 0.011]}><planeGeometry args={[0.22, 0.22]} /><meshToonMaterial map={tex} /></mesh>
    </group>
  );
};

const GlassRay: React.FC<{t: PovThingSpec}> = ({t}) => (
  <group position={t.pos} rotation={t.rot ?? [0, 0, 0]} scale={t.scale ?? 1}>
    <mesh position={[0, 0.03, 0]} scale={[1, 0.18, 0.8]}><sphereGeometry args={[0.06, 16, 10]} />
      <meshToonMaterial color="#8fe1ff" transparent opacity={0.7} emissive="#2a7da8" emissiveIntensity={0.4} /></mesh>
    <mesh position={[-0.07, 0.03, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.003, 0.006, 0.06, 6]} />
      <meshToonMaterial color="#8fe1ff" transparent opacity={0.7} /></mesh>
  </group>
);

const Pumpkin: React.FC<{t: PovThingSpec; f: number}> = ({t, f}) => {
  const flick = 0.85 + 0.15 * Math.sin(f * 0.7) * Math.sin(f * 0.23);
  const face = canvasTexture('pumpkinface', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ffd36a';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(w / 2 + s * w * 0.12, h * 0.3); ctx.lineTo(w / 2 + s * w * 0.28, h * 0.48); ctx.lineTo(w / 2 + s * w * 0.04, h * 0.48); ctx.closePath(); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(w * 0.22, h * 0.6);
    for (let k = 0; k <= 6; k++) ctx.lineTo(w * (0.22 + k * 0.093), h * (k % 2 ? 0.66 : 0.6));
    ctx.lineTo(w * 0.72, h * 0.74); ctx.quadraticCurveTo(w / 2, h * 0.86, w * 0.28, h * 0.74); ctx.closePath(); ctx.fill();
  });
  return (
    <group position={t.pos} rotation={t.rot ?? [0, 0, 0]} scale={t.scale ?? 1}>
      {[0, 1, 2, 3, 4].map((k) => (
        <mesh key={k} position={[0, 0.13, 0]} rotation={[0, (k / 5) * Math.PI, 0]} scale={[1, 0.82, 0.55]} material={toon('#ff8a1f')} castShadow>
          <sphereGeometry args={[0.16, 18, 12]} />
        </mesh>
      ))}
      <mesh position={[0, 0.27, 0]} material={toon('#4c7a3a')}><cylinderGeometry args={[0.015, 0.025, 0.07, 6]} /></mesh>
      <mesh position={[0, 0.13, 0.155]}><circleGeometry args={[0.13, 24]} />
        <meshBasicMaterial map={face} transparent blending={THREE.AdditiveBlending} opacity={flick} toneMapped={false} /></mesh>
      {t.light !== false ? <pointLight position={[0, 0.16, 0.25]} color="#ff9a3c" intensity={3.2 * flick} distance={2.6} decay={1.6} /> : null}
    </group>
  );
};

const PaperSheet: React.FC<{t: PovThingSpec; f: number}> = ({t, f}) => {
  const d = typeof t.blow_at === 'number' ? Math.max(0, f - t.blow_at) : 0;
  const p: P3 = [t.pos[0] + d * 0.035, t.pos[1] + 0.003 + Math.min(1.6, d * d * 0.0016), t.pos[2] - d * 0.01];
  return (
    <mesh position={p} rotation={[-Math.PI / 2 + Math.sin(d * 0.3) * Math.min(1, d / 10) * 0.9, d * 0.04, d * 0.05]} scale={t.scale ?? 1} castShadow receiveShadow>
      <planeGeometry args={[0.21, 0.297]} /><meshToonMaterial color="#fbfbf6" side={THREE.DoubleSide} />
    </mesh>
  );
};

const Crab: React.FC<{t: PovThingSpec; f: number}> = ({t, f}) => {
  let p = t.pos;
  if (t.from && typeof t.at === 'number') {
    const k = Math.max(0, Math.min(1, (f - t.at) / Math.max(1, (t.dur_s ?? 1) * 30)));
    p = [t.from[0] + (t.pos[0] - t.from[0]) * k, t.from[1] + (t.pos[1] - t.from[1]) * k, t.from[2] + (t.pos[2] - t.from[2]) * k];
  }
  let snap = 0;
  for (const s of t.snap ?? []) { const d = f - s; if (d >= 0 && d < 8) snap = Math.max(snap, Math.sin((d / 8) * Math.PI)); }
  const c = t.c ?? '#e2483d';
  const legs = Math.sin(f * 0.9) * 0.25;
  return (
    <group position={p} rotation={t.rot ?? [0, 0, 0]} scale={t.scale ?? 1}>
      <mesh position={[0, 0.05, 0]} scale={[1, 0.45, 0.75]} material={toon(c)} castShadow><sphereGeometry args={[0.08, 16, 10]} /></mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          {/* eye stalks */}
          <mesh position={[0.05, 0.1, s * 0.025]} material={toon('#ffffff')}><sphereGeometry args={[0.013, 8, 6]} /></mesh>
          <mesh position={[0.058, 0.1, s * 0.025]} material={toon(INK)}><sphereGeometry args={[0.007, 6, 5]} /></mesh>
          {/* claws: two pincers that open and snap shut */}
          <group position={[0.1, 0.06, s * 0.07]} rotation={[0, -s * 0.4, 0.3]}>
            <mesh material={toon(c)} scale={[1, 0.6, 0.6]}><sphereGeometry args={[0.03, 10, 8]} /></mesh>
            <mesh position={[0.03, 0.01 + 0.015 * (1 - snap), 0]} rotation={[0, 0, 0.5 * (1 - snap)]} material={toon(c)}><coneGeometry args={[0.012, 0.05, 6]} /></mesh>
            <mesh position={[0.03, -0.01 - 0.015 * (1 - snap), 0]} rotation={[0, 0, Math.PI - 0.5 * (1 - snap)]} material={toon(c)}><coneGeometry args={[0.012, 0.05, 6]} /></mesh>
          </group>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[-0.02 + k * 0.025, 0.03, s * 0.07]} rotation={[s * (0.9 + (k % 2 ? legs : -legs)), 0, 0]} material={toon(c)}>
              <cylinderGeometry args={[0.005, 0.004, 0.07, 5]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

/** One of the POV things by kind (null for kinds this file does not know). */
export const PovThing: React.FC<{t: PovThingSpec; f: number}> = ({t, f}) => {
  switch (t.kind) {
    case 'plate_sashimi': return <PlateSashimi t={t} />;
    case 'bff_drawing': return <BffDrawing t={t} />;
    case 'glass_ray': return <GlassRay t={t} />;
    case 'pumpkin': return <Pumpkin t={t} f={f} />;
    case 'beach_rock': return <Rock pos={t.pos} size={[0.22 * (t.scale ?? 1), 0.14 * (t.scale ?? 1), 0.18 * (t.scale ?? 1)]} seed={7} c={t.c ?? '#7e7a8c'} />;
    case 'paper_sheet': return <PaperSheet t={t} f={f} />;
    case 'crab': return <Crab t={t} f={f} />;
    default: return null;
  }
};

export const POV_THINGS = ['plate_sashimi', 'bff_drawing', 'glass_ray', 'pumpkin', 'beach_rock', 'paper_sheet', 'crab'];
