// The lighthouse on its rock + a storm's lightning (Love is War idea A, 2026-10-25; reusable in any sea set).
// The beam is the main element of that idea ("the light that never stops on her"): one bright line in the dark that
// sweeps the sea. Built, never generated (hard rule 8).
// opts.lighthouse = {pos: [x, z], height (m, default 9), yaw (deg, 0 = toward +z / the usual lens side), spin (deg/s,
//   default 24; 0 = a held beam), beam 0..1 (default 1), len (m, default 70)}
// opts.lightning = [frame, ...] (song seconds in shots.json, TIME_OPTS) + opts.lightning_pos [[x, z], ...]: a bolt
//   into the sea + the whole sky flashing for ~6 frames
import React from 'react';
import * as THREE from 'three';
import {canvasTexture, rnd, toon} from './look';
import {add, glowTex} from './fire';
import {frames} from './events';

type P3 = [number, number, number];
export type LighthouseOpts = {pos?: [number, number]; height?: number; yaw?: number; spin?: number; beam?: number; len?: number};

/** Along the cone's height: bright at the lamp (v = 1), gone at the far end. */
function beamTex(): THREE.CanvasTexture {
  return canvasTexture('lh_beam', 8, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, h, 0, 0);
    g.addColorStop(0, 'rgba(255,240,205,0)'); g.addColorStop(0.55, 'rgba(255,240,205,0.25)'); g.addColorStop(1, 'rgba(255,246,225,1)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
}

/** The beam's yaw (radians) at frame f. */
export function beamYaw(o: LighthouseOpts, f: number, fps: number): number {
  return THREE.MathUtils.degToRad((o.yaw ?? 0) + (o.spin ?? 24) * (f / fps));
}

const Beam: React.FC<{from: THREE.Vector3; yaw: number; len: number; v: number}> = ({from, yaw, len, v}) => {
  const dir = new THREE.Vector3(Math.sin(yaw), -0.035, Math.cos(yaw)).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);   // the cone's top (the lamp) at `from`
  const mid = from.clone().addScaledVector(dir, len / 2);
  return (
    <group>
      <mesh position={mid} quaternion={q} renderOrder={9}>
        <cylinderGeometry args={[0.32, len * 0.085, len, 40, 1, true]} />
        <meshBasicMaterial map={beamTex()} {...add} opacity={0.42 * v} fog={false} />
      </mesh>
      <mesh position={mid} quaternion={q} renderOrder={9}>
        <cylinderGeometry args={[0.12, len * 0.03, len, 24, 1, true]} />
        <meshBasicMaterial map={beamTex()} {...add} opacity={0.5 * v} fog={false} />
      </mesh>
    </group>
  );
};

export const Lighthouse: React.FC<{o: LighthouseOpts; f: number; fps: number; camPos: P3}> = ({o, f, fps, camPos}) => {
  const [x, z] = o.pos ?? [-14, -46];
  const H = o.height ?? 9;
  const v = o.beam ?? 1;
  const len = o.len ?? 70;
  const lamp = new THREE.Vector3(x, H + 0.6, z);
  const yaw = beamYaw(o, f, fps);
  // the lamp blazes when a beam points at the lens (the moment the light finally looks at you)
  const toCam = new THREE.Vector3(...camPos).sub(lamp).setY(0).normalize();
  const face = Math.max(...[yaw, yaw + Math.PI].map((a) => new THREE.Vector3(Math.sin(a), 0, Math.cos(a)).dot(toCam)));
  const blaze = Math.pow(Math.max(0, face), 18);
  const white = toon('#e6e3ee'), red = toon('#b3263a'), dark = toon('#1b1a2a'), rock = toon('#121327');
  return (
    <group>
      {/* the black rock it stands on, waves breaking white at its foot */}
      {Array.from({length: 7}, (_, i) => (
        <mesh key={`r${i}`} position={[x + (rnd(i * 3) - 0.5) * 6, -0.8 + rnd(i * 5) * 1.4, z + (rnd(i * 7) - 0.5) * 5]}
          rotation={[rnd(i) * 3, rnd(i * 2) * 3, 0]} scale={1.6 + rnd(i * 9) * 2.4} material={rock}>
          <dodecahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
      {Array.from({length: 10}, (_, i) => {
        const a = (i / 10) * Math.PI * 2, s = 0.6 + 0.4 * Math.sin(f / 9 + i * 1.7);
        return <mesh key={`w${i}`} position={[x + Math.cos(a) * 4.2, 0.15, z + Math.sin(a) * 3.6]} scale={[1.8 * s, 0.35 * s, 1.2]} renderOrder={6}>
          <sphereGeometry args={[1, 10, 6]} /><meshBasicMaterial color="#cfd6ff" transparent opacity={0.35 * s} depthWrite={false} />
        </mesh>;
      })}
      {/* the tower: white with two red bands, the gallery, the lantern room, the dome */}
      <mesh position={[x, H / 2 + 0.3, z]} material={white}><cylinderGeometry args={[0.85, 1.3, H, 24]} /></mesh>
      {[0.3, 0.62].map((k) => (
        <mesh key={k} position={[x, 0.3 + H * k, z]} material={red}><cylinderGeometry args={[1.3 - 0.45 * k + 0.02, 1.3 - 0.45 * k + 0.06, H * 0.12, 24]} /></mesh>
      ))}
      {[0.2, 0.45, 0.75].map((k, i) => (
        <mesh key={`win${i}`} position={[x + Math.sin(i * 2.1) * (1.25 - 0.45 * k), 0.3 + H * k, z + Math.cos(i * 2.1) * (1.25 - 0.45 * k)]} scale={[0.18, 0.3, 0.18]}>
          <boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color="#ffd89a" toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[x, H + 0.32, z]} material={dark}><cylinderGeometry args={[1.35, 1.35, 0.16, 24]} /></mesh>
      <mesh position={[x, H + 0.95, z]}><cylinderGeometry args={[0.7, 0.7, 1.1, 20]} />
        <meshBasicMaterial color="#fff1cf" toneMapped={false} /></mesh>
      <mesh position={[x, H + 1.5, z]} material={red}><sphereGeometry args={[0.78, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
      <mesh position={lamp} scale={3 + 22 * blaze} renderOrder={10}><planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={glowTex('#fff3d6')} {...add} opacity={0.85 * v} fog={false} /></mesh>
      <pointLight position={lamp} color="#ffe7bd" intensity={14 * v} distance={30} decay={1.4} />
      {v > 0 ? <><Beam from={lamp} yaw={yaw} len={len} v={v} /><Beam from={lamp} yaw={yaw + Math.PI} len={len} v={v * 0.7} /></> : null}
    </group>
  );
};

/** A bolt into the sea: a jagged line from the clouds down, white-violet, ~6 frames; the sky flashes with it. */
export const Lightning: React.FC<{at: unknown; pos?: [number, number][]; f: number}> = ({at, pos, f}) => (
  <>
    {frames(at).map((t, k) => {
      const d = f - t;
      if (d < 0 || d > 6) return null;
      const e = (d === 2 ? 0.35 : 1) * (1 - d / 7);   // the second flicker of a real bolt
      const [bx, bz] = pos?.[k % pos.length] ?? [(rnd(k * 3) - 0.5) * 50, -40 - rnd(k * 5) * 30];
      const pts: THREE.Vector3[] = [];
      let px = bx, pz = bz;
      for (let i = 0; i <= 14; i++) {
        pts.push(new THREE.Vector3(px, 42 * (1 - i / 14), pz));
        px += (rnd(k * 31 + i) - 0.5) * 4.5; pz += (rnd(k * 17 + i) - 0.5) * 2;
      }
      return (
        <group key={k}>
          {pts.slice(1).map((p, i) => {
            const a = pts[i], m = a.clone().add(p).multiplyScalar(0.5), L = a.distanceTo(p);
            const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.clone().sub(a).normalize());
            return <group key={i}>
              <mesh position={m} quaternion={q} scale={[0.22, L, 0.22]} renderOrder={12}><boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="#f4ecff" {...add} opacity={e} fog={false} /></mesh>
              <mesh position={m} quaternion={q} scale={[1.6, L, 1.6]} renderOrder={12}><boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="#9a6bff" {...add} opacity={0.25 * e} fog={false} /></mesh>
            </group>;
          })}
          <mesh scale={150} renderOrder={-6}><sphereGeometry args={[1, 24, 16]} />
            <meshBasicMaterial color="#b9b4ff" {...add} side={THREE.BackSide} opacity={0.32 * e} fog={false} /></mesh>
          <hemisphereLight args={['#d9d4ff', '#1a1640', 3.2 * e]} />
        </group>
      );
    })}
  </>
);
