// Raymi as a 3D VRM model (roadmap item 4, the slot after the PNG puppet): her own VRoid export, MToon kept, placed
// like Puppet3D (feet on the set floor, height in metres, turned to the lens or by degrees), key poses as bone
// rotations (vrmPoses.ts), expressions by name, eyes on the lens, deterministic blinks.
//
// Determinism for parallel render workers: nothing is carried between frames. Every frame re-simulates her spring
// bones (hair, rabbit ears, tail) from a fixed start: a settle at the state of max(from, f - WINDOW), then frame by
// frame up to f. Same f -> same picture on every worker, in any order.
//
// Her skin stays pale grey-blue under any set light (hard rule 9): `lock` (0..1) moves that share of her colour
// from the lit term into a self-lit term (emissive = her own texture), so a coloured set light can only tint the
// rest. lock 1 = unlit like the sprite was; default 0.6 keeps a readable toon shade.
import React, {useEffect, useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {VRMLoaderPlugin, VRMUtils, type VRM, type VRMHumanBoneName} from '@pixiv/three-vrm';
import {cancelRender, continueRender, delayRender} from 'remotion';
import {blobTexture} from './look';
import {ease} from '../film/motion';
import {EXPRESSION_ALIAS, POSES, exprOf, type VrmKey, type VrmPose} from './vrmPoses';
import type {V3} from '../film/types';

export const DEFAULT_HEIGHT = 1.55;       // ears to feet, like the sprite puppet (raymi/timeline.py DEFAULT_HEIGHT)
const WINDOW = 90;                         // frames of history simulated before f (springs forget faster than that)
const SETTLE = 30;                         // frames the start state is held so the springs hang at rest

type Rig = {
  vrm: VRM;
  root: THREE.Group;                       // placement in the set (pos, yaw, scale)
  ground: THREE.Group;                     // lifts / lowers her so her feet stay on the floor in any pose
  natural: number;                         // model height (m) in the rest pose
  floor: number;                           // model y of her soles in the rest pose
  restLow: number;                         // lowest foot bone y in the rest pose
  mirror: boolean;                         // VRM 0.x: normalized rotations mirrored (x, z negated)
  lock: number | null;
};

const rigs = new Map<string, Rig>();
const FEET: VRMHumanBoneName[] = ['leftFoot', 'rightFoot', 'leftToes', 'rightToes'];

async function loadRig(url: string, data?: ArrayBuffer): Promise<Rig> {
  const loader = new GLTFLoader();
  loader.register((p) => new VRMLoaderPlugin(p));
  const gltf = data ? await loader.parseAsync(data, '') : await loader.loadAsync(url);
  const vrm = gltf.userData.vrm as VRM | undefined;
  if (!vrm) throw new Error(`not a VRM: ${url}`);
  VRMUtils.removeUnnecessaryVertices(gltf.scene);
  VRMUtils.combineSkeletons(gltf.scene);
  VRMUtils.rotateVRM0(vrm);                // VRM 0.x faces -Z: turn her to +Z like every VRM 1.0
  vrm.scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) { m.frustumCulled = false; m.castShadow = true; m.receiveShadow = false; }
  });
  const root = new THREE.Group(), ground = new THREE.Group();
  root.add(ground); ground.add(vrm.scene);
  vrm.humanoid.resetNormalizedPose();
  vrm.update(0);
  root.updateMatrixWorld(true);
  vrm.scene.traverse((o) => { const s = o as THREE.SkinnedMesh; if (s.isSkinnedMesh) { s.skeleton.update(); s.computeBoundingBox(); } });
  const box = new THREE.Box3().setFromObject(vrm.scene);
  const rig: Rig = {vrm, root, ground, natural: box.max.y - box.min.y, floor: box.min.y, restLow: lowestFoot(vrm),
    mirror: vrm.meta?.metaVersion === '0', lock: null};
  vrm.springBoneManager?.setInitState();
  return rig;
}

function lowestFoot(vrm: VRM): number {
  const v = new THREE.Vector3();
  let low = Infinity;
  for (const b of FEET) {
    const n = vrm.humanoid.getRawBoneNode(b);
    if (n) low = Math.min(low, n.getWorldPosition(v).y);
  }
  return low;
}

/** Load a model into the cache by hand (tests: the bytes of the file, no browser). */
export async function preloadVrm(url: string, data?: ArrayBuffer): Promise<void> {
  if (!rigs.has(url)) rigs.set(url, await loadRig(url, data));
}

/** Preload VRM models before the canvas mounts (like useTexturesReady: a model that loads later misses its frame). */
export function useVrmReady(urls: string[]): boolean {
  const key = urls.join('|');
  const [ready, setReady] = useState(() => urls.every((u) => rigs.has(u)));
  useEffect(() => {
    const todo = urls.filter((u) => !rigs.has(u));
    if (!todo.length) { setReady(true); return; }
    // a 25 MB model + its textures under software GL: far longer than the 30 s default
    const handle = delayRender(`vrm ${todo.join(',')}`, {timeoutInMilliseconds: 110000});
    Promise.all(todo.map((u) => preloadVrm(u)))
      .then(() => { setReady(true); continueRender(handle); })
      .catch((e) => cancelRender(e));
  }, [key]);   // eslint-disable-line react-hooks/exhaustive-deps
  return ready;
}

function lockColours(rig: Rig, lock: number) {
  if (rig.lock === lock) return;
  const from = rig.lock ?? 0;
  for (const mat of rig.vrm.materials ?? []) {
    const m = mat as THREE.Material & {isMToonMaterial?: boolean; color?: THREE.Color; shadeColorFactor?: THREE.Color;
      emissive?: THREE.Color; emissiveMap?: THREE.Texture | null; map?: THREE.Texture | null};
    if (!m.isMToonMaterial || !m.color || !m.emissive) continue;
    const k = (1 - lock) / Math.max(1e-3, 1 - from);     // undo the previous lock, apply the new one
    m.color.multiplyScalar(k);
    m.shadeColorFactor?.multiplyScalar(k);
    m.emissiveMap = m.map ?? null;
    m.emissive.setScalar(lock);
    m.needsUpdate = true;
  }
  rig.lock = lock;
}

// ------------------------------------------------------------------ the state at a frame (pure, from the keys)
type State = {a: VrmPose; b: VrmPose; t: number; pos: V3; yaw: number; height: number; f: number};

function keyAt(keys: VrmKey[], f: number): number {
  let i = 0;
  for (let k = 0; k < keys.length; k++) if (keys[k].f <= f) i = k;
  return i;
}

function stateAt(keys: VrmKey[], f: number, camPos: V3): State {
  const i = keyAt(keys, f), k = keys[i], p = keys[Math.max(0, i - 1)];
  const blend = k.blend ?? 8;
  const t = i === 0 || blend <= 0 ? 1 : ease('inOut', (f - k.f) / blend);
  const lerp = (x: number, y: number) => x + (y - x) * t;
  const pos: V3 = [lerp(p.pos[0], k.pos[0]), lerp(p.pos[1], k.pos[1]), lerp(p.pos[2], k.pos[2])];
  const yawOf = (q: VrmKey) => (q.rotY === 'lens' || q.rotY === undefined
    ? Math.atan2(camPos[0] - pos[0], camPos[2] - pos[2]) : (q.rotY * Math.PI) / 180);
  const pose = (name: string) => {
    const x = POSES[name];
    if (!x) cancelRender(new Error(`unknown VRM pose ${name} (studio/src/three/vrmPoses.ts)`));
    return x;
  };
  return {a: pose(p.pose), b: pose(k.pose), t, pos, yaw: lerp(yawOf(p), yawOf(k)),
    height: lerp(p.height ?? DEFAULT_HEIGHT, k.height ?? DEFAULT_HEIGHT), f};
}

const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), eu = new THREE.Euler();
function boneQ(out: THREE.Quaternion, r: [number, number, number] | undefined, mirror: boolean) {
  if (!r) return out.identity();
  return out.setFromEuler(eu.set(mirror ? -r[0] : r[0], r[1], mirror ? -r[2] : r[2], 'XYZ'));
}

/** Pose + breathing + placement for one simulation step. */
function applyState(rig: Rig, s: State, fps: number) {
  const {vrm, root, ground, mirror} = rig;
  vrm.humanoid.resetNormalizedPose();
  const names = new Set([...Object.keys(s.a), ...Object.keys(s.b)]);
  for (const n of names) {
    const node = vrm.humanoid.getNormalizedBoneNode(n as VRMHumanBoneName);
    if (!node) continue;
    boneQ(qa, s.a[n], mirror); boneQ(qb, s.b[n], mirror);
    node.quaternion.copy(qa).slerp(qb, s.t);
  }
  // alive in every hold: breathing in the chest, a slow sway of weight and head (deterministic sines)
  const t = s.f / fps;
  const add = (n: VRMHumanBoneName, r: [number, number, number]) => {
    const node = vrm.humanoid.getNormalizedBoneNode(n);
    if (node) node.quaternion.multiply(boneQ(qa, r, mirror));
  };
  add('chest', [0.03 * Math.sin(t * Math.PI * 0.84), 0, 0]);
  add('spine', [0, 0, 0.015 * Math.sin(t * Math.PI * 0.42)]);
  add('head', [0.012 * Math.sin(t * 1.3 + 1), 0.02 * Math.sin(t * 0.9), 0]);
  vrm.humanoid.update();
  // feet on the floor: measure the posed rig unplaced, then place it
  root.position.set(0, 0, 0); root.rotation.set(0, 0, 0); root.scale.setScalar(1); ground.position.set(0, 0, 0);
  root.updateMatrixWorld(true);
  ground.position.y = rig.restLow - lowestFoot(vrm) - rig.floor;
  root.position.set(...s.pos);
  root.rotation.y = s.yaw;
  root.scale.setScalar(s.height / rig.natural);
  root.updateMatrixWorld(true);
}

function setExpressions(rig: Rig, k: VrmKey, f: number, fps: number) {
  const em = rig.vrm.expressionManager;
  if (!em) return;
  for (const e of em.expressions) em.setValue(e.expressionName, 0);
  const want = exprOf(k);
  for (const [name, v] of Object.entries(want)) {
    const n = EXPRESSION_ALIAS[name.toLowerCase()] ?? name;
    if (!em.getExpression(n)) cancelRender(new Error(`VRM has no expression ${name} (${n})`));
    em.setValue(n, v);
  }
  // blinks: every ~3.4 s on fixed frames (no randomness between workers), 5 frames; never during a held blink / joy
  if (!('blink' in want) && !('joy' in want) && !('happy' in want)) {
    const period = Math.round(3.4 * fps), ph = f % period;
    if (ph < 5) em.setValue('blink', Math.sin((ph / 5) * Math.PI));
  }
}

const camV = new THREE.Vector3();
/** Run the deterministic simulation and leave the rig posed for frame f. */
export function poseVrm(url: string, keys: VrmKey[], f: number, fps: number, from: number, camPos: V3, lock: number): Rig {
  const rig = rigs.get(url);
  if (!rig) { cancelRender(new Error(`VRM not preloaded: ${url}`)); throw new Error('unreachable'); }
  lockColours(rig, lock);
  const {vrm} = rig;
  const start = Math.max(from, f - WINDOW);
  const dt = 1 / fps;
  const s0 = stateAt(keys, start, camPos);
  applyState(rig, s0, fps);
  vrm.springBoneManager?.reset();
  for (let i = 0; i < SETTLE; i++) { vrm.springBoneManager?.update(dt); }
  for (let g = start; g <= f; g++) {
    applyState(rig, g === start ? s0 : stateAt(keys, g, camPos), fps);
    vrm.springBoneManager?.update(dt);
  }
  const k = keys[keyAt(keys, f)];
  setExpressions(rig, k, f, fps);
  vrm.expressionManager?.update();
  if (vrm.lookAt && (k.look ?? 'lens') === 'lens') {
    vrm.lookAt.autoUpdate = true;
    vrm.lookAt.lookAt(camV.set(...camPos));
    vrm.lookAt.update(dt);
    vrm.humanoid.update();                 // the eyes are humanoid bones: normalized -> raw
  }
  rig.root.updateMatrixWorld(true);
  return rig;
}

/** World points of her body at the current pose (for guards: face / figure / hero boxes from bones, not sprites). */
export function vrmAnatomy(url: string): Record<string, THREE.Vector3> {
  const rig = rigs.get(url);
  const out: Record<string, THREE.Vector3> = {};
  if (!rig) return out;
  for (const b of ['head', 'neck', 'hips', 'leftHand', 'rightHand', 'leftFoot', 'rightFoot'] as VRMHumanBoneName[]) {
    const n = rig.vrm.humanoid.getRawBoneNode(b);
    if (n) out[b] = n.getWorldPosition(new THREE.Vector3());
  }
  return out;
}

export const VrmPuppet: React.FC<{url: string; keys: VrmKey[]; f: number; fps: number; from?: number; camPos: V3;
  lock?: number; shadow?: string; glow?: string; glowGain?: number}> = ({url, keys, f, fps, from = 0, camPos, lock = 0.6,
  shadow = '#1d0b38', glow, glowGain = 1}) => {
  if (!keys.length || f < keys[0].f) return null;
  const rig = poseVrm(url, keys, f, fps, Math.max(from, keys[0].f), camPos, lock);
  const p = rig.root.position;
  const w = (rig.root.scale.x * rig.natural) * 0.42;
  const chest = rig.vrm.humanoid.getRawBoneNode('chest')?.getWorldPosition(new THREE.Vector3());
  const pulse = (0.85 + 0.15 * Math.sin(f / 9)) * glowGain;
  return (
    <group>
      <mesh position={[p.x, p.y + 0.035, p.z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <planeGeometry args={[w * 1.3, w * 0.7]} />
        <meshBasicMaterial map={blobTexture(shadow)} transparent depthWrite={false} opacity={0.8} toneMapped={false} />
      </mesh>
      <primitive object={rig.root} />
      {glow && chest && glowGain > 0.01 ? (    // 灯闇: she is the lamp in the dark (like Puppet3D)
        <pointLight position={[chest.x, chest.y, chest.z + 0.25]} color={glow} intensity={7 * pulse} distance={5} decay={1.4} />
      ) : null}
    </group>
  );
};
