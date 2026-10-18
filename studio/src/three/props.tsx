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
      <mesh material={toon('#ffe9a8')} position={[0, 0.0775, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.055, 0.07, 32]} /></mesh>
      {teeth}
    </group>
  );
};

/** A shell throne: a scalloped fan as the backrest (ribs, pink), a padded seat on a rock, a pearl on top. */
export const ShellThrone: React.FC<{pos: P3; rotY?: number; scale?: number; c?: string; rib?: string; seat?: string}> = ({
  pos, rotY = 0, scale = 1, c = '#ff9cc8', rib = '#e0679f', seat = '#7a4fd0',
}) => {
  const shellGeo = React.useMemo(() => {
    const s = new THREE.Shape();
    const R = 1.0, n = 9;
    s.moveTo(0, 0);
    for (let i = 0; i <= 64; i++) {
      const a = Math.PI * 0.12 + (Math.PI * 0.76 * i) / 64;
      const bump = 1 + 0.07 * Math.abs(Math.sin((i / 64) * Math.PI * n));
      s.lineTo(Math.cos(a) * R * bump, Math.sin(a) * R * bump);
    }
    s.lineTo(0, 0);
    const g = new THREE.ExtrudeGeometry(s, {depth: 0.1, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3, curveSegments: 8});
    g.translate(0, 0, -0.05);
    return g;
  }, []);
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={scale}>
      <mesh geometry={shellGeo} material={toon(c)} position={[0, 0.35, -0.12]} rotation={[-0.12, 0, 0]} castShadow receiveShadow />
      {Array.from({length: 9}, (_, i) => {
        const a = Math.PI * 0.16 + (Math.PI * 0.68 * i) / 8;
        return (
          <mesh key={i} material={toon(rib)} position={[Math.cos(a) * 0.5, 0.35 + Math.sin(a) * 0.5, -0.0]} rotation={[-0.12, 0, a - Math.PI / 2]} castShadow>
            <boxGeometry args={[0.035, 0.95, 0.04]} />
          </mesh>
        );
      })}
      <mesh material={toon('#fff4fb', '#ffd9ef', 0.35)} position={[0, 1.42, -0.05]} castShadow><sphereGeometry args={[0.1, 20, 16]} /></mesh>
      <RBox size={[0.95, 0.16, 0.62]} pos={[0, 0.34, 0.12]} r={0.07} c={seat} />
      <mesh material={toon('#d4ab4f')} position={[0, 0.34, 0.44]}><boxGeometry args={[0.9, 0.03, 0.03]} /></mesh>
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

/** The wish chute: visitors drop coins into a brass slot on the hall side; a clear tube carries them down into her
 *  tank (she collects every one). Plate + funnel at `pos` (hall side of the glass rim), the tube ends at `out`. */
export const WishChute: React.FC<{pos: P3; out: P3; brass?: string}> = ({pos, out, brass = '#c9a14a'}) => {
  const a = new THREE.Vector3(pos[0], pos[1] - 0.15, pos[2] - 0.45), b = new THREE.Vector3(...out);
  const mid = a.clone().add(b).multiplyScalar(0.5), len = a.distanceTo(b);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return (
    <group>
      <group position={pos}>
        <RBox size={[0.7, 0.42, 0.05]} pos={[0, 0, 0.03]} r={0.03} c={brass} />
        <RBox size={[0.36, 0.05, 0.03]} pos={[0, 0.06, 0.07]} r={0.01} c="#2a1a08" />
        <mesh position={[0, -0.12, -0.2]} rotation={[Math.PI / 2, 0, 0]} material={toon(brass)} castShadow>
          <cylinderGeometry args={[0.22, 0.07, 0.4, 20, 1, true]} />
        </mesh>
        <mesh position={[0, -0.12, 0.07]} material={toon('#2a1a08')}><sphereGeometry args={[0.03, 10, 8]} /></mesh>
      </group>
      <mesh position={mid} quaternion={q} renderOrder={7}>
        <cylinderGeometry args={[0.08, 0.08, len, 16, 1, true]} />
        <meshBasicMaterial color="#cfefff" transparent opacity={0.16} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={b} material={toon(brass)} castShadow><torusGeometry args={[0.09, 0.025, 8, 20]} /></mesh>
    </group>
  );
};

/** A row of ceiling lamps over the visitor hall with the pool of light it throws on the floor; `on` 0..1, `bang` = the
 *  flash of a bank switching off (a big hall going dark bank by bank, like after a show). */
export const LightBank: React.FC<{z: number; y: number; floorY: number; on: number; bang?: number; width?: number}> = ({z, y, floorY, on, bang = 0, width = 12}) => {
  const lit = Math.min(1, on + bang * 0.8);
  return (
    <group>
      {Array.from({length: 6}, (_, i) => (
        <RBox key={i} size={[1.1, 0.12, 0.4]} pos={[-width / 2 + (i + 0.5) * (width / 6), y, z]} r={0.04} c="#2a2244"
          e="#fff1d6" ei={Math.round(22 * lit) / 10} cast={false} />
      ))}
      <mesh position={[0, floorY + 0.012, z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <planeGeometry args={[width, 2.6]} />
        <meshBasicMaterial color="#fff1d6" transparent opacity={0.16 * lit} depthWrite={false} toneMapped={false} />
      </mesh>
      {lit > 0.01 ? <pointLight position={[0, y - 0.4, z]} color="#ffe9c9" intensity={14 * lit} distance={9} decay={1.5} /> : null}
    </group>
  );
};

/** A sand mound she buried herself in (SandBury): a lumpy dune in front of her with a ring of loose grains; `h` = how
 *  high it reaches (below her eyes, so only the eyes peek out). Her sprite stands sunk below the opaque tank floor. */
export const SandMound: React.FC<{pos: P3; h: number; r?: number; c?: string; f: number; burst?: number}> = ({pos, h, r = 0.6, c = '#c9a9d6', f, burst = 0}) => {
  const geo = React.useMemo(() => {
    const g = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const n = 1 + 0.08 * Math.sin(x * 7 + z * 5) + 0.05 * Math.cos(z * 11);
      p.setXYZ(i, x * n, y * n, z * n);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const k = 1 - Math.min(1, burst);                       // burst 0..1 blows the mound away (sand cloud)
  return (
    <group position={pos}>
      {k > 0.02 ? <mesh geometry={geo} material={toon(c)} scale={[r * (1 + 0.6 * burst), h * k, r * 0.8 * (1 + 0.6 * burst)]} castShadow receiveShadow /> : null}
      {Array.from({length: 18}, (_, i) => {
        const a = (i / 18) * Math.PI * 2 + rnd(i) * 0.4, d = r * (1.05 + rnd(i + 3) * 0.3) * (1 + burst * 3);
        const y = 0.02 + burst * (0.4 + rnd(i + 7)) * Math.sin(Math.min(1, burst) * Math.PI);
        return <mesh key={i} position={[Math.cos(a) * d, y, Math.sin(a) * d * 0.8]} material={toon(c)}><sphereGeometry args={[0.025 + rnd(i + 9) * 0.03, 6, 5]} /></mesh>;
      })}
    </group>
  );
};
