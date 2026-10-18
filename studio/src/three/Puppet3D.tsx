// Raymi IN the space (PRINCIPLES 8): her painted sprite stands on the set's floor, faces the lens, casts a real
// shadow shaped like her plus a soft contact shadow, and moves like a puppet (breathing, squash & stretch, smears on
// fast moves, held key poses). She is UNLIT: her painting keeps its colours and her skin stays pale grey-blue under
// any set light (hard rule 9).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {staticFile} from 'remotion';
import {blobTexture, useImageTexture} from './look';
import {planeSize, puppetAt} from '../film/motion';
import {puppetMatrix} from '../film/check';
import type {PuppetKey, V3} from '../film/types';

const SpritePlane: React.FC<{k: PuppetKey; matrix: THREE.Matrix4; opacity?: number; cast?: boolean}> = ({k, matrix, opacity = 1, cast = true}) => {
  const tex = useImageTexture(staticFile(k.sprite));
  const {w, h} = planeSize(k);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(w, h);
    g.translate(0, h / 2 - (1 - k.feet) * h, 0);           // origin on her feet line
    return g;
  }, [w, h, k.feet]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({map: tex, transparent: true, alphaTest: 0.04, side: THREE.DoubleSide,
    toneMapped: false, depthWrite: opacity >= 1}), [tex, opacity >= 1]);
  mat.opacity = opacity;
  const depth = useMemo(() => new THREE.MeshDepthMaterial({depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5,
    side: THREE.DoubleSide}), [tex]);
  return (
    <mesh geometry={geo} material={mat} matrixAutoUpdate={false} matrix={matrix} castShadow={cast} customDepthMaterial={depth}
      renderOrder={opacity < 1 ? 5 : 4} />
  );
};

export const Puppet3D: React.FC<{keys: PuppetKey[]; f: number; fps: number; camPos: V3; shadow?: string; glow?: string}> = ({keys, f, fps, camPos, shadow = '#1d0b38', glow}) => {
  const p = puppetAt(keys, f, fps);
  if (!p) return null;
  const m = puppetMatrix(p, camPos);
  const {w} = planeSize(p.key);
  const ghosts = [] as React.ReactNode[];
  if (p.smear > 0.35) {                                      // smear frames: where she was 1 and 2 frames ago
    for (const [d, o] of [[1, 0.16]] as const) {   // one faint streak - strong copies read as a glitch (blind viewer, style test 1)
      const q = puppetAt(keys, f - d, fps);
      if (q && q.key.sprite === p.key.sprite) ghosts.push(<SpritePlane key={d} k={q.key} matrix={puppetMatrix(q, camPos)} opacity={o * p.smear} cast={false} />);
    }
  }
  const lift = p.lift + p.pos[1];
  const s = 1 / (1 + Math.max(0, p.lift) * 2.5);
  return (
    <group>
      <mesh position={[p.pos[0], p.pos[1] + 0.035, p.pos[2]]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <planeGeometry args={[w * 0.62 * s, w * 0.24 * s]} />
        <meshBasicMaterial map={blobTexture(shadow)} transparent depthWrite={false} opacity={Math.max(0, 0.85 - lift * 1.6)} toneMapped={false} />
      </mesh>
      {ghosts}
      <SpritePlane k={p.key} matrix={m} />
      {glow ? (() => {                                       // 灯闇: she is the lamp in the dark (her glowing dots)
        const {h} = planeSize(p.key);
        const c = new THREE.Vector3(0, h * (p.key.feet - p.key.top) * 0.55, -0.06).applyMatrix4(m);
        const pulse = 0.85 + 0.15 * Math.sin(f / 9);
        return (
          <group>
            <pointLight position={[c.x, c.y, c.z]} color={glow} intensity={7 * pulse} distance={5} decay={1.4} />
            <mesh position={[c.x, c.y, c.z]} quaternion={new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().extractRotation(m))} renderOrder={3}>
              <planeGeometry args={[w * 2.4, h * 1.3]} />
              <meshBasicMaterial map={blobTexture(glow)} transparent opacity={0.55 * pulse} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
            </mesh>
          </group>
        );
      })() : null}
    </group>
  );
};
