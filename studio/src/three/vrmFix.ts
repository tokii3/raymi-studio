// Model fixes applied when her VRM loads - rules on the mesh by material and region, so every video gets them and the
// VRoid source stays untouched (toki 2026-10-25: "die ärmel teile ... sitzen falsch und bewegen sich dadurch auch
// falsch ... du darfst sie gerne anpassen und neu ausrichten").
//
// Sleeve caps (raymi5 / raymi6: material Onepiece_00_CLOTH_01, the frill on each shoulder past the arm joint): VRoid
// weighted them ~63 % to the upper arm and the rest to shoulder / upper chest, so a raised arm sheared them and they
// stayed hanging at the armpit; they also flared up to 10 cm forward of the arm. Now they ride the upper arm (fully
// outside, blended at the joint), sit 30 % closer to the arm's axis and tilt UP like the fin of the 2D design.
import * as THREE from 'three';

type Region = {material: RegExp; minAbsX: number; minY: number};
const CAPS: Region = {material: /Onepiece_00_CLOTH_01/, minAbsX: 0.09, minY: 1.08};
const JOINT_X = 0.092, FULL_X = 0.115;   // the upper arm starts at |x| 0.092 (bind pose); fully on it from 0.115
const ARM_Z = 0.027, PULL = 0.3;         // the arm's axis in z, and how far the flare is pulled toward it
// the 2D design (sprites): the shoulder piece is a ruffle FIN standing up and out, not a cap over the shoulder (VRoid
// could not shape it) - the further out a vertex, the higher it is lifted, so the piece tilts up from its root
const LIFT = 1.5;                        // m of lift per m past the arm joint

function materialName(m: THREE.Material | THREE.Material[]): string {
  return (Array.isArray(m) ? m.map((x) => x.name).join(' ') : m.name) ?? '';
}

/** Re-weight and re-seat the sleeve caps; returns how many vertices changed (0 = the model has none). */
export function fixSleeveCaps(scene: THREE.Object3D): number {
  let changed = 0;
  const done = new Set<number>();
  scene.traverse((o) => {
    const s = o as THREE.SkinnedMesh;
    if (!s.isSkinnedMesh || !CAPS.material.test(materialName(s.material))) return;
    const g = s.geometry;
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const si = g.getAttribute('skinIndex') as THREE.BufferAttribute;
    const sw = g.getAttribute('skinWeight') as THREE.BufferAttribute;
    if (!pos || !si || !sw) return;
    const bone = (n: string) => s.skeleton.bones.findIndex((b) => b.name === n);
    const ua = {L: bone('J_Bip_L_UpperArm'), R: bone('J_Bip_R_UpperArm')};
    const sh = {L: bone('J_Bip_L_Shoulder'), R: bone('J_Bip_R_Shoulder')};
    if (ua.L < 0 || ua.R < 0) return;
    const idx = g.getIndex();
    const verts = new Set<number>();
    const range = g.drawRange, start = range.start, end = Math.min(idx ? idx.count : pos.count, range.start + range.count);
    for (let k = start; k < end; k++) verts.add(idx ? idx.getX(k) : k);
    for (const v of verts) {
      if (done.has(v)) continue;
      const x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v);
      if (Math.abs(x) < CAPS.minAbsX || y < CAPS.minY) continue;
      const side = x < 0 ? 'L' : 'R';                     // glTF bind space: her left arm is at -x
      const t = Math.min(1, Math.max(0, (Math.abs(x) - JOINT_X) / (FULL_X - JOINT_X)));
      const wUA = 0.7 + 0.3 * t, wSH = 1 - wUA;
      si.setXYZW(v, ua[side], sh[side] >= 0 ? sh[side] : ua[side], 0, 0);
      sw.setXYZW(v, wUA, sh[side] >= 0 ? wSH : 0, 0, 0);
      if (sh[side] < 0) sw.setX(v, 1);
      pos.setZ(v, ARM_Z + (z - ARM_Z) * (1 - PULL * t));
      pos.setY(v, y + Math.max(0, Math.abs(x) - JOINT_X) * LIFT);
      done.add(v);
      changed++;
    }
    si.needsUpdate = true; sw.needsUpdate = true; pos.needsUpdate = true;
    g.computeBoundingBox(); g.computeBoundingSphere();
  });
  return changed;
}

// Hair roots (toki 2026-10-25: "haare am ansatz die ersten ca 30% ... dunkler und weniger saturiert ... von off black eher
// matt zu leuchtendem ultraviolett"; the 2D sprites: near-black roots). The texture pass (raymi/texfix.py roots) reaches
// only strands whose UVs use the texture's top - the bangs use its lower half and stayed bright blue (model sheet 3).
// So the shader darkens by HEIGHT on her head in the bind pose: the top 16 cm off-black and matte, blending into the
// painted ultraviolet by 42 cm below the crown - every strand the same, whatever part of the texture it uses.
const ROOT_FULL = 0.16, ROOT_END = 0.42, ROOT_MIX = 0.88;   // sheet 4: 12 / 32 cm read as only the crown

export function hairRoots(scene: THREE.Object3D): number {
  let top = -Infinity;
  const mats = new Set<THREE.Material>();
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !/HAIR/.test(materialName(m.material))) return;
    m.geometry.computeBoundingBox();
    top = Math.max(top, m.geometry.boundingBox!.max.y);
    (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => { if (/HAIR/.test(x.name)) mats.add(x); });
  });
  if (!Number.isFinite(top)) return 0;
  for (const mat of mats) {
    const orig = mat.onBeforeCompile.bind(mat), key = mat.customProgramCacheKey.bind(mat);
    mat.onBeforeCompile = (shader, renderer) => {
      orig(shader, renderer);
      shader.vertexShader = 'varying float vHairY;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vHairY = position.y;');
      shader.fragmentShader = 'varying float vHairY;\n' + shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
  {
    float rootK = smoothstep(${(top - ROOT_END).toFixed(3)}, ${(top - ROOT_FULL).toFixed(3)}, vHairY) * ${ROOT_MIX.toFixed(2)};
    float lum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(lum) * 0.22 + vec3(0.016, 0.012, 0.03), rootK);
  }`);
    };
    mat.customProgramCacheKey = () => `${key()},hairRoots${top.toFixed(3)}`;
    mat.needsUpdate = true;
  }
  return mats.size;
}

/** Every load-time model fix, in order. */
export function fixModel(scene: THREE.Object3D): void {
  fixSleeveCaps(scene);
  hairRoots(scene);
}
