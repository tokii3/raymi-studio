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

/** A rim of her own light round her silhouette (she reads against a dark set - FIRESTARTER pilots): her sprite, a bit
 *  bigger, tinted and additive, just BEHIND her - her painting covers it, only the edge glows. */
const RimPlane: React.FC<{k: PuppetKey; matrix: THREE.Matrix4; color: string}> = ({k, matrix, color}) => {
  const tex = useImageTexture(staticFile(k.sprite));
  const {w, h} = planeSize(k);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(w * 1.035, h * 1.02);
    g.translate(0, h / 2 - (1 - k.feet) * h, -0.015);
    return g;
  }, [w, h, k.feet]);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({map: tex, color, transparent: true, alphaTest: 0.2, side: THREE.DoubleSide,
    toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.75}), [tex, color]);
  return <mesh geometry={geo} material={mat} matrixAutoUpdate={false} matrix={matrix} renderOrder={3} />;
};

export const Puppet3D: React.FC<{keys: PuppetKey[]; f: number; fps: number; camPos: V3; shadow?: string; glow?: string; glowGain?: number}> = ({keys, f, fps, camPos, shadow = '#1d0b38', glow, glowGain = 1}) => {
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
      {glow ? <RimPlane k={p.key} matrix={m} color={glow} /> : null}
      {glow && glowGain > 0.01 ? (() => {                                       // 灯闇: she is the lamp in the dark (her glowing dots)
        const {h} = planeSize(p.key);
        const c = new THREE.Vector3(0, h * (p.key.feet - p.key.top) * 0.55, -0.06).applyMatrix4(m);
        const pulse = (0.85 + 0.15 * Math.sin(f / 9)) * glowGain;   // glow_pulse (beats) / glow_out from the film
        return (
          <group>
            <pointLight position={[c.x, c.y, c.z]} color={glow} intensity={12 * pulse} distance={7} decay={1.4} />
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

/** Her tail whip (FIRESTARTER: the barb is the match): a smear arc of light along the barb's path - the leading edge
 *  sweeps `sweep` degrees round the pivot (her hip) to the barb tip in 4 frames, then the arc fades in 6. Drawn in her
 *  sprite plane (it faces the lens like she does). d = frames since the whip. */
export const WhipSmear: React.FC<{pivot: THREE.Vector3; tip: THREE.Vector3; camPos: V3; d: number; sweep?: number; c?: string; dir?: number}> = ({
  pivot, tip, camPos, d, sweep = 140, c = '#c98bff', dir = 1,
}) => {
  if (d < 0 || d > 10) return null;
  const yaw = Math.atan2(camPos[0] - pivot.x, camPos[2] - pivot.z);
  const inv = new THREE.Matrix4().makeRotationY(-yaw);
  const local = tip.clone().sub(pivot).applyMatrix4(inv);             // tip in the plane facing the lens (x right, y up)
  const R = Math.max(0.05, Math.hypot(local.x, local.y)), end = Math.atan2(local.y, local.x);
  const lead = Math.min(1, d / 4), fade = d <= 4 ? 1 : 1 - (d - 4) / 6;
  const len = (sweep * Math.PI) / 180 * lead;
  const start = dir > 0 ? end - len : end;
  return (
    <group position={pivot} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0, 0.04]} renderOrder={8}>
        <ringGeometry args={[R * 0.82, R * 1.08, 40, 1, start, Math.max(0.01, len)]} />
        <meshBasicMaterial map={blobTexture(c)} transparent opacity={0.75 * fade} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.045]} renderOrder={9}>
        <ringGeometry args={[R * 0.93, R * 0.99, 40, 1, start + len * 0.5, Math.max(0.01, len * 0.5)]} />
        <meshBasicMaterial color="#fff0ff" transparent opacity={0.8 * fade} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};
