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
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import {VRMLoaderPlugin, VRMUtils, type VRM, type VRMHumanBoneName} from '@pixiv/three-vrm';
import {retargetAnimation} from 'vrm-mixamo-retarget';
import {cancelRender, continueRender, delayRender} from 'remotion';
import {blobTexture} from './look';
import {ease} from '../film/motion';
import {EXPRESSION_ALIAS, POSES, exprOf, type VrmKey, type VrmPose} from './vrmPoses';
import {vrmMouthAt, type VrmMouthKey} from './vrmLipSync';
import type {V3} from '../film/types';
import {wornProps} from './wearables';

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
  materialStyle: string | null;
  materialBases: Map<THREE.Material, {color?: THREE.Color; shade?: THREE.Color; emissive?: THREE.Color; emissiveMap?: THREE.Texture | null}>;
  motions: Map<string, THREE.AnimationClip>;
  mixer: THREE.AnimationMixer;
  actions: Map<string, THREE.AnimationAction>;
  morphs: {mesh: THREE.Mesh; dict: Record<string, number>}[];   // her raw face shape keys (Fcl_MTH_Close, Fcl_BRW_Joy ...)
  outline: {width: number; color: string; meshes: THREE.Mesh[]} | null;
};

const rigs = new Map<string, Rig>();
export const _rig = (url: string): Rig | undefined => rigs.get(url);   // tests / diagnosis only
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
  const materialBases = new Map<THREE.Material, {color?: THREE.Color; shade?: THREE.Color; emissive?: THREE.Color; emissiveMap?: THREE.Texture | null}>();
  for (const material of vrm.materials ?? []) {
    const m = material as THREE.Material & {color?: THREE.Color; shadeColorFactor?: THREE.Color; emissive?: THREE.Color; emissiveMap?: THREE.Texture | null};
    materialBases.set(material, {color: m.color?.clone(), shade: m.shadeColorFactor?.clone(), emissive: m.emissive?.clone(), emissiveMap: m.emissiveMap});
  }
  const rig: Rig = {vrm, root, ground, natural: box.max.y - box.min.y, floor: box.min.y, restLow: lowestFoot(vrm),
    mirror: vrm.meta?.metaVersion === '0', lock: null, materialStyle: null, materialBases,
    motions: new Map(), mixer: new THREE.AnimationMixer(vrm.scene), actions: new Map(), morphs: faceMorphs(vrm), outline: null};
  vrm.springBoneManager?.setInitState();
  return rig;
}

function faceMorphs(vrm: VRM): Rig['morphs'] {
  const out: Rig['morphs'] = [];
  vrm.scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && m.morphTargetDictionary && 'Fcl_MTH_Close' in m.morphTargetDictionary) out.push({mesh: m, dict: m.morphTargetDictionary});
  });
  return out;
}

/** Write raw shape keys AFTER the expression manager (it owns the preset ones; these it never touches). */
function setMorph(rig: Rig, name: string, v: number) {
  for (const {mesh, dict} of rig.morphs) {
    const i = dict[name];
    if (i !== undefined && mesh.morphTargetInfluences) mesh.morphTargetInfluences[i] = Math.max(0, Math.min(1, v));
  }
}

// 2D look (toki 2026-10-22: "mehr wie ein 2D-Video"): an ink line around her like a cel drawing - an inverted hull,
// a back-face copy of each skinned mesh pushed out along its normals, sharing her skeleton and shape keys.
function ensureOutline(rig: Rig, width: number, color: string) {
  if ((rig.outline?.width ?? 0) === width && (!rig.outline || rig.outline.color === color)) return;
  for (const m of rig.outline?.meshes ?? []) m.parent?.remove(m);
  const meshes: THREE.Mesh[] = [];
  if (width > 0) {
    const mat = new THREE.MeshBasicMaterial({color, side: THREE.BackSide, toneMapped: false});
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.outlineW = {value: width};
      sh.vertexShader = 'uniform float outlineW;\n' + sh.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\ntransformed += normalize(objectNormal) * outlineW;');
    };
    mat.customProgramCacheKey = () => `raymi-outline-${width}`;
    const src: THREE.SkinnedMesh[] = [];
    rig.vrm.scene.traverse((o) => { const s = o as THREE.SkinnedMesh; if (s.isSkinnedMesh && !s.userData.outline) src.push(s); });
    for (const s of src) {
      // her face mesh also holds eyes, lashes and brows (thin planes): a hull would draw black rims around them
      if (/face/i.test(s.name) || /face/i.test(s.parent?.name ?? '')) continue;
      const o = new THREE.SkinnedMesh(s.geometry, mat);
      o.bind(s.skeleton, s.bindMatrix);
      o.userData.outline = s;
      o.frustumCulled = false;
      o.castShadow = false;
      s.parent?.add(o);
      o.position.copy(s.position); o.quaternion.copy(s.quaternion); o.scale.copy(s.scale);
      meshes.push(o);
    }
  }
  rig.outline = {width, color, meshes};
}

function syncOutline(rig: Rig) {
  for (const o of rig.outline?.meshes ?? []) {
    const s = o.userData.outline as THREE.SkinnedMesh;
    if (s.morphTargetInfluences && o.morphTargetInfluences) o.morphTargetInfluences.splice(0, s.morphTargetInfluences.length, ...s.morphTargetInfluences);
  }
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

/** Mixamo clips that walk / run / dance across the floor would carry her out of the shot and jump back at the loop:
 *  the hips keep their height (bounce, crouch) but not their travel - the shot's keys and camera decide where she goes. */
export function inPlace(clip: THREE.AnimationClip): THREE.AnimationClip {
  for (const t of clip.tracks) {
    if (!t.name.endsWith('.position') || !/hips/i.test(t.name)) continue;
    const v = t.values, x0 = v[0], z0 = v[2];
    for (let i = 0; i < v.length; i += 3) { v[i] = x0; v[i + 2] = z0; }
  }
  return clip;
}

/** Load a model into the cache by hand (tests: the bytes of the file, no browser). */
export async function preloadVrm(url: string, data?: ArrayBuffer): Promise<void> {
  if (!rigs.has(url)) rigs.set(url, await loadRig(url, data));
}

/** Load a Mixamo clip into every cached rig from its bytes (tests: no browser, no fetch). */
export function preloadMotionData(id: string, data: ArrayBuffer): void {
  const fbx = new FBXLoader().parse(data, '');
  for (const rig of rigs.values()) {
    const clip = retargetAnimation(fbx, rig.vrm, {logWarnings: false});
    if (!clip) throw new Error(`Mixamo animation could not be retargeted: ${id}`);
    rig.motions.set(id, inPlace(clip));
  }
}

async function preloadMotion(url: string): Promise<void> {
  const id = decodeURIComponent(new URL(url, 'https://raymi.invalid').pathname.split('/').pop() ?? url).replace(/\.[^.]+$/, '');
  if ([...rigs.values()].every((rig) => rig.motions.has(id))) return;
  const loader = new FBXLoader();
  const fbx = await loader.loadAsync(url);
  for (const rig of rigs.values()) {
    if (rig.motions.has(id)) continue;
    const clip = retargetAnimation(fbx, rig.vrm, {logWarnings: false});
    if (!clip) throw new Error(`Mixamo animation could not be retargeted: ${url}`);
    rig.motions.set(id, inPlace(clip));
  }
}

/** Preload VRM models before the canvas mounts (like useTexturesReady: a model that loads later misses its frame). */
export function useVrmReady(urls: string[], motionUrls: string[] = []): boolean {
  const key = [...urls, ...motionUrls].join('|');
  const [ready, setReady] = useState(() => urls.every((u) => rigs.has(u)));
  useEffect(() => {
    const todo = urls.filter((u) => !rigs.has(u));
    // which clips a rig still lacks - asked AFTER the models load: asked before (no rig yet) `some` over no rigs was
    // false, no clip was ever loaded and every film froze her in the poses (found 2026-10-23, toki "steif")
    const missing = () => motionUrls.filter((u) => {
      const id = decodeURIComponent(new URL(u, 'https://raymi.invalid').pathname.split('/').pop() ?? u).replace(/\.[^.]+$/, '');
      return [...rigs.values()].some((rig) => !rig.motions.has(id));
    });
    if (!todo.length && !missing().length) { setReady(true); return; }
    // a 25 MB model + its textures under software GL: far longer than the 30 s default
    const handle = delayRender(`vrm ${todo.join(',')}`, {timeoutInMilliseconds: 240000});   // + every clip of the film
    Promise.all(todo.map((u) => preloadVrm(u)))
      .then(() => Promise.all(missing().map((u) => preloadMotion(u))))
      .then(() => { setReady(true); continueRender(handle); })
      .catch((e) => cancelRender(e));
  }, [key]);   // eslint-disable-line react-hooks/exhaustive-deps
  return ready;
}

function styleMaterials(rig: Rig, style: string) {
  if (rig.materialStyle === style) return;
  for (const mat of rig.vrm.materials ?? []) {
    const m = mat as THREE.Material & {isMToonMaterial?: boolean; color?: THREE.Color; shadeColorFactor?: THREE.Color;
      emissive?: THREE.Color; emissiveMap?: THREE.Texture | null; name?: string; map?: THREE.Texture | null};
    const base = rig.materialBases.get(mat);
    if (base?.color && m.color) m.color.copy(base.color);
    if (base?.shade && m.shadeColorFactor) m.shadeColorFactor.copy(base.shade);
    if (base?.emissive && m.emissive) m.emissive.copy(base.emissive);
    if (base && m.emissiveMap !== undefined) m.emissiveMap = base.emissiveMap ?? null;
    if (!m.isMToonMaterial || !m.color) continue;
    if (style === 'routine') {
      // look-critic 2026-10-23 (twice): skin, face and the white skirt clipped to paper white under the set lights +
      // bloom. Lowering the lights did not hold (anti-loop) - so her own colours carry the headroom: skin pale grey-blue
      // at ~80 % value, fabric and hair a step down, the lit side can never reach white.
      const name = m.name ?? '';
      if (name.includes('SKIN')) { m.color.multiply(new THREE.Color('#b3bedc')); m.shadeColorFactor?.multiply(new THREE.Color('#8f9cc4')); }
      else if (name.includes('CLOTH')) m.color.multiply(new THREE.Color('#aeb0c8'));
      else if (name.includes('HAIR')) m.color.multiply(new THREE.Color('#c4c8e6'));
      else if (name.includes('FACE') || name.includes('Face')) m.color.multiply(new THREE.Color('#c0c8e2'));
      continue;
    }
    if (style !== 'firestarter') continue;
    const name = m.name ?? '';
    // A cool, slightly darker finish keeps the original textures but gives hair, skin and pale fabric
    // enough separation under the violet fire lights.
    if (name.includes('HAIR')) m.color.multiply(new THREE.Color('#c2c8f3'));
    else if (name.includes('SKIN')) m.color.multiply(new THREE.Color('#e0edf5'));
    else if (name.includes('CLOTH')) m.color.multiply(new THREE.Color('#c4c5dd'));
  }
  rig.materialStyle = style;
  rig.lock = null;
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
type State = {a: VrmPose; b: VrmPose; t: number; pos: V3; yaw: number; rollZ: number; height: number; squash: number; flat: number; act: VrmKey['act']; motion?: string; prevMotion?: string; mixPrev: number; mixCur: number; local: number; f: number;
  clipCur: VrmKey; clipPrev: VrmKey};

function keyAt(keys: VrmKey[], f: number): number {
  let i = 0;
  for (let k = 0; k < keys.length; k++) if (keys[k].f <= f) i = k;
  return i;
}

/** The clip a key plays: its own, or the one it inherits from the keys before it (null = none, the pose only). */
function motionOf(keys: VrmKey[], i: number): string | undefined {
  for (let j = i; j >= 0; j--) if (keys[j].motion !== undefined) return keys[j].motion ?? undefined;
  return undefined;
}

/** The key that started the clip key i plays: walk back while the clip stays the same and nothing restarts it. */
function clipStart(keys: VrmKey[], i: number): number {
  const m = motionOf(keys, i);
  let j = i;
  while (j > 0 && !keys[j].restart && motionOf(keys, j - 1) === m) j--;
  return j;
}

/** Seconds into the clip at frame f, from the key that started it (looping, or held on the last frame for a one-shot). */
export function clipSeconds(s: VrmKey, f: number, fps: number, duration: number): number {
  const t = (s.clipFrom ?? 0) + ((f - s.f) / fps) * (s.speed ?? 1);
  if (s.once) return Math.max(0, Math.min(duration - 1e-3, t));
  return ((t % duration) + duration) % duration;
}

function stateAt(keys: VrmKey[], f: number, camPos: V3): State {
  const i = keyAt(keys, f), k = keys[i], p = keys[Math.max(0, i - 1)];
  const blend = k.blend ?? 8;
  const t = i === 0 || blend <= 0 ? 1 : ease('inOut', (f - k.f) / blend);
  const lerp = (x: number, y: number) => x + (y - x) * t;
  const pos = moveAt(keys, f);
  const yawOf = (q: VrmKey) => {
    const lens = Math.atan2(camPos[0] - pos[0], camPos[2] - pos[2]);
    if (q.rotY === 'away') return lens + Math.PI;
    return q.rotY === 'lens' || q.rotY === undefined ? lens : (q.rotY * Math.PI) / 180;
  };
  const pose = (name: string) => {
    const x = POSES[name];
    if (!x) cancelRender(new Error(`unknown VRM pose ${name} (studio/src/three/vrmPoses.ts)`));
    return x;
  };
  const local = f - k.f;
  const beat = Math.sin((f / 30) * (129.2 / 60) * Math.PI * 2);
  const squash = k.act === 'shrink' ? 1 - 0.14 * ease('out', local / 10)
    : k.act === 'pop' ? 1 + 0.055 * Math.exp(-local / 10) * Math.cos(local * 0.8)
      : k.act === 'stomp' && local < 12 ? 1 - 0.09 * Math.max(0, Math.sin(local * 0.45)) : 1;
  let lift = 0;
  if (k.act === 'hop' && local < 16) lift = 0.28 * Math.sin(Math.PI * Math.min(1, local / 12));
  if (k.act === 'bounce') lift = 0.055 * Math.abs(beat);
  if (k.act === 'float') lift = 0.12 + 0.05 * Math.sin((f / 30) * Math.PI * 0.7);
  pos[1] += lift;
  // flatten (POV Shorts 2026-10-23): she goes flat like a ray on the sand - thin and wide, with a little overshoot
  const flat = k.act === 'flatten' ? Math.min(1, ease('out', local / 6) * (1 + 0.08 * Math.exp(-local / 5) * Math.sin(local))) : 0;
  const motion = motionOf(keys, i), prevMotion = i > 0 ? motionOf(keys, i - 1) : motion;
  return {a: pose(p.pose), b: pose(k.pose), t, pos, yaw: lerp(yawOf(p), yawOf(k)), motion, prevMotion,
    mixPrev: prevMotion ? (p.motionMix ?? 1) : 0, mixCur: motion ? (k.motionMix ?? 1) : 0,
    rollZ: lerp(p.rollZ ?? 0, k.rollZ ?? 0) + (k.act === 'tilt' ? 0.12 * ease('out', local / 8) : k.act === 'lean' ? -0.08 * ease('out', local / 10) : 0),
    height: lerp(p.height ?? DEFAULT_HEIGHT, k.height ?? DEFAULT_HEIGHT), squash, flat, act: k.act, local, f,
    clipCur: keys[clipStart(keys, i)], clipPrev: keys[clipStart(keys, Math.max(0, i - 1))]};
}

/** Reuse the timeline's keyed floor travel and hop arcs, rather than easing the actor to a new spot after each cut. */
function moveAt(keys: VrmKey[], f: number): V3 {
  let i = keyAt(keys, f);
  const current = keys[i];
  const next = keys[i + 1];
  if (!next || !next.move || f < next.f - next.move) return [...current.pos] as V3;
  const t = Math.max(0, Math.min(1, (f - (next.f - next.move)) / next.move));
  const e = ease(next.ease, t);
  return [
    current.pos[0] + (next.pos[0] - current.pos[0]) * e,
    current.pos[1] + (next.pos[1] - current.pos[1]) * e + (next.arc ?? 0) * Math.sin(Math.PI * t),
    current.pos[2] + (next.pos[2] - current.pos[2]) * e,
  ];
}

const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), eu = new THREE.Euler();

const BONES: VRMHumanBoneName[] = ['hips', 'spine', 'chest', 'upperChest', 'neck', 'head', 'leftShoulder', 'rightShoulder',
  'leftUpperArm', 'rightUpperArm', 'leftLowerArm', 'rightLowerArm', 'leftHand', 'rightHand', 'leftUpperLeg', 'rightUpperLeg',
  'leftLowerLeg', 'rightLowerLeg', 'leftFoot', 'rightFoot', 'leftToes', 'rightToes'];
function savePose(vrm: VRM): [THREE.Object3D, THREE.Quaternion, THREE.Vector3][] {
  const out: [THREE.Object3D, THREE.Quaternion, THREE.Vector3][] = [];
  for (const n of BONES) {
    const node = vrm.humanoid.getNormalizedBoneNode(n);
    if (node) out.push([node, node.quaternion.clone(), node.position.clone()]);
  }
  return out;
}
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
  const phase = t * Math.PI * 2.69;
  const kick = s.local < 18 ? Math.sin(s.local * 0.55) * Math.exp(-s.local / 8) : 0;
  if (s.act === 'idle' || s.act === 'bounce' || s.act === 'float') {
    add('hips', [0, 0, 0.055 * Math.sin(t * 1.55)]);
    add('spine', [0.025 * Math.sin(t * 1.55 + 0.6), 0, 0]);
    add('leftUpperArm', [0, 0, 0.035 * Math.sin(t * 1.55)]);
    add('rightUpperArm', [0, 0, -0.035 * Math.sin(t * 1.55)]);
  }
  if (s.act === 'hop' || s.act === 'bounce') {
    add('hips', [-0.04 * Math.abs(Math.sin(phase)), 0, 0]);
    add('leftUpperLeg', [-0.12 * Math.max(0, Math.sin(phase)), 0, 0]);
    add('rightUpperLeg', [-0.12 * Math.max(0, -Math.sin(phase)), 0, 0]);
  }
  if (s.act === 'stomp') { add('hips', [kick * 0.2, 0, 0]); add('chest', [-kick * 0.16, 0, 0]); }
  if (s.act === 'shake') add('head', [0, 0, Math.sin(s.local * 1.7) * 0.16 * Math.exp(-s.local / 17)]);
  if (s.act === 'lean') add('spine', [0.08, 0, 0]);
  if (s.act === 'float') add('spine', [0.025 * Math.sin(t * Math.PI * 0.7), 0, 0.025 * Math.sin(t * Math.PI * 0.5)]);
  // Sample retargeted Mixamo clips at an absolute timestamp. This keeps arbitrary-order,
  // parallel Remotion frames deterministic and lets expression/spring-bone simulation stay local.
  // 2026-10-22: no hard switch any more - two clips cross-fade over the key's blend, and a clip is laid over the key
  // pose by `motionMix` (1 = the clip alone, 0.5 = half clip half pose), also faded in / out when a key has none.
  // a key that asks for a clip the rig does not have is an error, never a silent freeze in the pose
  for (const m of [s.prevMotion, s.motion]) if (m && !rig.motions.has(m)) cancelRender(new Error(`clip ${m} is not loaded (props.motions)`));
  const a = s.prevMotion && rig.motions.has(s.prevMotion) ? s.prevMotion : undefined;
  const b = s.motion && rig.motions.has(s.motion) ? s.motion : undefined;
  const amount = (a ? s.mixPrev : 0) * (1 - s.t) + (b ? s.mixCur : 0) * s.t;
  if (amount > 0.001) {
    const wA = a && b ? (a === b ? 0 : 1 - s.t) : a ? 1 : 0;
    const wB = a && b ? (a === b ? 1 : s.t) : b ? 1 : 0;
    // the posed bones before the clip (the mixer overwrites them; the clip result is slerped back toward them)
    const saved = savePose(vrm);
    for (const [id, clip] of rig.motions) {
      let action = rig.actions.get(id);
      if (!action) { action = rig.mixer.clipAction(clip); action.play(); rig.actions.set(id, action); }
      // the current clip first: when a key inherits the clip of the key before (a === b, the usual case) wA is 0 -
      // asking `id === a` first gave the playing clip weight 0 and froze her in the pose (found 2026-10-23, toki "steif")
      const weight = id === b ? wB : id === a ? wA : 0;
      action.enabled = true;
      action.setEffectiveWeight(weight);
      if (weight > 0) action.time = clipSeconds(id === b ? s.clipCur : s.clipPrev, s.f, fps, clip.duration);
    }
    rig.mixer.update(0);
    if (amount < 0.999) for (const [node, q, p] of saved) { node.quaternion.copy(q.slerp(node.quaternion, amount)); node.position.lerpVectors(p, node.position, amount); }
  }
  vrm.humanoid.update();
  // feet on the floor: measure the posed rig unplaced, then place it
  root.position.set(0, 0, 0); root.rotation.set(0, 0, 0); root.scale.setScalar(1); ground.position.set(0, 0, 0);
  root.updateMatrixWorld(true);
  ground.position.y = rig.restLow - lowestFoot(vrm) - rig.floor;
  root.position.set(...s.pos);
  root.rotation.set(0, s.yaw + (s.act === 'turn' ? Math.PI * ease('out', s.local / 8) : 0), s.rollZ, 'YXZ');
  const size = (s.height / rig.natural) * s.squash;
  const wide = 1 + 0.3 * s.flat;
  root.scale.set(size * wide, size * (s.act === 'hop' && s.local < 10 ? 1.06 : 1) * (1 - 0.86 * s.flat), size * wide);
  root.updateMatrixWorld(true);
}

function setExpressions(rig: Rig, k: VrmKey, f: number, fps: number, mouthKeys: VrmMouthKey[]) {
  const em = rig.vrm.expressionManager;
  if (!em) return;
  for (const e of em.expressions) em.setValue(e.expressionName, 0);
  const want = exprOf(k);
  for (const [name, v] of Object.entries(want)) {
    const n = EXPRESSION_ALIAS[name.toLowerCase()] ?? name;
    if (!em.getExpression(n)) cancelRender(new Error(`VRM has no expression ${name} (${n})`));
    em.setValue(n, v);
  }
  // Singing: the vowel presets on top. An emotion preset (joy, fun ...) also moves the MOUTH and would fight the
  // vowels - while she sings, its brows + eyes come from her raw shape keys instead (written after the update).
  const mouth = vrmMouthAt(mouthKeys, f);
  const singing = Object.values(mouth).reduce((a, b) => a + (b ?? 0), 0) > 0.05;
  // raw keys are never reset by the expression manager: every frame writes all of them (0 when unused)
  const raw: Record<string, number> = Object.fromEntries(['Fcl_MTH_Close', ...Object.values(EMOTION_PARTS).flat()].map((k) => [k, 0]));
  if (singing) {
    for (const [name, v] of Object.entries(want)) {
      const part = EMOTION_PARTS[name.toLowerCase()];
      if (!part) continue;
      em.setValue(EXPRESSION_ALIAS[name.toLowerCase()] ?? name, 0);
      for (const k of part) raw[k] = Math.max(raw[k] ?? 0, v);
    }
  }
  for (const [name, v] of Object.entries(mouth)) {
    if (name === 'close') { raw.Fcl_MTH_Close = v ?? 0; continue; }
    const n = EXPRESSION_ALIAS[name] ?? name;
    if (em.getExpression(n)) em.setValue(n, v ?? 0);
  }
  pendingRaw.set(rig, raw);
  // blinks: every ~3.4 s on fixed frames (no randomness between workers), 5 frames; never during a held blink / joy
  if (!('blink' in want) && !('blink_l' in want) && !('blink_r' in want) && !('joy' in want) && !('happy' in want)) {
    const period = Math.round(3.4 * fps), ph = f % period;
    if (ph < 5) em.setValue('blink', Math.sin((ph / 5) * Math.PI));
  }
}

const EMOTION_PARTS: Record<string, string[]> = {
  joy: ['Fcl_BRW_Joy', 'Fcl_EYE_Joy'], happy: ['Fcl_BRW_Joy', 'Fcl_EYE_Joy'], fun: ['Fcl_BRW_Fun', 'Fcl_EYE_Fun'],
  relaxed: ['Fcl_BRW_Fun', 'Fcl_EYE_Fun'], angry: ['Fcl_BRW_Angry', 'Fcl_EYE_Angry'], sorrow: ['Fcl_BRW_Sorrow', 'Fcl_EYE_Sorrow'],
  sad: ['Fcl_BRW_Sorrow', 'Fcl_EYE_Sorrow'], surprised: ['Fcl_BRW_Surprised', 'Fcl_EYE_Surprised'],
};
const pendingRaw = new WeakMap<Rig, Record<string, number>>();

const camV = new THREE.Vector3();
/** Run the deterministic simulation and leave the rig posed for frame f. */
export function poseVrm(url: string, keys: VrmKey[], f: number, fps: number, from: number, camPos: V3, lock: number,
  mouthKeys: VrmMouthKey[] = []): Rig {
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
  setExpressions(rig, k, f, fps, mouthKeys);
  vrm.expressionManager?.update();
  for (const [name, v] of Object.entries(pendingRaw.get(rig) ?? {})) setMorph(rig, name, v);
  const look = k.look === undefined ? 'lens' : k.look;
  if (vrm.lookAt && look) {                // her eyes on the lens (you) or on a point of the set (the salmon)
    vrm.lookAt.autoUpdate = true;
    vrm.lookAt.lookAt(look === 'lens' ? camV.set(...camPos) : camV.set(...look));
    vrm.lookAt.update(dt);
    vrm.humanoid.update();                 // the eyes are humanoid bones: normalized -> raw
  }
  rig.root.updateMatrixWorld(true);
  return rig;
}

// Her battery (Beach 2026-10-22, "strings = 5 minus dots"): five violet lights in a row on her chest, riding the
// upper-chest bone. A dot that changes flares (comes on) or fades (goes out) over the step's t (6 frames).
const BATTERY_X = [-0.052, -0.026, 0, 0.026, 0.052];
function batteryDots(rig: Rig, b: {n: number; prev: number; t: number; color?: string; boost?: number}, f: number): React.ReactNode {
  const bone = rig.vrm.humanoid.getRawBoneNode('upperChest') ?? rig.vrm.humanoid.getRawBoneNode('chest');
  if (!bone) return null;
  const color = b.color ?? '#b98cff';
  const s = rig.root.scale.x;
  return BATTERY_X.map((x, i) => {
    const on = i < b.n, was = i < b.prev;
    let k = on ? 1 : 0;
    if (on !== was) k = on ? Math.min(1, b.t * 1.3) : 1 - b.t;
    const flare = (on && !was ? Math.sin(Math.PI * Math.min(1, b.t)) * 1.6 : 0) + (on ? 1.4 * (b.boost ?? 0) : 0);
    // a 1.55 m figure: the row sits ~11 cm in front of the bone, a little below it (her breastbone)
    const yaw = rig.root.rotation.y;                     // her facing in the world, not the bone's own axes
    const fwd = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)), side = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const k = (s * rig.natural) / 1.55;                  // her size against the 1.55 m the offsets were measured on
    const p = bone.getWorldPosition(new THREE.Vector3()).addScaledVector(fwd, 0.105 * k)
      .addScaledVector(side, x * k).add(new THREE.Vector3(0, -0.045 * k, 0));
    const r = 0.0125 * (1 + 0.35 * flare) * (0.95 + 0.05 * Math.sin(f / 7 + i));
    return (
      <group key={`bat${i}`} position={[p.x, p.y, p.z]}>
        <mesh renderOrder={3}><sphereGeometry args={[r, 12, 10]} />
          <meshBasicMaterial color={k > 0.02 ? color : '#2a2440'} transparent opacity={0.35 + 0.65 * Math.max(k, 0.25)} toneMapped={false} /></mesh>
        {k > 0.02 ? (
          <mesh renderOrder={4}><sphereGeometry args={[r * (3.2 + flare), 12, 10]} />
            <meshBasicMaterial color={color} transparent opacity={0.22 * k + 0.25 * flare} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} /></mesh>
        ) : null}
      </group>
    );
  });
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

/** step: 2 = she moves "on twos" (15 poses a second, the anime look) while the camera stays smooth at 30.
 *  outline: ink line width in model metres (0 = none, ~0.004 = a cel drawing). */
export const VrmPuppet: React.FC<{url: string; keys: VrmKey[]; f: number; fps: number; from?: number; camPos: V3;
  mouthKeys?: VrmMouthKey[]; lock?: number; shadow?: string; glow?: string; glowGain?: number; materialStyle?: string;
  step?: number; outline?: number; outlineColor?: string;
  battery?: {n: number; prev: number; t: number; color?: string; boost?: number} | null}> = ({url, keys, mouthKeys = [], f: frame, fps, from = 0, camPos, lock = 0.6,
  shadow = '#1d0b38', glow, glowGain = 1, materialStyle = 'none', step = 1, outline = 0, outlineColor = '#1a1030', battery = null}) => {
  const f = step > 1 ? frame - ((((frame - from) % step) + step) % step) : frame;
  if (!keys.length || f < keys[0].f) return null;
  const rig = rigs.get(url);
  if (!rig) { cancelRender(new Error(`VRM not preloaded: ${url}`)); throw new Error('unreachable'); }
  styleMaterials(rig, materialStyle);
  ensureOutline(rig, outline, outlineColor);
  const posed = poseVrm(url, keys, f, fps, Math.max(from, keys[0].f), camPos, lock, mouthKeys);
  syncOutline(posed);
  const p = posed.root.position;
  const w = (posed.root.scale.x * posed.natural) * 0.42;
  const chest = posed.vrm.humanoid.getRawBoneNode('chest')?.getWorldPosition(new THREE.Vector3());
  const pulse = (0.85 + 0.15 * Math.sin(f / 9)) * glowGain;
  const dots = battery ? batteryDots(posed, battery, frame) : null;
  const curKey = keys[keyAt(keys, f)];
  const facing = new THREE.Vector3(Math.sin(posed.root.rotation.y), 0, Math.cos(posed.root.rotation.y));
  const worn = wornProps(posed.vrm, curKey.props, facing, (curKey.height ?? DEFAULT_HEIGHT) / DEFAULT_HEIGHT);
  return (
    <group>
      {dots}
      {worn}
      <mesh position={[p.x, p.y + 0.035, p.z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <planeGeometry args={[w * 1.6, w * 0.9]} />
        <meshBasicMaterial map={blobTexture(shadow)} transparent depthWrite={false} opacity={0.95} toneMapped={false} />
      </mesh>
      <primitive object={posed.root} />
      {/* a cool rim light behind her, toward the lens: her silhouette separates from any background (look-critic) */}
      {chest ? (() => {
        const back = new THREE.Vector3(p.x - camPos[0], 0, p.z - camPos[2]).normalize().multiplyScalar(0.9);
        return <pointLight position={[chest.x + back.x, chest.y + 0.45, chest.z + back.z]} color="#b9c8ff" intensity={2.2} distance={2.2} decay={1.6} />;
      })() : null}
      {glow && chest && glowGain > 0.01 ? (    // 灯闇: she is the lamp in the dark (like Puppet3D)
        <pointLight position={[chest.x, chest.y, chest.z + 0.25]} color={glow} intensity={7 * pulse} distance={5} decay={1.4} />
      ) : null}
    </group>
  );
};
