// SET bedroom - "Same Day": her small dry room inside an air dome on the deep-sea floor. A shell bed (scallop
// headboard, a soft mattress, a blanket), a coral nightstand with the twin-bell alarm clock, the tide calendar on the
// wall, a round window onto the dark sea with marine snow, a shelf of knick-knacks (shells, a tiny Salmon plush, a
// jar of sea glass), a door. Bed top at y 0.48 (mark "bed": lie her there), she sits up / stands at "bedside".
// Options:
//   dark: 0..1         night (only the window's sea glow) - 0 = the morning lamp on
//   bed_drag: [frame, dx, dz, frames]   the bed slides away (dragged by the strings) by (dx, dz) over frames
//   things / strings / crowd / boss  -> routine.tsx
//   lamp_at: frame       you switch the light on: before it the room is dark (dark, default 0.85), after it lit (lit,
//                        default 0.15) with a 4-frame flare (POV Shorts)
//   window_view: true    the round window is real glass: behind it the dark sea and whatever swims there (salmon)
//   salmon / fish        creatures (creatures.tsx DeepLife) - e.g. the salmon outside the window, pressing his face on it
import React from 'react';
import * as THREE from 'three';
import {RBox, Sign, drawText} from '../parts';
import {SetLight, canvasTexture, rnd, toon, toonSurface} from '../look';
import {RoutineLife} from '../routine';
import {RoomClutter} from '../clutter';
import {DeepLife, SalmonBody} from '../creatures';
import {flare} from '../events';
import {ease} from '../../film/motion';
import type {SetProps} from './index';

const num = (v: unknown, d = 0) => (typeof v === 'number' ? v : d);

export const Bedroom: React.FC<SetProps> = ({f, fps, opts, camPos}) => {
  const lampAt = typeof opts.lamp_at === 'number' ? opts.lamp_at : null;
  const dark = lampAt === null ? num(opts.dark) : f < lampAt ? num(opts.dark, 0.85) : num(opts.lit, 0.15);
  const power = Math.max(0.08, 1 - dark) + (lampAt === null ? 0 : 0.6 * flare(lampAt, f, 4));
  const view = Boolean(opts.window_view);
  let drag: [number, number] = [0, 0];
  if (Array.isArray(opts.bed_drag)) {
    const [at, dx, dz, n] = opts.bed_drag as number[];
    const t = ease('in', Math.min(1, Math.max(0, (f - at) / Math.max(1, n ?? 30))));
    drag = [dx * t, dz * t];
  }
  const sea = canvasTexture('bedroomsea', 256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h * 0.3, 10, w / 2, h / 2, w * 0.7);
    g.addColorStop(0, '#1d3a6a'); g.addColorStop(1, '#070c1e');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  return (
    <group>
      <SetLight sky="#c6cde6" ground="#2a2540" fill={0.6 * power + 0.12} key="#fff1dc" keyI={2.4 * power} keyPos={[2, 4.5, 3]}
        target={[0, 0.4, 0]} shadowSize={5} fog="#2a2c40" fogNear={8} fogFar={20} bg="#22243a" />
      {/* the dome: a curved wall with ribs */}
      <mesh position={[0, 0, -0.5]} material={toon('#5c6080', '#000', 1, {side: THREE.BackSide})}><sphereGeometry args={[4.2, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
      {Array.from({length: 8}, (_, i) => (
        <mesh key={i} position={[0, 0, -0.5]} rotation={[0, (i / 8) * Math.PI * 2, 0]} material={toon('#474b68')}>
          <torusGeometry args={[4.15, 0.04, 6, 40, Math.PI]} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.5]} material={toonSurface('#6a5f7c', 'wood', [8, 8])} receiveShadow><circleGeometry args={[4.2, 40]} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.3, 0.004, 0.6]} material={toonSurface('#8b7aa6', 'carpet', [3, 3])} receiveShadow><circleGeometry args={[1.3, 32]} /></mesh>
      {/* the round window onto the sea, marine snow drifting */}
      <group position={[-1.6, 1.8, -3.6]} rotation={[0, 0.4, 0]}>
        <mesh material={toon('#3d4260')}><torusGeometry args={[0.72, 0.09, 10, 32]} /></mesh>
        {view ? (
          <>
            {/* real glass: the sea far behind (a backdrop disk deep in the wall), a faint tint + a glint on the pane */}
            <mesh position={[0, 0, -0.42]}><circleGeometry args={[0.95, 32]} /><meshBasicMaterial map={sea} toneMapped={false} /></mesh>
            <mesh position={[0, 0, 0.005]}><circleGeometry args={[0.7, 32]} /><meshBasicMaterial color="#9fd0ff" transparent opacity={0.12} toneMapped={false} depthWrite={false} /></mesh>
            <mesh position={[0.25, 0.3, 0.006]} rotation={[0, 0, -0.7]}><planeGeometry args={[0.04, 0.35]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.25} toneMapped={false} depthWrite={false} /></mesh>
          </>
        ) : <mesh><circleGeometry args={[0.7, 32]} /><meshBasicMaterial map={sea} toneMapped={false} /></mesh>}
        {Array.from({length: 18}, (_, i) => (
          <mesh key={i} position={[(rnd(i) - 0.5) * 1.2, ((rnd(i * 2.7) * 1.3 - f * 0.003 * (0.6 + rnd(i))) % 1.3 + 1.3) % 1.3 - 0.65, 0.01]}>
            <circleGeometry args={[0.01 + 0.01 * rnd(i * 4), 6]} /><meshBasicMaterial color="#dfe8ff" toneMapped={false} /></mesh>
        ))}
        <pointLight position={[0, 0, 0.6]} color="#5f86d8" intensity={2.5} distance={4} decay={1.5} />
      </group>
      {/* the shell bed (dragged by the strings) */}
      <group position={[drag[0], 0, drag[1]]}>
        <RBox size={[1.0, 0.28, 2.0]} pos={[0, 0.14, 0]} r={0.08} c="#d9c7e6" />
        <RBox size={[0.92, 0.12, 1.9]} pos={[0, 0.34, 0.02]} r={0.06} c="#f4f0fa" t="fabric" />
        <RBox size={[0.96, 0.08, 1.2]} pos={[0, 0.42, 0.35]} r={0.05} c="#8a7fd0" t="plush" />
        <RBox size={[0.5, 0.1, 0.32]} pos={[0, 0.45, -0.72]} r={0.05} c="#ffffff" />
        {/* scallop headboard */}
        <group position={[0, 0.65, -1.02]}>
          {Array.from({length: 7}, (_, i) => {
            const a = -0.9 + (i / 6) * 1.8;
            return <mesh key={i} position={[Math.sin(a) * 0.35, Math.cos(a) * 0.35 - 0.1, 0]} rotation={[0, 0, -a]} material={toon(i % 2 ? '#f1c7d8' : '#f6d8e4')}>
              <boxGeometry args={[0.16, 0.7, 0.06]} /></mesh>;
          })}
        </group>
      </group>
      {/* the coral nightstand */}
      <group position={[0.85, 0, -0.75]}>
        {Array.from({length: 4}, (_, i) => (
          <mesh key={i} position={[0.06 * Math.sin(i * 2), 0.22, 0.06 * Math.cos(i * 2)]} rotation={[0.15 * Math.sin(i), 0, 0.15 * Math.cos(i)]} material={toon('#ff9a8a')}>
            <cylinderGeometry args={[0.03, 0.05, 0.44, 8]} /></mesh>
        ))}
        <RBox size={[0.42, 0.05, 0.36]} pos={[0, 0.46, 0]} r={0.02} c="#ffb3a6" />
      </group>
      {/* shelf with knick-knacks on the wall */}
      <group position={[1.9, 1.35, -3.2]} rotation={[0, -0.5, 0]}>
        <RBox size={[1.1, 0.04, 0.22]} r={0.01} c="#a58fc2" />
        <mesh position={[-0.38, 0.07, 0]} material={toon('#f3d6b0')} scale={[1, 0.6, 1]}><sphereGeometry args={[0.07, 12, 8]} /></mesh>
        <mesh position={[-0.12, 0.09, 0]} material={toon('#b6e7f0', '#000', 1, {opacity: 0.7})}><cylinderGeometry args={[0.06, 0.06, 0.14, 14]} /></mesh>
        <group position={[0.22, 0.08, 0]} scale={0.18} rotation={[0, -0.6, 0]}><SalmonBody f={0} /></group>
        <mesh position={[0.43, 0.06, 0]} material={toon('#ffd36b')}><coneGeometry args={[0.05, 0.1, 5]} /></mesh>
      </group>
      {/* the door */}
      <group position={[2.9, 0, -1.6]} rotation={[0, -1.05, 0]}>
        <RBox size={[1.0, 2.1, 0.1]} pos={[0, 1.05, 0]} r={0.04} c="#3b3f5e" />
        <mesh position={[0.36, 1.0, 0.06]} material={toon('#d6c38a')}><sphereGeometry args={[0.04, 10, 8]} /></mesh>
      </group>
      {/* a readable label on the dome wall: her room */}
      <Sign id="bedroomsign" pos={[-0.2, 2.35, -3.95]} size={[0.9, 0.22]} paint={(ctx, w, h) => {
        ctx.fillStyle = '#4b4f70'; ctx.fillRect(0, 0, w, h); drawText(ctx, 'DOME 7 - RAYMI', w / 2, h / 2, h * 0.55, '#e7e2ff', {maxW: w * 0.9});
      }} />
      {power > 0.2 ? <pointLight position={[0.8, 1.2, -0.6]} color="#ffe6c4" intensity={3 * power} distance={4} decay={1.5} /> : null}
      <RoomClutter f={f} />
      <RoutineLife opts={opts} f={f} camPos={camPos} />
      <DeepLife opts={opts} f={f} fps={fps} camPos={camPos} />
    </group>
  );
};
