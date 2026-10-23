// SET dream - "Same Day" v3 (toki 2026-10-23: the beach is a METAPHOR, never a real beach): her own luminous open sea,
// everything she loves. Deep water lit from above (light rays fanning down, a bright surface glow far up), her
// bioluminescent motes drifting, and floating in it the things she loves - Salmon, her microphone, her violet headphones,
// a game controller, a stingray plush, little stars - bobbing slowly. Under her a soft glowing cushion of light (where she
// lands, floats, curls up) instead of sand. No shoreline, no sun disc, nothing literal.
// Same marks as the old beach set (shore / sand / water / float / sand_text / sky / chair), so a row can switch over.
// Options:
//   night: 0..1        the dream turns to night glow (deep violet, her dots and the motes brightest)
//   things_love: false  hide the floating favourite things (a close-up that wants only her)
//   dome: true          far below in the dark, the tiny grey office dome she left
//   page: frame         a blank calendar page drifts up and away
//   salmon / fish       creatures (creatures.tsx); things / crowd / strings -> routine.tsx
import React from 'react';
import * as THREE from 'three';
import {SetLight, canvasTexture, rnd, toon} from '../look';
import {DeepLife, SalmonBody} from '../creatures';
import {Headphones, RoutineLife} from '../routine';
import {RBox} from '../parts';
import type {SetProps} from './index';

type P3 = [number, number, number];
const num = (v: unknown, d = 0) => (typeof v === 'number' ? v : d);

const Mic: React.FC<{pos: P3; rot: P3}> = ({pos, rot}) => (
  <group position={pos} rotation={rot} scale={1.4}>
    <mesh material={toon('#d9d4f2', '#7a6cff', 0.15)}><sphereGeometry args={[0.06, 16, 12]} /></mesh>
    <mesh position={[0, -0.12, 0]} material={toon('#3a3550')}><cylinderGeometry args={[0.025, 0.018, 0.18, 12]} /></mesh>
  </group>
);

const Controller: React.FC<{pos: P3; rot: P3}> = ({pos, rot}) => (
  <group position={pos} rotation={rot} scale={1.5}>
    <RBox size={[0.2, 0.05, 0.1]} r={0.025} c="#5a4fc8" />
    {[-1, 1].map((s) => <mesh key={s} position={[s * 0.09, -0.005, 0.03]} material={toon('#5a4fc8')}><sphereGeometry args={[0.045, 12, 10]} /></mesh>)}
    {[[0.05, 0.03], [0.07, 0.01], [0.03, 0.01], [0.05, -0.01]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.028, z]}><sphereGeometry args={[0.009, 8, 6]} /><meshBasicMaterial color={['#ff6f9b', '#7fe6ff', '#ffd34d', '#9bff8a'][i]} toneMapped={false} /></mesh>
    ))}
    <mesh position={[-0.05, 0.028, 0.01]} material={toon('#2a2440')}><boxGeometry args={[0.04, 0.008, 0.012]} /></mesh>
    <mesh position={[-0.05, 0.028, 0.01]} material={toon('#2a2440')}><boxGeometry args={[0.012, 0.008, 0.04]} /></mesh>
  </group>
);

/** A soft stingray plush (her own shape): a flat diamond body with a tail and two dot eyes. */
const RayPlush: React.FC<{pos: P3; rot: P3}> = ({pos, rot}) => (
  <group position={pos} rotation={rot} scale={1.2}>
    <mesh material={toon('#8f86e8')} scale={[1, 0.28, 0.8]}><sphereGeometry args={[0.16, 4, 3]} /></mesh>
    <mesh position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]} material={toon('#8f86e8')}><coneGeometry args={[0.015, 0.22, 6]} /></mesh>
    {[-1, 1].map((s) => <mesh key={s} position={[s * 0.04, 0.035, 0.08]}><sphereGeometry args={[0.012, 8, 6]} /><meshBasicMaterial color="#1a1030" toneMapped={false} /></mesh>)}
  </group>
);

const Star: React.FC<{pos: P3; s: number; c: string}> = ({pos, s, c}) => {
  const tex = canvasTexture(`dreamstar${c}`, 128, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = c; ctx.beginPath();
    for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 - Math.PI / 2, r = k % 2 ? w * 0.2 : w * 0.48; ctx.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r); }
    ctx.fill();
  });
  return <mesh position={pos} scale={s}><planeGeometry args={[1, 1]} /><meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} side={THREE.DoubleSide} /></mesh>;
};

export const Dream: React.FC<SetProps> = ({f, fps, opts, camPos}) => {
  const night = num(opts.night);
  const top = new THREE.Color('#7fe9ff').lerp(new THREE.Color('#5a3aa8'), night);
  const mid = new THREE.Color('#2a8fd0').lerp(new THREE.Color('#24145a'), night);
  const deep = new THREE.Color('#14306e').lerp(new THREE.Color('#0a0620'), night);
  const sky = canvasTexture(`dreamwater${night.toFixed(2)}`, 64, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, top.getStyle()); g.addColorStop(0.45, mid.getStyle()); g.addColorStop(1, deep.getStyle());
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  const t = f / fps;
  const bob = (i: number, a = 0.06) => a * Math.sin(t * (0.6 + 0.1 * (i % 3)) + i * 1.7);
  const love = opts.things_love !== false;
  const pageD = typeof opts.page === 'number' ? f - opts.page : -1;
  return (
    <group>
      <SetLight sky={top.getStyle()} ground={deep.getStyle()} fill={1.35} key={new THREE.Color('#fff4e0').lerp(new THREE.Color('#c9a6ff'), night).getStyle()}
        keyI={1.6 - 0.6 * night} keyPos={[2, 12, 3]} target={[0, 0, 0]} shadowSize={6} fog={mid.getStyle()} fogNear={10} fogFar={60} bg={mid.getStyle()} />
      {/* the water all around: a gradient dome, bright from above */}
      <mesh scale={[120, 80, 120]} position={[0, -20, 0]}><sphereGeometry args={[1, 32, 20]} />
        <meshBasicMaterial map={sky} side={THREE.BackSide} fog={false} toneMapped={false} /></mesh>
      {/* the surface glow far above */}
      <mesh position={[0, 30, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[40, 40]} />
        <meshBasicMaterial color={top} transparent opacity={0.55} fog={false} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} /></mesh>
      {/* light rays fanning down from the surface, drifting */}
      {Array.from({length: 9}, (_, i) => (
        <mesh key={`ray${i}`} position={[-12 + i * 3 + Math.sin(t * 0.2 + i) * 0.8, 10, -6 - (i % 3) * 4]} rotation={[0.2 * Math.sin(i), 0, -0.25 + i * 0.06]} renderOrder={2}>
          <planeGeometry args={[1.2 + rnd(i) * 1.6, 30]} />
          <meshBasicMaterial color={new THREE.Color('#ffffff').lerp(new THREE.Color('#c9a6ff'), night)} transparent opacity={0.08 + 0.05 * Math.sin(t * 0.7 + i)} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* the cushion of light under her (where she lands, floats, curls up): soft rings, not sand */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} material={toon(new THREE.Color('#5ec8e8').lerp(new THREE.Color('#4a2c9a'), night).getStyle(), '#3aa0ff', 0.25)} receiveShadow>
        <circleGeometry args={[4.5, 48]} /></mesh>
      {Array.from({length: 4}, (_, k) => {
        const r = ((t * 0.35 + k / 4) % 1);
        return <mesh key={`ring${k}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <ringGeometry args={[r * 4.4, r * 4.4 + 0.05, 64]} />
          <meshBasicMaterial color="#e6fbff" transparent opacity={0.45 * (1 - r)} depthWrite={false} toneMapped={false} /></mesh>;
      })}
      {/* her motes: bioluminescent dots drifting up */}
      {Array.from({length: 70}, (_, i) => {
        const y = ((rnd(i * 3.1) * 9 + t * 0.25 * (0.4 + rnd(i))) % 9) - 1;
        return <mesh key={`mote${i}`} position={[(rnd(i) - 0.5) * 14, y, (rnd(i * 2.2) - 0.7) * 12]}>
          <sphereGeometry args={[0.02 + 0.03 * rnd(i * 5), 6, 4]} />
          <meshBasicMaterial color={i % 3 ? '#b98cff' : '#7fe6ff'} transparent opacity={0.5 + 0.5 * night} toneMapped={false} /></mesh>;
      })}
      {/* the things she loves, floating and bobbing around her */}
      {love ? (
        <group>
          <group position={[-1.6, 1.6 + bob(1), -1.2]} rotation={[0, 0.6, 0.2 * Math.sin(t * 0.5)]} scale={0.45}><SalmonBody f={f} /></group>
          <Mic pos={[1.4, 1.9 + bob(2), -0.8]} rot={[0.3, 0, -0.5 + 0.1 * Math.sin(t)]} />
          <Headphones t={{kind: 'headphones', pos: [-1.0, 0.9 + bob(3), 0.9], rot: [0.4, t * 0.3, 0.2], scale: 1.6}} f={f} />
          <Controller pos={[1.7, 0.8 + bob(4), 0.6]} rot={[0.5, t * 0.25, 0.3]} />
          <RayPlush pos={[0.9, 2.5 + bob(5), -1.8]} rot={[0.3, t * 0.2, 0.1]} />
          {[[-2.2, 2.8, -2.4, 0.3, '#ffd34d'], [2.4, 2.4, -2.2, 0.25, '#ff9ad5'], [-0.4, 3.2, -2.8, 0.22, '#9bf0ff'], [2.6, 1.2, -1.0, 0.18, '#ffd34d']].map(([x, y, z, s, c], i) => (
            <Star key={`st${i}`} pos={[x as number, (y as number) + bob(6 + i, 0.1), z as number]} s={s as number} c={c as string} />
          ))}
        </group>
      ) : null}
      {opts.dome ? (
        // far below in the dark: the tiny grey office dome she left
        <group position={[18, -14, -30]}>
          <mesh material={toon('#7d8296')}><sphereGeometry args={[2.2, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
          {Array.from({length: 6}, (_, i) => <mesh key={i} position={[Math.cos(i) * 1.7, 0.6, Math.sin(i) * 1.7]}><sphereGeometry args={[0.1, 6, 4]} />
            <meshBasicMaterial color="#e6ecff" toneMapped={false} /></mesh>)}
        </group>
      ) : null}
      {pageD >= 0 ? (
        <mesh position={[0.4 + pageD * 0.01, 0.2 + pageD * 0.03, -0.5 - pageD * 0.02]} rotation={[0.3 * Math.sin(pageD / 9), pageD * 0.02, 0.2]}>
          <planeGeometry args={[0.32, 0.36]} /><meshToonMaterial color="#f7f3e8" side={THREE.DoubleSide} /></mesh>
      ) : null}
      {night > 0 ? <pointLight position={[0, 1.4, 1.2]} color="#b98cff" intensity={3 * night} distance={6} decay={1.4} /> : null}
      <DeepLife opts={opts} f={f} fps={fps} camPos={camPos} />
      <RoutineLife opts={{...opts, salmon: undefined}} f={f} camPos={camPos} />
    </group>
  );
};
