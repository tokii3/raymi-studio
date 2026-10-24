// The scene probe (toki 2026-10-24: "hör auf alles punktuell zu fixen, das sind Strukturfehler"): measured in the REAL
// scene graph of a frame - not in hand-written boxes - so a whole film can be screened for the fault classes she saw:
// her limbs inside furniture, things inside things (the phone in the cushion), her feet off the support under her
// (floating / sinking / "falls from the sky"). Only on with props.probe (studio/probe.mjs, cloud); it logs one JSON line
// per frame ("PROBE {...}") and draws nothing.
//
// v2 (toki 2026-10-24, after Beach run 58: "der Code zeigt keine Fehler, aber visuell sieht man sie"): v1 tested 13 bone
// POINTS against world-axis BOXES every 15th frame - a hand's fingers in a table, a rotated prop, her skirt, her hair and
// every lyric were invisible to it. v2 tests her real skinned SURFACE (sampled vertices) against each solid's own
// oriented box, confirmed against the mesh itself (ray parity) where the mesh is not a box; and adds what she sees but
// the code did not: her arms / hair through her own body, legs through each other, lyrics in her or in a prop, the lens
// inside a solid or cutting her, every bone for the motion classes (jerk, foot slide, drop), and a screen point per
// fault so the eye level can zoom straight onto it (raymi/probe.py, raymi/qcv2.py).
import React, {useLayoutEffect} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {vrmBones} from '../three/VrmPuppet';
import {solid} from '../three/support';

const BONES = ['head', 'chest', 'hips', 'leftHand', 'rightHand', 'leftLowerArm', 'rightLowerArm', 'leftUpperLeg', 'rightUpperLeg',
  'leftLowerLeg', 'rightLowerLeg', 'leftFoot', 'rightFoot'] as const;
type Bone = typeof BONES[number];
const SHELL = 2.5;        // m: a box this big in two axes is a room shell (floor, wall, dome, sky) - a support, never a
                          // collider (run 1: the bedroom dome counted as furniture, 'inside' 1.5 m deep)
const SKIN = 0.015;       // m: a point this deep inside a solid counts (thin contact is fine)
const VERTS = 1600;       // sampled points of her surface per frame (all her skinned meshes together)
const PARITY = 160;       // at most this many points per non-box solid get the mesh-parity test per frame
const ARM: Bone[] = ['leftHand', 'rightHand', 'leftLowerArm', 'rightLowerArm'];

function label(o: THREE.Object3D): string {
  for (let p: THREE.Object3D | null = o; p; p = p.parent) {
    if (p.userData?.thing) return `thing:${p.userData.thing}`;
    if (p.userData?.label) return String(p.userData.label);
    if (p.name) return p.name;
  }
  // v1 printed "Mesh" for most furniture - unfixable without a name: say what and where it is
  const m = o as THREE.Mesh;
  const b = new THREE.Box3().setFromObject(o);
  const s = b.getSize(new THREE.Vector3());
  const c = b.getCenter(new THREE.Vector3());
  const g = m.geometry?.type?.replace('Geometry', '') ?? o.type;
  return `${g} ${s.x.toFixed(2)}x${s.y.toFixed(2)}x${s.z.toFixed(2)} @${c.x.toFixed(1)},${c.y.toFixed(1)},${c.z.toFixed(1)}`;
}

function under(o: THREE.Object3D, root: THREE.Object3D | null): boolean {
  for (let p: THREE.Object3D | null = o; p; p = p.parent) if (p === root) return true;
  return false;
}

function staged(o: THREE.Object3D): boolean {
  for (let p: THREE.Object3D | null = o; p; p = p.parent) if (p.userData?.stage) return true;
  return false;
}

function tagged(o: THREE.Object3D, key: string): string | null {
  for (let p: THREE.Object3D | null = o; p; p = p.parent) if (p.userData?.qc) return p.userData.qc === key ? key : null;
  return null;
}

/** A solid as its own oriented box (local bounding box + inverse world matrix), with a ray-parity test on the real mesh
 *  for shapes that are not boxes (a chair's open back, a round cushion, a rock). */
type Solid = {mesh: THREE.Mesh; name: string; thing: boolean; world: THREE.Box3; local: THREE.Box3; inv: THREE.Matrix4; boxy: boolean};

function makeSolid(m: THREE.Mesh): Solid | null {
  const g = m.geometry as THREE.BufferGeometry | undefined;
  if (!g?.attributes?.position) return null;
  if (!g.boundingBox) g.computeBoundingBox();
  const local = g.boundingBox!.clone();
  const world = new THREE.Box3().setFromObject(m);
  if (world.isEmpty() || local.isEmpty()) return null;
  const n = g.attributes.position.count;
  return {mesh: m, name: label(m), thing: label(m).startsWith('thing:'), world, local, inv: m.matrixWorld.clone().invert(),
    boxy: g.type === 'BoxGeometry' || n <= 24};
}

const _p = new THREE.Vector3();
const _r = new THREE.Raycaster();
const UPDIR = new THREE.Vector3(0, 1, 0);

/** How deep a world point is inside a solid (m), 0 when outside. */
function depthIn(s: Solid, w: THREE.Vector3): number {
  if (!s.world.containsPoint(w)) return 0;
  _p.copy(w).applyMatrix4(s.inv);
  const b = s.local;
  if (!b.containsPoint(_p)) return 0;
  const sc = new THREE.Vector3().setFromMatrixScale(s.mesh.matrixWorld);
  const d = Math.min((_p.x - b.min.x) * sc.x, (b.max.x - _p.x) * sc.x, (_p.y - b.min.y) * sc.y, (b.max.y - _p.y) * sc.y,
    (_p.z - b.min.z) * sc.z, (b.max.z - _p.z) * sc.z);
  if (d <= SKIN || s.boxy) return d;
  // not a box: inside only if a ray from the point crosses the real surface an odd number of times
  const mat = s.mesh.material as THREE.Material | THREE.Material[];
  const mats = Array.isArray(mat) ? mat : [mat];
  const sides = mats.map((x) => x.side);
  mats.forEach((x) => { x.side = THREE.DoubleSide; });
  _r.set(w, UPDIR);
  _r.far = 50;
  const hits = _r.intersectObject(s.mesh, false).length;
  mats.forEach((x, i) => { x.side = sides[i]; });
  return hits % 2 === 1 ? d : 0;
}

/** Distance from p to the segment a-b and where along it (0..1). */
function segDist(p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3): [number, number] {
  const ab = b.clone().sub(a);
  const t = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / Math.max(1e-9, ab.lengthSq())));
  return [p.distanceTo(a.clone().addScaledVector(ab, t)), t];
}

function segSeg(a0: THREE.Vector3, a1: THREE.Vector3, b0: THREE.Vector3, b1: THREE.Vector3): number {
  let best = Infinity;
  for (let i = 0; i <= 8; i++) {
    const p = a0.clone().lerp(a1, i / 8);
    best = Math.min(best, segDist(p, b0, b1)[0]);
  }
  return best;
}

type Fault = {cls: string; what: string; depth: number; at: [number, number] | null; n?: number};

export const Probe: React.FC<{f: number; F?: number; vrm: string | null; shot: string}> = ({f, F, vrm, shot}) => {
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    scene.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    const screen = (w: THREE.Vector3): [number, number] | null => {
      const v = w.clone().project(camera);
      if (v.z < -1 || v.z > 1) return null;
      return [+((v.x + 1) / 2).toFixed(3), +((1 - v.y) / 2).toFixed(3)];
    };
    const faults: Fault[] = [];
    // her rig stays cached between shots: measure her only when she is in THIS frame's scene (probe run 2: shot 60)
    const rigged = vrm ? vrmBones(vrm) : null;
    const her = rigged && under(rigged.root, scene) ? rigged : null;
    const herRoot = her?.root ?? null;
    const solids: Solid[] = [];
    const supports: THREE.Mesh[] = [];
    const texts: THREE.Mesh[] = [];
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.visible && tagged(m, 'text')) { texts.push(m); return; }
      // a staging piece (three/staging.tsx) carries nobody, but her body must never pass through it either
      if (m.isMesh && m.visible && staged(m) && !under(m, herRoot)) { const st = makeSolid(m); if (st) solids.push(st); return; }
      // the same idea of 'solid' as the fix (support.ts): no glows, lyrics, rays, held or hanging things
      if (!solid(m) || under(m, herRoot)) return;
      const box = new THREE.Box3().setFromObject(m);
      if (box.isEmpty()) return;
      const s = box.getSize(new THREE.Vector3());
      supports.push(m);
      if ([s.x, s.y, s.z].filter((v) => v > SHELL).length >= 2) return;
      if (Math.min(s.x, s.y, s.z) < 0.004) return;                                   // decals, printed text planes
      const sol = makeSolid(m);
      if (sol) solids.push(sol);
    });
    const ray = new THREE.Raycaster();
    const supportBelow = (p: THREE.Vector3, skip?: THREE.Object3D) => {
      ray.set(new THREE.Vector3(p.x, p.y + 0.35, p.z), new THREE.Vector3(0, -1, 0));
      ray.far = 30;
      const hit = ray.intersectObjects(supports, false).find((h) => !skip || !under(h.object, skip));
      return hit ? hit.point.y : null;
    };
    const out: Record<string, unknown> = {f, F: F ?? f, shot};
    if (her) {
      const B = her.bones;
      // ---- her surface: sampled skinned vertices, each with its part (hair / face / body) and nearest bone
      const pts: {w: THREE.Vector3; part: string; bone: Bone}[] = [];
      const skins: THREE.SkinnedMesh[] = [];
      herRoot!.traverse((o) => { const sm = o as THREE.SkinnedMesh; if (sm.isSkinnedMesh && sm.visible) skins.push(sm); });
      const total = skins.reduce((a, m) => a + m.geometry.attributes.position.count, 0);
      const stride = Math.max(1, Math.floor(total / VERTS));
      for (const m of skins) {
        const nm = (m.name + ' ' + (m.parent?.name ?? '')).toLowerCase();
        const part = nm.includes('hair') ? 'hair' : nm.includes('face') ? 'face' : 'body';
        const n = m.geometry.attributes.position.count;
        for (let i = 0; i < n; i += stride) {
          const w = m.getVertexPosition(i, new THREE.Vector3()).applyMatrix4(m.matrixWorld);
          let bone: Bone = 'hips';
          let bd = Infinity;
          for (const b of BONES) { const q = B[b]; if (q) { const d = q.distanceToSquared(w); if (d < bd) { bd = d; bone = b; } } }
          pts.push({w, part, bone});
        }
      }
      // ---- her surface inside furniture / props
      const near = solids.filter((s) => pts.some((p) => s.world.distanceToPoint(p.w) < 0.02));
      const inside: {bone: string; part: string; in: string; depth: number; n: number; at: [number, number] | null}[] = [];
      for (const s of near) {
        const per = new Map<string, {depth: number; n: number; w: THREE.Vector3}>();
        // the mesh-parity ray is the costly part (10k-triangle rocks x 1600 points - suspected in the qc run 1 frame timeout):
        // test at most PARITY points per solid, spread over her surface
        const cand = s.boxy ? pts : pts.filter((p) => s.world.containsPoint(p.w));
        const step = s.boxy ? 1 : Math.max(1, Math.ceil(cand.length / PARITY));
        for (let i = 0; i < cand.length; i += step) {
          const p = cand[i];
          const d = depthIn(s, p.w);
          if (d <= SKIN) continue;
          const k = `${p.part}|${p.bone}`;
          const e = per.get(k) ?? {depth: 0, n: 0, w: p.w};
          e.n++;
          if (d > e.depth) { e.depth = d; e.w = p.w; }
          per.set(k, e);
        }
        for (const [k, e] of per) {
          const [part, bone] = k.split('|');
          inside.push({bone, part, in: s.name, depth: +e.depth.toFixed(3), n: e.n, at: screen(e.w)});
        }
      }
      // ---- her own body: forearms / hands / hair through her torso, legs through each other
      if (B.hips && B.chest) {
        const top = B.head ? B.chest.clone().lerp(B.head, 0.35) : B.chest;
        const torsoD = pts.filter((p) => p.part === 'body' && (p.bone === 'chest' || p.bone === 'hips'))
          .map((p) => segDist(p.w, B.hips!, top)).filter(([, t]) => t > 0.1 && t < 0.9).map(([d]) => d).sort((a, b) => a - b);
        const R = torsoD.length > 20 ? torsoD[Math.floor(torsoD.length * 0.85)] : 0.1;   // her torso radius this frame
        const self = new Map<string, {depth: number; n: number; w: THREE.Vector3}>();
        for (const p of pts) {
          const arm = p.part === 'body' && ARM.includes(p.bone);
          const hair = p.part === 'hair';
          if (!arm && !hair) continue;
          const [d, t] = segDist(p.w, B.hips, top);
          if (t <= 0.05 || t >= 0.95) continue;
          const lim = R * (hair ? 0.7 : 0.75);
          if (d >= lim) continue;
          const k = hair ? 'hair_in|hair' : `self_in|${p.bone}`;
          const e = self.get(k) ?? {depth: 0, n: 0, w: p.w};
          e.n++;
          if (lim - d > e.depth) { e.depth = lim - d; e.w = p.w; }
          self.set(k, e);
        }
        for (const [k, e] of self) {
          const [cls, what] = k.split('|');
          if (e.n >= 3) faults.push({cls, what: `${what} in her torso`, depth: +e.depth.toFixed(3), n: e.n, at: screen(e.w)});
        }
        if (B.leftUpperLeg && B.leftLowerLeg && B.rightUpperLeg && B.rightLowerLeg && B.leftFoot && B.rightFoot) {
          const shin = segSeg(B.leftLowerLeg, B.leftFoot, B.rightLowerLeg, B.rightFoot);
          const thigh = segSeg(B.leftUpperLeg, B.leftLowerLeg, B.rightUpperLeg, B.rightLowerLeg);
          const d = Math.min(shin, thigh);
          if (d < 0.06) faults.push({cls: 'leg_cross', what: shin < thigh ? 'shins through each other' : 'thighs through each other',
            depth: +(0.06 - d).toFixed(3), at: screen(B.leftLowerLeg.clone().lerp(B.rightLowerLeg, 0.5))});
        }
      }
      // ---- lyrics in her
      for (const t of texts) {
        const s = makeSolid(t);
        if (!s) continue;
        // a word is a flat textured plane: give it 2 cm of thickness, keep the inner 80 % (the texture's margins are empty)
        const c = s.local.getCenter(new THREE.Vector3());
        const half = s.local.getSize(new THREE.Vector3()).multiplyScalar(0.4);
        half.set(Math.max(half.x, 0.01), Math.max(half.y, 0.01), Math.max(half.z, 0.01));
        s.local = new THREE.Box3(c.clone().sub(half), c.clone().add(half));
        s.boxy = true;
        const hit = pts.filter((p) => depthIn(s, p.w) > 0);
        if (hit.length >= 3) faults.push({cls: 'text_in', what: `${hit.some((p) => p.part === 'face') ? 'face' : 'her'} through a lyric`,
          depth: hit.length, n: hit.length, at: screen(hit[0].w)});
      }
      // ---- the lens: inside her, or so close that the near plane cuts her open
      const cam = camera.position;
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      let cut = 0;
      let cutAt: THREE.Vector3 | null = null;
      for (const p of pts) {
        const z = p.w.clone().sub(cam).dot(camDir);
        if (z > 0 && z < camera.near * 1.5 + 0.03) {
          const v = p.w.clone().project(camera);
          if (Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1) { cut++; cutAt = p.w; }
        }
      }
      if (cut >= 3) faults.push({cls: 'near_cut', what: 'the lens cuts into her', depth: cut, n: cut, at: cutAt ? screen(cutAt) : null});
      // ---- motion: every bone, both feet with their own support (jerk / slide / drop are measured in python)
      const r3 = (v?: THREE.Vector3) => v ? v.toArray().map((x) => +x.toFixed(3)) : null;
      const sup = (v?: THREE.Vector3) => { if (!v) return null; const y = supportBelow(v); return y === null ? null : +y.toFixed(3); };
      const feet = [B.leftFoot, B.rightFoot].filter(Boolean) as THREE.Vector3[];
      const low = feet.length ? feet.reduce((a, b) => (a.y < b.y ? a : b)) : null;
      const lowSup = low ? supportBelow(low) : null;
      const headTop = B.head ? B.head.clone().add(new THREE.Vector3(0, 0.13, 0)) : null;
      out.her = {hips: r3(B.hips), foot: low ? +low.y.toFixed(3) : null, support: lowSup === null ? null : +lowSup.toFixed(3),
        inside, bones: Object.fromEntries(BONES.map((b) => [b, r3(B[b])])), footSup: {l: sup(B.leftFoot), r: sup(B.rightFoot)},
        scr: {head: B.head ? screen(B.head) : null, top: headTop ? screen(headTop) : null, hips: B.hips ? screen(B.hips) : null,
          lf: B.leftFoot ? screen(B.leftFoot) : null, rf: B.rightFoot ? screen(B.rightFoot) : null}};
    }
    // ---- lyrics inside a prop (toki x10: "clippen in Assets"): points of each word's plane inside a solid
    for (const t of texts) {
      const s = makeSolid(t);
      if (!s) continue;
      const c = s.local.getCenter(new THREE.Vector3());
      const h = s.local.getSize(new THREE.Vector3()).multiplyScalar(0.4);
      let n = 0;
      let at: THREE.Vector3 | null = null;
      let into = '';
      for (const dx of [-1, 0, 1]) for (const dy of [-1, 0, 1]) {
        const w = new THREE.Vector3(c.x + dx * h.x, c.y + dy * h.y, c.z).applyMatrix4(t.matrixWorld);
        for (const sol of solids) if (depthIn(sol, w) > SKIN) { n++; at = w; into = sol.name; break; }
      }
      if (n >= 2) faults.push({cls: 'text_in', what: `a lyric in ${into}`, depth: n, n, at: at ? screen(at) : null});
    }
    // ---- the lens inside a solid (a wall, a prop): the picture shows its inside or a black face
    for (const sol of solids) {
      if (depthIn(sol, camera.position) > 0.005) { faults.push({cls: 'lens_in', what: `lens inside ${sol.name}`, depth: 1, at: null}); break; }
    }
    // things inside things: a thing's box shared with another solid (not with its own parts)
    const things = new Map<THREE.Object3D, THREE.Box3>();
    scene.traverse((o) => { if (o.userData?.thing) things.set(o, new THREE.Box3().setFromObject(o)); });
    const thingFaults: {thing: string; with: string; share: number; gap: number | null; at?: [number, number] | null}[] = [];
    for (const [o, box] of things) {
      if (box.isEmpty()) continue;
      const vol = Math.max(1e-6, box.getSize(new THREE.Vector3()).toArray().reduce((a, b) => a * b, 1));
      const c = box.getCenter(new THREE.Vector3());
      for (const s of solids) {
        if (under(s.mesh, o)) continue;
        const x = box.clone().intersect(s.world);
        if (x.isEmpty()) continue;
        const share = x.getSize(new THREE.Vector3()).toArray().reduce((a, b) => a * b, 1) / vol;
        if (share > 0.15 && depthIn(s, x.getCenter(new THREE.Vector3())) > 0) thingFaults.push({thing: String(o.userData.thing), with: s.name, share: +share.toFixed(2), gap: null, at: screen(c)});
      }
      const sup = supportBelow(new THREE.Vector3(c.x, box.min.y + 0.002, c.z), o);
      if (sup !== null && !o.userData.float && box.min.y - sup > 0.03) thingFaults.push({thing: String(o.userData.thing), with: 'air', share: 0, gap: +(box.min.y - sup).toFixed(3), at: screen(c)});
    }
    out.things = thingFaults;
    out.faults = faults;
    out.cam = camera.position.toArray().map((v) => +v.toFixed(3));
    console.log('PROBE ' + JSON.stringify(out));
  });
  return null;
};
