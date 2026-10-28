// Raymi as a 3D VRM model (roadmap item 4, the slot after the PNG puppet): her own VRoid export, MToon kept, placed
// like Puppet3D (feet on the set floor, height in metres, turned to the lens or by degrees), key poses as bone
// rotations (vrmPoses.ts), expressions by name, eyes on the lens, deterministic blinks.
//
// Determinism for parallel render workers: nothing is carried between frames. Every frame re-simulates her spring
// bones (hair, rabbit ears, tail) from ONE fixed start per shot: a settle at the shot's first frame, then frame by frame
// up to f, each step with the camera of THAT frame. Same f -> same picture on every worker, in any order. (Until take 14
// the start slid with f (f - 90) and every step used the camera of f: each frame began from another history, so a moving
// camera shook her hair - toki 2026-10-28 "haare bewegen sich manchmal noch komisch ... choppy".) A memo of the spring
// state per frame keeps it cheap: a tab renders its frames in order, so it steps on from the last one it simulated.
//
// Her skin stays pale grey-blue under any set light (hard rule 9): `lock` (0..1) moves that share of her colour
// from the lit term into a self-lit term (emissive = her own texture), so a coloured set light can only tint the
// rest. lock 1 = unlit like the sprite was; default 0.6 keeps a readable toon shade.
import React, {useEffect, useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {fixModel, hairColliders} from './vrmFix';
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
import {useThree} from '@react-three/fiber';
import {solidBoxes, supportBelow} from './support';

export const DEFAULT_HEIGHT = 1.55;       // ears to feet, like the sprite puppet (raymi/timeline.py DEFAULT_HEIGHT)
const SETTLE = 30;                         // frames the start state is held so the springs hang at rest
// toki 2026-10-24 "haare fliegen komisch" -> damped; 2026-10-25 "wenn sie still steht sind ihre haare steif, dabei müssten
// die nach unten fallen": less damping and stiffness again, and real gravity so the strands hang and swing
const HAIR_DRAG = 0.45, HAIR_STIFF = 0.75, HAIR_GRAVITY = 0.45;

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
  fixModel(gltf.scene);                    // load-time model fixes (vrmFix.ts): the sleeve caps ride the upper arm
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
  // calmer hair (toki 2026-10-24: "manchmal fliegen die haare komisch rum"): every spring joint gets at least this
  // drag and stiffness, so a fast turn or a jump in a shot swings her hair instead of flinging it
  for (const j of vrm.springBoneManager?.joints ?? []) {
    j.settings.dragForce = Math.max(j.settings.dragForce, HAIR_DRAG);
    j.settings.stiffness = Math.max(j.settings.stiffness, HAIR_STIFF);
    if (/Hair/.test(j.bone.name)) { j.settings.gravityPower = Math.max(j.settings.gravityPower, HAIR_GRAVITY); j.settings.gravityDir.set(0, -1, 0); }
  }
  hairColliders(vrm);                      // vrmFix: her torso / shoulders as hair colliders (probe: hair_in in 34 shots)
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

/** Her BODY rests on the floor too, not only her feet (the white blob, clips_seen 2026-10-25: kneeling, lying, the
 *  superhero crouch - grounded by the feet alone, her hips, back and head sank under the floor, only boots and a lit
 *  patch stayed). Each bone keeps its own flesh radius (model units) above the model's floor; the lift that does it. */
const BODY_R: [VRMHumanBoneName, number][] = [['hips', 0.12], ['spine', 0.11], ['chest', 0.11], ['upperChest', 0.1],
  ['neck', 0.06], ['head', 0.11], ['leftUpperLeg', 0.08], ['rightUpperLeg', 0.08], ['leftLowerLeg', 0.05],
  ['rightLowerLeg', 0.05], ['leftUpperArm', 0.05], ['rightUpperArm', 0.05], ['leftLowerArm', 0.04], ['rightLowerArm', 0.04],
  ['leftHand', 0.03], ['rightHand', 0.03], ['leftShoulder', 0.06], ['rightShoulder', 0.06]];
function bodyClear(vrm: VRM, floor: number): number {
  const v = new THREE.Vector3();
  let lift = -Infinity;
  for (const [b, r] of BODY_R) {
    const n = vrm.humanoid.getRawBoneNode(b);
    if (n) lift = Math.max(lift, r - (n.getWorldPosition(v).y - floor));
  }
  return lift - floor;
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
    const v = t.values, x0 = v[0], y0 = v[1], z0 = v[2];
    // the way is kept aside (rootAt) and given back on the puppet - toki 2026-10-28: "wie angewurzelt"
    const xs: number[] = [], ys: number[] = [], zs: number[] = [];
    for (let i = 0; i < v.length; i += 3) { xs.push(v[i] - x0); ys.push(v[i + 1] - y0); zs.push(v[i + 2] - z0); }
    ROOTS.set(clip, {times: Array.from(t.times), xs, ys, zs});
    for (let i = 0; i < v.length; i += 3) { v[i] = x0; v[i + 2] = z0; }
  }
  return clip;
}

// Her way through the space (toki 2026-10-28 on take 13: "raymi wirkt wie angewurzelt ... die schwimm clips sehen
// immernoch komisch aus, sie klettert am leuchtturm in die falsche richtung"). The clip's hips travel is given back
// in the hips' OWN parent space - the space the retarget wrote it in, so a VRM0 model (turned 180 deg, its x / z
// mirrored by the retarget) needs no sign rule. A loop goes ON from where it ended (x / z and the climb's height),
// never back to its start. Key "root": false keeps a clip on its spot.
const ROOTS = new WeakMap<THREE.AnimationClip, {times: number[]; xs: number[]; ys: number[]; zs: number[]}>();
/** The clip's hips travel at UNWRAPPED clip time tt, relative to its first frame: [x, y, z] in the hips' parent space.
 *  y counts only whole loops (the track keeps its own height inside a loop). */
export function rootAt(clip: THREE.AnimationClip, tt: number): [number, number, number] {
  const r = ROOTS.get(clip);
  if (!r || r.times.length < 2) return [0, 0, 0];
  const d = clip.duration || r.times[r.times.length - 1];
  const loops = Math.floor(tt / d), u = tt - loops * d;
  let j = 0;
  while (j < r.times.length - 2 && r.times[j + 1] <= u) j++;
  const a = r.times[j], b = r.times[j + 1], w = b > a ? Math.max(0, Math.min(1, (u - a) / (b - a))) : 0;
  const n = r.xs.length - 1, at = (xs: number[]) => xs[j] + (xs[j + 1] - xs[j]) * w;
  return [at(r.xs) + loops * r.xs[n], loops * r.ys[n], at(r.zs) + loops * r.zs[n]];
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
    // toki 2026-10-27: "wenn raymi nah an / in die kamera kommt sieht man dass sie hohl von innen ist" - back faces culled;
    // both sides drawn, the inside of a sleeve or her hair is a surface, never a hole
    (m as THREE.Material).side = THREE.DoubleSide;
    if (style === 'routine') {
      // look-critic 2026-10-23 (twice): skin, face and the white skirt clipped to paper white under the set lights +
      // bloom. Lowering the lights did not hold (anti-loop) - so her own colours carry the headroom: skin pale grey-blue
      // at ~80 % value, fabric and hair a step down, the lit side can never reach white.
      const name = m.name ?? '';
      // toki 2026-10-25: "ihr gesicht ist immer überlichtet, ihr rock ... in dunklen scenen komplett weiß, so verhält stoff
      // sich nicht" - fabric gets a real cool shade, a sharper terminator and the scene's ambient (it falls into shadow);
      // the face (VRoid exports it with shade = base, i.e. never shaded) gets a shade a step down too
      const mt = m as typeof m & {shadingToonyFactor?: number; shadingShiftFactor?: number; giEqualizationFactor?: number};
      if (name.includes('FACE') || name.includes('Face')) {
        m.color.multiply(new THREE.Color('#b3bedc'));
        m.shadeColorFactor?.copy(m.color).multiply(new THREE.Color('#9aa2c8'));
      }
      else if (name.includes('SKIN')) { m.color.multiply(new THREE.Color('#b3bedc')); m.shadeColorFactor?.multiply(new THREE.Color('#8f9cc4')); }
      else if (name.includes('CLOTH')) {
        m.color.multiply(new THREE.Color('#a9abc4'));
        m.shadeColorFactor?.copy(m.color).multiply(new THREE.Color('#6c6a92'));     // white tulle in shade: violet grey, never white (nor black)
        mt.shadingToonyFactor = 0.82; mt.shadingShiftFactor = -0.12; mt.giEqualizationFactor = 0.95;
      }
      else if (name.includes('HAIR')) {
        m.color.multiply(new THREE.Color('#c4c8e6'));
        // look-critic stills 3: black + peak blue, no mid tone - a violet rim from the lens side gives the strands a middle
        const mr = m as typeof m & {parametricRimColorFactor?: THREE.Color; rimLightingMixFactor?: number; parametricRimFresnelPowerFactor?: number; parametricRimLiftFactor?: number};
        mr.parametricRimColorFactor?.set('#5a4a9a'); mr.rimLightingMixFactor = 0.6; mr.parametricRimFresnelPowerFactor = 2.5; mr.parametricRimLiftFactor = 0.05;
      }
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
    // the lock is for her SKIN's hue (hard rule 9), not for everything: a self-lit white skirt stayed white in the dark
    // and the face (self-lit + key + bloom) burnt (toki 2026-10-25). Skin / face / eyes keep 0.8 of it, hair a third,
    // the white tulle a little, other fabric none - it takes the set's light and her own glow like cloth does
    const share = lockShare(m.name ?? '');
    const a = from * share, b = lock * share;
    const k = (1 - b) / Math.max(1e-3, 1 - a);           // undo the previous lock, apply the new one
    m.color.multiplyScalar(k);
    m.shadeColorFactor?.multiplyScalar(k);
    m.emissiveMap = b > 0 ? m.map ?? null : null;
    m.emissive.setScalar(b);
    m.needsUpdate = true;
  }
  rig.lock = lock;
}

/** How much of the colour lock a material takes (VRoid names: ..._SKIN, Face..., Eye..., ..._HAIR, ..._CLOTH). */
export function lockShare(name: string): number {
  if (/SKIN|Face|FACE|Eye|EYE|Mouth/.test(name)) return 0.6;   // look-critic stills 3: 0.8 + the key clipped her skin white
  if (/HAIR/.test(name)) return 0.1;                     // toki 2026-10-25: the hair glowed ("total am leuchten")
  if (/Bottoms|Onepiece_00_CLOTH_02/.test(name)) return 0.14;   // the white tulle: not black in a dark shot either
  return 0;
}

// ------------------------------------------------------------------ the state at a frame (pure, from the keys)
type State = {a: VrmPose; b: VrmPose; t: number; pos: V3; yaw: number; rollZ: number; height: number; squash: number; flat: number; act: VrmKey['act']; motion?: string; prevMotion?: string; mixPrev: number; mixCur: number; local: number; f: number;
  clipCur: VrmKey; clipPrev: VrmKey; aware: number; lensYaw: number; lensPitch: number; keyF: number; cur: VrmKey};

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

/** three's PropertyMixer writes a bone only when the clip value CHANGED since its last update (accu0 !== accu1). We pose
 *  the bones from the key pose before every clip update, so an unchanged clip value lost to the pose: a held animation
 *  frame (speed 0) never showed and the first frame of every shot (the window replays its first state twice) snapped
 *  to the key pose - found 2026-10-24 (Watch Me boards: she stood in every board; a one-frame pop at every cut).
 *  Poisoning the accu the mixer does NOT write this update makes every bone compare as changed. */
function forceApply(mixer: THREE.AnimationMixer): void {
  const m = mixer as unknown as {_accuIndex: number; _bindings: {valueSize: number; buffer: ArrayLike<unknown> & {[i: number]: unknown}}[]};
  if (!Array.isArray(m._bindings)) return;
  for (const b of m._bindings) {
    const off = m._accuIndex * b.valueSize + b.valueSize;
    for (let i = 0; i < b.valueSize; i++) b.buffer[off + i] = NaN;
  }
}

/** The key that started the clip key i plays: walk back while the clip stays the same and nothing restarts it. */
function clipStart(keys: VrmKey[], i: number): number {
  const m = motionOf(keys, i);
  let j = i;
  while (j > 0 && !keys[j].restart && motionOf(keys, j - 1) === m) j--;
  return j;
}

/** The frame of a clip to HOLD for a pose: near `want` (within 0.9 s), where the body moves least (a key pose, not a
 *  passing frame) and the hips are high (standing, not caught mid-crouch). Cached per clip and time. */
const holds = new Map<string, number>();
export function holdTime(clip: THREE.AnimationClip, want: number): number {
  const key = `${clip.uuid}:${want.toFixed(3)}`;
  const hit = holds.get(key);
  if (hit !== undefined) return hit;
  const quats = clip.tracks.filter((tr) => tr.name.endsWith('.quaternion')).map((tr) => tr.createInterpolant());
  const hipsPos = clip.tracks.find((tr) => tr.name.endsWith('.position') && /hips/i.test(tr.name))?.createInterpolant();
  const sample = (tt: number) => quats.map((ip) => Array.from(ip.evaluate(tt) as Float32Array));
  const hipsY = (tt: number) => (hipsPos ? (hipsPos.evaluate(tt) as Float32Array)[1] : 0);
  let maxY = -Infinity;
  for (let tt = 0; tt <= clip.duration; tt += 0.1) maxY = Math.max(maxY, hipsY(tt));
  const span = Math.max(1e-3, maxY - Math.min(...Array.from({length: Math.ceil(clip.duration / 0.1) + 1}, (_, i) => hipsY(Math.min(clip.duration, i * 0.1)))));
  let best = Math.max(0, Math.min(clip.duration - 1e-3, want)), score = Infinity;
  const dt = 1 / 15;
  for (let tt = Math.max(dt, want - 0.9); tt <= Math.min(clip.duration - dt, want + 0.9); tt += dt) {
    const a = sample(tt - dt), b = sample(tt + dt);
    let motion = 0;
    for (let i = 0; i < a.length; i++) motion += 1 - Math.abs(a[i][0] * b[i][0] + a[i][1] * b[i][1] + a[i][2] * b[i][2] + a[i][3] * b[i][3]);
    const low = (maxY - hipsY(tt)) / span;                 // 0 = as high as the clip's hips get, 1 = its lowest crouch
    const s = motion * 40 + low * 1.2 + Math.abs(tt - want) * 0.25;
    if (s < score) { score = s; best = tt; }
  }
  holds.set(key, best);
  return best;
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
  if (k.drift) for (let n = 0; n < 3; n++) pos[n] += k.drift[n] * (f - k.f) / 30;
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
    clipCur: keys[clipStart(keys, i)], clipPrev: keys[clipStart(keys, Math.max(0, i - 1))],
    aware: lerp(p.aware ?? 0, k.aware ?? 0), keyF: k.f, cur: k,
    // where the lens is, seen from her: yaw relative to the way she faces, pitch from her head height
    lensYaw: Math.atan2(camPos[0] - pos[0], camPos[2] - pos[2]),
    lensPitch: Math.atan2(camPos[1] - (pos[1] + 1.38 * ((k.height ?? DEFAULT_HEIGHT) / DEFAULT_HEIGHT)), Math.hypot(camPos[0] - pos[0], camPos[2] - pos[2]))};
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

/** The observer effect: neck + head turn a share toward the lens, after the clip (a clip would overwrite it). From the
 *  front she meets the viewer; from behind (lens > ~95 deg off her facing) she only glances over her shoulder for
 *  ~1.2 s every ~4.5 s - she senses the watcher, she does not perform for them. Pure in f (parallel workers agree). */
function noticeLens(rig: Rig, s: State, fps: number) {
  const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
  const rel = wrap(s.lensYaw - s.yaw);
  const back = Math.abs(rel) > 1.65;
  let env = 1;
  if (back) {
    const t = ((((s.f - s.keyF) / fps - 0.5) % 4.5) + 4.5) % 4.5;   // a glance every 4.5 s, the first 0.5 s after the key
    env = t < 1.2 ? Math.sin((t / 1.2) * Math.PI) : 0;
  }
  const amt = s.aware * env;
  if (amt < 0.001) return;
  const yaw = Math.max(-1.05, Math.min(1.05, rel)) * amt;  // never past ~60 deg: a turn of the head, not the body
  const pitch = Math.max(-0.35, Math.min(0.35, s.lensPitch)) * amt * (back ? 0.3 : 1);
  const turn = (n: VRMHumanBoneName, k: number) => {
    const node = rig.vrm.humanoid.getNormalizedBoneNode(n);
    if (node) node.quaternion.premultiply(qb.setFromEuler(eu.set(-pitch * k, (rig.mirror ? -1 : 1) * yaw * k, 0, 'YXZ')));
  };
  turn('neck', 0.4); turn('head', 0.6);
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
      if (weight > 0) {
        const ck = id === b ? s.clipCur : s.clipPrev;
        // a held frame (speed 0) is a KEY POSE: the calmest upright frame near the asked time (toki 2026-10-25: "raymi
        // springt die ganze zeit rum" - clip_from 0.6 landed mid-crouch / mid-jump in some dance clips)
        action.time = (ck.speed ?? 1) === 0 && !ck.exact ? holdTime(clip, ck.clipFrom ?? 0) : clipSeconds(ck, s.f, fps, clip.duration);
      }
    }
    forceApply(rig.mixer);
    rig.mixer.update(0);
    if (amount < 0.999) for (const [node, q, p] of saved) { node.quaternion.copy(q.slerp(node.quaternion, amount)); node.position.lerpVectors(p, node.position, amount); }
    // the clip's way since this key (rootAt): she steps, lunges, swims and climbs THROUGH the space
    const clipNow = b ? rig.motions.get(b) : undefined, ck = s.clipCur, sp = ck.speed ?? 1;
    const hips = vrm.humanoid.getNormalizedBoneNode('hips');
    if (clipNow && hips && s.cur.root !== false && sp !== 0) {
      const cap = (x: number) => (ck.once ? Math.min(x, clipNow.duration - 1e-3) : x);
      const t0 = cap((ck.clipFrom ?? 0) + ((s.keyF - ck.f) / fps) * sp), t1 = cap((ck.clipFrom ?? 0) + ((s.f - ck.f) / fps) * sp);
      const a0 = rootAt(clipNow, t0), a1 = rootAt(clipNow, t1), k = s.mixCur;
      hips.position.x += (a1[0] - a0[0]) * k; hips.position.y += (a1[1] - a0[1]) * k; hips.position.z += (a1[2] - a0[2]) * k;
    }
  }
  if (s.aware > 0.001) noticeLens(rig, s, fps);
  vrm.humanoid.update();
  // feet on the floor: measure the posed rig unplaced, then place it
  root.position.set(0, 0, 0); root.rotation.set(0, 0, 0); root.scale.setScalar(1); ground.position.set(0, 0, 0);
  root.updateMatrixWorld(true);
  // in water, in the air and on a wall nothing stands on the floor: the rest pose's feet mark the key's height and the
  // body moves freely from there (take 13: every swim pose was set down on its lowest foot - she crawled on the cable -
  // and every metre a climb gained was pulled back to the floor, so she climbed on the spot or downwards)
  const free = AIRBORNE.test(s.motion ?? '') || s.cur.ground === false;
  ground.position.y = free ? -rig.floor : Math.max(rig.restLow - lowestFoot(vrm) - rig.floor, bodyClear(vrm, rig.floor));
  // faceLens: measure the clip's hip turn on the unplaced rig and take it back out of her facing
  let hipTurn = 0;
  if (s.clipCur.faceLens && s.motion) {
    // the hips' LOCAL rotation = the turn against her rest pose (normalized bones rest at identity). Round 3 measured
    // it in world space: a VRM0 model stands rotated 180 deg in its scene, so every face_lens shot showed her back
    const q = vrm.humanoid.getNormalizedBoneNode('hips')?.quaternion;
    if (q) { const fw = new THREE.Vector3(0, 0, 1).applyQuaternion(q); hipTurn = Math.atan2(fw.x, fw.z); }
  }
  root.position.set(...s.pos);
  root.rotation.set(0, s.yaw - hipTurn + (s.act === 'turn' ? Math.PI * ease('out', s.local / 8) : 0), s.rollZ, 'YXZ');
  const size = (s.height / rig.natural) * s.squash;
  const wide = 1 + 0.3 * s.flat;
  root.scale.set(size * wide, size * (s.act === 'hop' && s.local < 10 ? 1.06 : 1) * (1 - 0.86 * s.flat), size * wide);
  root.updateMatrixWorld(true);
}

function setExpressions(rig: Rig, k: VrmKey, f: number, fps: number, mouthKeys: VrmMouthKey[]) {
  const em = rig.vrm.expressionManager;
  if (!em) return;
  for (const e of em.expressions) em.setValue(e.expressionName, 0);
  const want = {...exprOf(k)};
  // toki 2026-10-27 ("lipsync sieht noch unpassend aus"): a vowel in a key's expr ("aa": 0.8 = a yell) was a FIXED open
  // mouth on top of her singing - a frozen grimace while the words ran. Where she sings, the yell now opens the sung
  // vowels wider (the voice still shapes the mouth); only a silent shot keeps the designed open scream.
  let yell = 0;
  if (mouthKeys.length) for (const n of Object.keys(want)) if (MOUTH_VOWELS.has(n.toLowerCase())) { yell = Math.max(yell, want[n]); delete want[n]; }
  for (const [name, v] of Object.entries(want)) {
    const n = EXPRESSION_ALIAS[name.toLowerCase()] ?? name;
    if (!em.getExpression(n)) cancelRender(new Error(`VRM has no expression ${name} (${n})`));
    em.setValue(n, v);
  }
  // An emotion preset (joy, fun, surprised ...) also opens the MOUTH. toki 2026-10-24 (POV Shorts): "mund muss
  // geschlossen sein wenn sie nicht spricht" - so an emotion ALWAYS comes from her raw brow + eye shape keys, never
  // from the preset; only her voice (the vowels below) opens the mouth.
  const mouth = vrmMouthAt(mouthKeys, f);
  if (yell) for (const n of ['a', 'i', 'u', 'e', 'o'] as const) if (mouth[n]) mouth[n] = Math.min(0.9, mouth[n]! * (1 + 0.7 * yell));
  // how hard she sings right now (0..1), read from the open vowels: the face sings along, not only the mouth
  const sing = Math.min(1, (['a', 'i', 'u', 'e', 'o'] as const).reduce((s, n) => s + (mouth[n] ?? 0), 0) / 0.55);
  // raw keys are never reset by the expression manager: every frame writes all of them (0 when unused)
  const raw: Record<string, number> = Object.fromEntries(['Fcl_MTH_Close', ...Object.values(EMOTION_PARTS).flat(),
    ...Object.values(EMOTION_MOUTH), 'Fcl_BRW_Surprised'].map((k) => [k, 0]));
  let angry = 0;
  for (const [name, v] of Object.entries(want)) {
    const part = EMOTION_PARTS[name.toLowerCase()];
    if (!part) continue;
    em.setValue(EXPRESSION_ALIAS[name.toLowerCase()] ?? name, 0);
    for (const k of part) raw[k] = Math.max(raw[k] ?? 0, v);
    // toki 2026-10-27 ("sie ist immer sehr emotionslos"): brows and eyes alone left her face blank - the mouth corners
    // carry the feeling too (closed-mouth shapes: a smirk, a frown), fading out while a vowel needs the mouth
    const mc = EMOTION_MOUTH[name.toLowerCase()];
    if (mc) raw[mc] = Math.max(raw[mc] ?? 0, 0.45 * v * (1 - sing));
    if (name.toLowerCase() === 'angry') angry = Math.max(angry, v);
  }
  // singers' brows work with the voice: a loud note lifts them (or knits them harder in anger)
  if (angry > 0) raw.Fcl_BRW_Angry = Math.min(1, raw.Fcl_BRW_Angry + 0.25 * sing);
  else raw.Fcl_BRW_Surprised = Math.min(1, raw.Fcl_BRW_Surprised + 0.32 * sing);
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
// the closed-mouth corner shape of each emotion (VRoid face keys; a missing key is simply not written)
const EMOTION_MOUTH: Record<string, string> = {
  joy: 'Fcl_MTH_Fun', happy: 'Fcl_MTH_Fun', fun: 'Fcl_MTH_Fun', relaxed: 'Fcl_MTH_Fun',
  angry: 'Fcl_MTH_Angry', sorrow: 'Fcl_MTH_Sorrow', sad: 'Fcl_MTH_Sorrow',
};
const MOUTH_VOWELS = new Set(['aa', 'ih', 'ou', 'ee', 'oh', 'a', 'i', 'u', 'e', 'o']);
const pendingRaw = new WeakMap<Rig, Record<string, number>>();

const camV = new THREE.Vector3();
/** Run the deterministic simulation and leave the rig posed for frame f. */
/** Her body at frame f without the hair / cloth simulation (measuring tools: studio/root_travel.mjs). */
export function poseBody(url: string, keys: VrmKey[], f: number, fps: number, camPos: V3): void {
  const rig = rigs.get(url);
  if (!rig) throw new Error(`VRM not preloaded: ${url}`);
  applyState(rig, stateAt(keys, f, camPos), fps);
  rig.root.updateMatrixWorld(true);
}

type SpringSnap = {cur: THREE.Vector3; prev: THREE.Vector3; q: THREE.Quaternion}[];
const springMemo = new Map<Rig, {id: string; at: Map<number, SpringSnap>}>();
type SpringJoint = {bone: THREE.Object3D; _currentTail: THREE.Vector3; _prevTail: THREE.Vector3};
const springJoints = (rig: Rig) => [...(rig.vrm.springBoneManager?.joints ?? [])] as unknown as SpringJoint[];
function snapSprings(rig: Rig): SpringSnap {
  return springJoints(rig).map((j) => ({cur: j._currentTail.clone(), prev: j._prevTail.clone(), q: j.bone.quaternion.clone()}));
}
function restoreSprings(rig: Rig, s: SpringSnap): void {
  springJoints(rig).forEach((j, i) => { j._currentTail.copy(s[i].cur); j._prevTail.copy(s[i].prev); j.bone.quaternion.copy(s[i].q); });
}

/** camAt(g): the lens at frame g (the body turns to it: rotY "lens"); without it every step uses camPos. */
export function poseVrm(url: string, keys: VrmKey[], f: number, fps: number, from: number, camPos: V3, lock: number,
  mouthKeys: VrmMouthKey[] = [], camAt?: (g: number) => V3): Rig {
  const rig = rigs.get(url);
  if (!rig) { cancelRender(new Error(`VRM not preloaded: ${url}`)); throw new Error('unreachable'); }
  lockColours(rig, lock);
  const {vrm} = rig;
  const start = Math.min(from, f);
  const dt = 1 / fps;
  const camOf = (g: number): V3 => (g === f || !camAt ? camPos : camAt(g));
  const id = `${start}|${keys.length}|${keys[0].f}|${keys[keys.length - 1].f}|${fps}`;
  let memo = springMemo.get(rig);
  if (!memo || memo.id !== id) { memo = {id, at: new Map()}; springMemo.set(rig, memo); }
  let g0 = -1;
  for (const g of memo.at.keys()) if (g < f && g > g0) g0 = g;
  if (g0 >= start) {
    restoreSprings(rig, memo.at.get(g0)!);
  } else {
    applyState(rig, stateAt(keys, start, camOf(start)), fps);
    vrm.springBoneManager?.reset();
    for (let i = 0; i < SETTLE; i++) { vrm.springBoneManager?.update(dt); }
    g0 = start - 1;
  }
  for (let g = g0 + 1; g <= f; g++) {
    applyState(rig, stateAt(keys, g, camOf(g)), fps);
    vrm.springBoneManager?.update(dt);
    memo.at.set(g, snapSprings(rig));
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
    const sz = (s * rig.natural) / 1.55;                 // her size against the 1.55 m the offsets were measured on
    const p = bone.getWorldPosition(new THREE.Vector3()).addScaledVector(fwd, 0.105 * sz)
      .addScaledVector(side, x * sz).add(new THREE.Vector3(0, -0.045 * sz, 0));
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

const TRAIL_BONES: VRMHumanBoneName[] = ['leftHand', 'rightHand', 'leftFoot', 'rightFoot'];
const TRAIL_N = 12;
/** Her hands / feet over the last TRAIL_N frames, in her root's space (oldest first). */
function trailPoints(rig: Rig, keys: VrmKey[], f: number, fps: number, camPos: V3): THREE.Vector3[][] {
  const out: THREE.Vector3[][] = TRAIL_BONES.map(() => []);
  for (let k = TRAIL_N; k >= 0; k--) {
    const g = Math.max(keys[0].f, f - k);
    applyState(rig, stateAt(keys, g, camPos), fps);
    rig.root.updateMatrixWorld(true);
    TRAIL_BONES.forEach((b, i) => {
      const n = rig.vrm.humanoid.getRawBoneNode(b);
      if (n) out[i].push(rig.root.worldToLocal(n.getWorldPosition(new THREE.Vector3())));
    });
  }
  return out;
}

/** Glowing plankton ribbons along those paths: ultraviolet fading to nothing at the old end, a few cyan sparks; only
 *  where the limb really travelled (a still hand leaves no trail). */
const Trails: React.FC<{pts: THREE.Vector3[][]; root: THREE.Object3D; amount: number}> = ({pts, root, amount}) => {
  root.updateMatrixWorld(true);
  return (<>
    {pts.map((line, i) => {
      if (line.length < 3) return null;
      const w = line.map((v) => v.clone().applyMatrix4(root.matrixWorld));
      let len = 0;
      for (let k = 1; k < w.length; k++) len += w[k].distanceTo(w[k - 1]);
      if (len < 0.18) return null;
      const curve = new THREE.CatmullRomCurve3(w);
      const geo = new THREE.TubeGeometry(curve, 36, 0.012, 6, false);
      const op = Math.min(1, (len - 0.18) / 0.4) * amount;
      return (
        <group key={i}>
          <mesh geometry={geo} renderOrder={8}><meshBasicMaterial color="#9b6bff" transparent opacity={0.55 * op} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
          {w.slice(0, -1).map((v, k) => (k % 3 === 1 ? (
            <mesh key={k} position={v} renderOrder={9}><sphereGeometry args={[0.008 + 0.006 * (k / w.length), 6, 4]} />
              <meshBasicMaterial color="#9ff6ff" transparent opacity={0.7 * op * (k / w.length)} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
          ) : null))}
        </group>
      );
    })}
  </>);
};

/** World points of her body at the current pose (for guards: face / figure / hero boxes from bones, not sprites). */
/** She stands / sits / lies on what is REALLY under her (toki 2026-10-24: "fällt aus dem Himmel, clippt überall rein";
 *  the scene probe measured her feet up to 0.55 m above and 0.39 m inside the surface): the key's floor height was a
 *  hand guess. A ray under her lowest foot finds the surface; she moves by the difference, so the foot keeps the height
 *  above its support that the pose / clip gives it. A jump, a fall, a flight or a float keeps the key's height. */
// climbing is held up by the wall, not the floor: the way goes up (rootAt) instead of being pulled back to the ground
const AIRBORNE = /fall|fly|jump|float|glide|paddl|swim|climb|ladder|ledge/;
function groundOnSupport(rig: Rig, k: VrmKey, scene: THREE.Object3D) {
  if (k.ground === false || AIRBORNE.test(k.motion ?? '') || AIRBORNE.test(k.pose) || k.act === 'hop' || k.act === 'float') return;
  // seated, her chair carries her - her feet tuck under the seat and a ray from above them meets the SEAT (probe run 2)
  if (/^(sit|slump)/.test(k.pose)) return;
  rig.root.updateMatrixWorld(true);
  let low: THREE.Vector3 | null = null;
  for (const b of FEET) {
    const node = rig.vrm.humanoid.getRawBoneNode(b);
    if (!node) continue;
    const p = node.getWorldPosition(new THREE.Vector3());
    if (!low || p.y < low.y) low = p;
  }
  if (!low) return;
  const floor = rig.root.position.y;                       // the key's floor (her feet's pose height sits above it)
  const sup = supportBelow(scene, low.x, low.z, low.y + 0.35, [rig.root], 2.5);   // a step above her foot, not a seat
  if (sup === null) return;
  const d = sup - floor;
  if (Math.abs(d) > 0.004 && Math.abs(d) < 0.7) { rig.root.position.y += d; rig.root.updateMatrixWorld(true); }
}

/** Her limbs never stand inside furniture or a prop (probe run 3: hands and feet in the dream's rocks and cushions while
 *  she flies / falls / kicks, legs in the boss's hand): every bone inside a solid's box pushes her the shortest way out
 *  sideways (x / z, at most 0.4 m). Seated she stays - her chair and desk are meant to be close. */
const CLEAR_BONES: VRMHumanBoneName[] = ['head', 'chest', 'hips', 'leftHand', 'rightHand', 'leftLowerArm', 'rightLowerArm',
  'leftLowerLeg', 'rightLowerLeg', 'leftFoot', 'rightFoot'];
function clearSolids(rig: Rig, k: VrmKey, scene: THREE.Object3D) {
  if (k.ground === false || /^(sit|slump)/.test(k.pose)) return;
  rig.root.updateMatrixWorld(true);
  const hips = rig.vrm.humanoid.getRawBoneNode('hips')?.getWorldPosition(new THREE.Vector3());
  if (!hips) return;
  const boxes = solidBoxes(scene, hips, 1.6, [rig.root]);
  if (!boxes.length) return;
  const push = new THREE.Vector3();
  for (let pass = 0; pass < 2; pass++) {
    const step = new THREE.Vector3();
    for (const b of CLEAR_BONES) {
      const node = rig.vrm.humanoid.getRawBoneNode(b);
      if (!node) continue;
      const p = node.getWorldPosition(new THREE.Vector3());
      for (const box of boxes) {
        if (!box.containsPoint(p) || p.y > box.max.y - 0.02) continue;   // standing ON a box is fine
        const dx1 = p.x - box.min.x, dx2 = box.max.x - p.x, dz1 = p.z - box.min.z, dz2 = box.max.z - p.z;
        const m = Math.min(dx1, dx2, dz1, dz2) + 0.02;
        const v = m === dx1 + 0.02 ? new THREE.Vector3(-m, 0, 0) : m === dx2 + 0.02 ? new THREE.Vector3(m, 0, 0)
          : m === dz1 + 0.02 ? new THREE.Vector3(0, 0, -m) : new THREE.Vector3(0, 0, m);
        if (v.length() > step.length()) step.copy(v);
      }
    }
    if (step.lengthSq() === 0) break;
    push.add(step);
    if (push.length() > 0.4) push.setLength(0.4);
    rig.root.position.add(step);
    rig.root.updateMatrixWorld(true);
    if (push.length() >= 0.4) break;
  }
}

/** Her placement root and the world position of her bones (the scene probe - film/Probe.tsx). */
export function vrmBones(url: string): {root: THREE.Object3D; bones: Record<string, THREE.Vector3>} | null {
  const rig = rigs.get(url);
  if (!rig) return null;
  const bones: Record<string, THREE.Vector3> = {};
  for (const b of ['head', 'chest', 'hips', 'leftHand', 'rightHand', 'leftLowerArm', 'rightLowerArm', 'leftUpperLeg', 'rightUpperLeg',
    'leftLowerLeg', 'rightLowerLeg', 'leftFoot', 'rightFoot'] as VRMHumanBoneName[]) {
    const n = rig.vrm.humanoid.getRawBoneNode(b);
    if (n) bones[b] = n.getWorldPosition(new THREE.Vector3());
  }
  return {root: rig.root, bones};
}

/** A loaded clip's length in seconds (studio/root_travel.mjs measures one loop). */
export function vrmClipDuration(url: string, id: string): number | null {
  return rigs.get(url)?.motions.get(id)?.duration ?? null;
}

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
  mouthKeys?: VrmMouthKey[]; lock?: number; camAt?: (g: number) => V3; shadow?: string; glow?: string; glowGain?: number; materialStyle?: string;
  step?: number; outline?: number; outlineColor?: string; keyLight?: number; trails?: number; lampLight?: number;
  rimColor?: string; rimGain?: number;   // the set's colour reaches her as a rim (Love is War look-designer boards3)
  battery?: {n: number; prev: number; t: number; color?: string; boost?: number} | null}> = ({url, keys, mouthKeys = [], f: frame, fps, from = 0, camPos, camAt, lock = 0.6,
  shadow = '#1d0b38', glow, glowGain = 1, materialStyle = 'none', step = 1, outline = 0, outlineColor = '#1a1030', battery = null, keyLight = 0, trails = 0, lampLight = 0, rimColor = '#b9c8ff', rimGain = 1}) => {
  const scene = useThree((s) => s.scene);
  const f = step > 1 ? frame - ((((frame - from) % step) + step) % step) : frame;
  if (!keys.length || f < keys[0].f) return null;
  const rig = rigs.get(url);
  if (!rig) { cancelRender(new Error(`VRM not preloaded: ${url}`)); throw new Error('unreachable'); }
  styleMaterials(rig, materialStyle);
  ensureOutline(rig, outline, outlineColor);
  // bioluminescent trails (K/DA FIRESTARTER study -> her world): where her hands / feet were over the last frames, in
  // her own space - posed BEFORE the current frame, which poseVrm then sets up from scratch
  const trail = trails > 0 ? trailPoints(rig, keys, f, fps, camPos) : null;
  const posed = poseVrm(url, keys, f, fps, Math.max(from, keys[0].f), camPos, lock, mouthKeys, camAt);
  groundOnSupport(posed, keys[keyAt(keys, f)], scene);
  clearSolids(posed, keys[keyAt(keys, f)], scene);
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
      <group userData={{noSupport: true}}>{dots}{worn}</group>
      {trail ? <group userData={{noSupport: true}}><Trails pts={trail} root={posed.root} amount={trails} /></group> : null}
      {/* her own ultraviolet from below (she IS the light, 灯闇) and the warm lamp as the one complementary rim from behind
          (K/DA FIRESTARTER study: never a flat front fill) */}
      {chest && lampLight > 0 ? (() => {
        const fwd = new THREE.Vector3(camPos[0] - p.x, 0, camPos[2] - p.z).normalize();
        const side = new THREE.Vector3(fwd.z, 0, -fwd.x);
        return (<>
          <pointLight position={[chest.x + fwd.x * 0.45, Math.max(chest.y - 0.55, p.y + 0.35), chest.z + fwd.z * 0.45]} color="#8f6bff" intensity={2.4 * lampLight} distance={2.4} decay={1.6} />
          <pointLight position={[chest.x - fwd.x * 0.8 + side.x * 0.9, chest.y + 0.7, chest.z - fwd.z * 0.8 + side.z * 0.9]} color="#ffb36b" intensity={3.0 * lampLight} distance={2.8} decay={1.5} />
        </>);
      })() : null}
      {/* her contact shadow is NEVER ground: the support ray found it 3.5 cm above her floor, set her on it, the shadow
          rose with her - she climbed 3.5 cm a frame and fell back at every pose change (probe 2026-10-25; toki: "raymi
          bounced die ganze zeit ... als würde sie jedes mal von oben auf ihre position fallen") */}
      <mesh position={[p.x, p.y + 0.035, p.z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2} userData={{noSupport: true}}>
        <planeGeometry args={[w * 1.6, w * 0.9]} />
        <meshBasicMaterial map={blobTexture(shadow)} transparent depthWrite={false} opacity={0.95} toneMapped={false} />
      </mesh>
      <primitive object={posed.root} />
      {/* her own key from the lens side, short reach (a depth set dims the room - she stays lit, the room falls off) */}
      {chest && keyLight > 0 ? (() => {
        const fwd = new THREE.Vector3(camPos[0] - p.x, 0, camPos[2] - p.z).normalize();
        // a 45-degree key from above the lens side, not flat from the front (toki 2026-10-27 "plastik"; look-critic: her face
        // lit flat and frontal, a different logic than the set) - the toon terminator shapes her face and body
        const side = new THREE.Vector3(fwd.z, 0, -fwd.x).multiplyScalar(1.15);
        return <pointLight position={[chest.x + fwd.x * 0.9 + side.x, chest.y + 0.9, chest.z + fwd.z * 0.9 + side.z]} color="#f3f0ff"
          intensity={2.6 * keyLight} distance={3.4} decay={1.7} />;   // look-critic stills 3: her own light drowned the set's - she looked pasted on
      })() : null}
      {/* a cool rim light behind her, toward the lens: her silhouette separates from any background (look-critic) */}
      {chest ? (() => {
        const back = new THREE.Vector3(p.x - camPos[0], 0, p.z - camPos[2]).normalize().multiplyScalar(0.9);
        return <pointLight position={[chest.x + back.x, chest.y + 0.45, chest.z + back.z]} color={rimColor} intensity={1.5 * rimGain} distance={2.2} decay={1.6} />;
      })() : null}
      {glow && chest && glowGain > 0.01 ? (    // 灯闇: she is the lamp in the dark (like Puppet3D)
        // never closer than 0.6 m above her floor: lying / kneeling, the light at her chest burnt a white hot spot
        // into the floor under her (the white blob, clips_seen 2026-10-25)
        <pointLight position={[chest.x, Math.max(chest.y, p.y + 0.6), chest.z + 0.25]} color={glow} intensity={7 * pulse} distance={5} decay={1.4} />
      ) : null}
    </group>
  );
};
