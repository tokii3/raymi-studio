// Story props with a reason (PRINCIPLES 15: lived-in details): her bottle-cap crown (she collects knick-knacks),
// the giant clam throne, the aquarium's toy castle, velvet-rope stanchions, playing cards, chips, studio cameras.
import React from 'react';
import * as THREE from 'three';
import {RBox} from './parts';
import {rnd, toon} from './look';

type P3 = [number, number, number];

/** A bottle cap as a crown: crimped skirt (21 teeth), a painted top. Raymi's crown is junk she found and LOVES. */
export const BottleCap: React.FC<{pos: P3; rot?: P3; scale?: number; c?: string; top?: string}> = ({pos, rot = [0, 0, 0], scale = 1, c = '#e8b94a', top = '#8f4bd6'}) => {
  const teeth = Array.from({length: 21}, (_, i) => {
    const a = (i / 21) * Math.PI * 2;
    return (
      <mesh key={i} position={[Math.cos(a) * 0.105, 0.03, Math.sin(a) * 0.105]} rotation={[0, -a, 0]} material={toon(c)} castShadow>
        <boxGeometry args={[0.012, 0.075, 0.032]} />
      </mesh>
    );
  });
  return (
    <group position={pos} rotation={rot} scale={scale}>
      <mesh material={toon(c)} castShadow position={[0, 0.03, 0]}><cylinderGeometry args={[0.1, 0.112, 0.075, 42, 1, true]} /></mesh>
      <mesh material={toon(top)} castShadow position={[0, 0.07, 0]}><cylinderGeometry args={[0.1, 0.1, 0.012, 42]} /></mesh>
      <mesh material={toon('#ffe9a8')} position={[0, 0.078, 0]}><torusGeometry args={[0.07, 0.006, 6, 32]} /></mesh>
      {teeth}
    </group>
  );
};

/** Giant clam shell: two ribbed half-shells, the upper one open = a throne back. */
export const Clam: React.FC<{pos: P3; rotY?: number; scale?: number; c?: string; inner?: string; open?: number}> = ({pos, rotY = 0, scale = 1, c = '#d9c7f0', inner = '#ff9fcf', open = 1.1}) => {
  const ribs = 9;
  const half = (upper: boolean) => (
    <group rotation={[upper ? -open : 0, 0, 0]}>
      {Array.from({length: ribs}, (_, i) => {
        const a = ((i + 0.5) / ribs - 0.5) * Math.PI * 0.9;
        return (
          <mesh key={i} position={[Math.sin(a) * 0.55, 0, -Math.cos(a) * 0.08 - 0.05]} rotation={[0, 0, -a]} material={toon(c)} castShadow receiveShadow>
            <cylinderGeometry args={[0.07, 0.11, 1.0, 10, 1, false, 0, Math.PI]} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.0, -0.02]} scale={[0.62, 0.5, 0.12]} material={toon(inner)} receiveShadow><sphereGeometry args={[1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
    </group>
  );
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={scale}>
      <group position={[0, 0.5, 0]}>{half(true)}</group>
    </group>
  );
};

/** The aquarium's toy castle (every fish tank has one): stacked towers with crenellations and dark windows. */
export const ToyCastle: React.FC<{pos: P3; scale?: number; rotY?: number; c?: string}> = ({pos, scale = 1, rotY = 0, c = '#b9a7d8'}) => {
  const tower = (x: number, z: number, h: number, r: number, k: number) => (
    <group key={k} position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]} material={toon(c)} castShadow receiveShadow><cylinderGeometry args={[r, r * 1.08, h, 14]} /></mesh>
      {Array.from({length: 8}, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <mesh key={i} position={[Math.cos(a) * r * 0.9, h + 0.04, Math.sin(a) * r * 0.9]} material={toon(c)} castShadow><boxGeometry args={[r * 0.35, 0.08, r * 0.35]} /></mesh>;
      })}
      <mesh position={[0, h * 0.62, r * 0.98]} material={toon('#241a3d')}><boxGeometry args={[r * 0.35, r * 0.6, 0.02]} /></mesh>
      <mesh position={[0, h + 0.2, 0]} material={toon('#ff7eb6')} castShadow><coneGeometry args={[r * 1.05, 0.32, 14]} /></mesh>
    </group>
  );
  return (
    <group position={pos} scale={scale} rotation={[0, rotY, 0]}>
      {tower(0, 0, 0.9, 0.16, 0)}
      {tower(-0.32, 0.08, 0.6, 0.12, 1)}
      {tower(0.3, 0.1, 0.52, 0.11, 2)}
      <RBox size={[0.75, 0.36, 0.3]} pos={[0, 0.18, 0.12]} r={0.03} c={c} />
      <mesh position={[0, 0.13, 0.28]} material={toon('#241a3d')}><boxGeometry args={[0.14, 0.24, 0.02]} /></mesh>
    </group>
  );
};

/** Queue stanchion pair with a sagging velvet rope. */
export const Stanchions: React.FC<{a: P3; b: P3; c?: string; rope?: string}> = ({a, b, c = '#c9a64a', rope = '#7b2a6e'}) => {
  const post = (p: P3, k: string) => (
    <group key={k} position={p}>
      <mesh position={[0, 0.02, 0]} material={toon(c)} castShadow><cylinderGeometry args={[0.16, 0.18, 0.04, 20]} /></mesh>
      <mesh position={[0, 0.48, 0]} material={toon(c)} castShadow><cylinderGeometry args={[0.025, 0.03, 0.92, 10]} /></mesh>
      <mesh position={[0, 0.96, 0]} material={toon(c)} castShadow><sphereGeometry args={[0.05, 12, 10]} /></mesh>
    </group>
  );
  const n = 16;
  const balls = Array.from({length: n + 1}, (_, i) => {
    const t = i / n;
    const x = a[0] + (b[0] - a[0]) * t, z = a[2] + (b[2] - a[2]) * t;
    const y = a[1] + 0.9 - 0.22 * Math.sin(Math.PI * t);
    return <mesh key={i} position={[x, y, z]} material={toon(rope)} castShadow><sphereGeometry args={[0.03, 8, 6]} /></mesh>;
  });
  return <group>{post(a, 'a')}{post(b, 'b')}{balls}</group>;
};

/** A fish swimming a loop (built, low-poly, stylised): body + tail, wiggling. */
export const Fish: React.FC<{f: number; path: {c: P3; r: [number, number]; speed: number; phase: number}; c: string; scale?: number}> = ({f, path, c, scale = 0.25}) => {
  const a = path.phase + f * path.speed;
  const x = path.c[0] + Math.cos(a) * path.r[0], z = path.c[2] + Math.sin(a) * path.r[1];
  const y = path.c[1] + 0.15 * Math.sin(a * 2.3);
  const yaw = Math.atan2(-Math.sin(a) * path.r[0], Math.cos(a) * path.r[1]) * (path.speed > 0 ? 1 : -1);
  const wig = Math.sin(f * 0.6 + path.phase * 3) * 0.5;
  return (
    <group position={[x, y, z]} rotation={[0, yaw + Math.PI / 2, 0]} scale={scale}>
      <mesh material={toon(c)} castShadow scale={[1, 0.62, 0.32]}><sphereGeometry args={[0.5, 14, 10]} /></mesh>
      <group position={[-0.5, 0, 0]} rotation={[0, wig, 0]}>
        <mesh position={[-0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={toon(c)} scale={[1, 1, 0.25]}><coneGeometry args={[0.28, 0.4, 3]} /></mesh>
      </group>
      <mesh position={[0.3, 0.08, 0.15]} material={toon('#140b24')}><sphereGeometry args={[0.05, 8, 6]} /></mesh>
    </group>
  );
};

export const seeded = (n: number, seed: number) => Array.from({length: n}, (_, i) => ({i, a: rnd(seed + i * 3.1), b: rnd(seed + i * 7.3), c: rnd(seed + i * 11.7)}));

export const DoubleSide = THREE.DoubleSide;
