// The scene probe (toki 2026-10-24: "hör auf alles punktuell zu fixen, das sind Strukturfehler"): measured in the REAL
// scene graph of a frame - not in hand-written boxes - so a whole film can be screened for the fault classes she saw:
// her limbs inside furniture, things inside things (the phone in the cushion), her feet off the support under her
// (floating / sinking / "falls from the sky"). Only on with props.probe (studio/probe.mjs, cloud); it logs one JSON line
// per frame ("PROBE {...}") and draws nothing.
import React, {useLayoutEffect} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {vrmBones} from '../three/VrmPuppet';
import {solid} from '../three/support';

const BONES = ['head', 'chest', 'hips', 'leftHand', 'rightHand', 'leftLowerArm', 'rightLowerArm', 'leftUpperLeg', 'rightUpperLeg',
  'leftLowerLeg', 'rightLowerLeg', 'leftFoot', 'rightFoot'] as const;
const SHELL = 2.5;        // m: a box this big in two axes is a room shell (floor, wall, dome, sky) - a support, never a
                          // collider (run 1: the bedroom dome counted as furniture, 'inside' 1.5 m deep)
const SKIN = 0.015;       // m: a bone this deep inside a box counts (thin contact is fine)

function label(o: THREE.Object3D): string {
  for (let p: THREE.Object3D | null = o; p; p = p.parent) {
    if (p.userData?.thing) return `thing:${p.userData.thing}`;
    if (p.userData?.label) return String(p.userData.label);
    if (p.name) return p.name;
  }
  return o.type;
}

function under(o: THREE.Object3D, root: THREE.Object3D | null): boolean {
  for (let p: THREE.Object3D | null = o; p; p = p.parent) if (p === root) return true;
  return false;
}

export const Probe: React.FC<{f: number; vrm: string | null; shot: string}> = ({f, vrm, shot}) => {
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    scene.updateMatrixWorld(true);
    // her rig stays cached between shots: measure her only when she is in THIS frame's scene (probe run 2: shot 60)
    const rigged = vrm ? vrmBones(vrm) : null;
    const her = rigged && under(rigged.root, scene) ? rigged : null;
    const herRoot = her?.root ?? null;
    const solids: {box: THREE.Box3; name: string; thing: boolean; mesh: THREE.Mesh}[] = [];
    const supports: THREE.Mesh[] = [];
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      // the same idea of 'solid' as the fix (support.ts): no glows, lyrics, rays, held or hanging things
      if (!solid(m) || under(m, herRoot)) return;
      const box = new THREE.Box3().setFromObject(m);
      if (box.isEmpty()) return;
      const s = box.getSize(new THREE.Vector3());
      supports.push(m);
      if ([s.x, s.y, s.z].filter((v) => v > SHELL).length >= 2) return;
      if (Math.min(s.x, s.y, s.z) < 0.004) return;                                   // decals, printed text planes
      solids.push({box, name: label(m), thing: Boolean(label(m).startsWith('thing:')), mesh: m});
    });
    const ray = new THREE.Raycaster();
    const supportBelow = (p: THREE.Vector3, skip?: THREE.Object3D) => {
      ray.set(new THREE.Vector3(p.x, p.y + 0.35, p.z), new THREE.Vector3(0, -1, 0));
      ray.far = 30;
      const hit = ray.intersectObjects(supports, false).find((h) => !skip || !under(h.object, skip));
      return hit ? hit.point.y : null;
    };
    const out: Record<string, unknown> = {f, shot};
    if (her) {
      const inside: {bone: string; in: string; depth: number}[] = [];
      for (const b of BONES) {
        const p = her.bones[b];
        if (!p) continue;
        for (const s of solids) {
          if (!s.box.containsPoint(p)) continue;
          const d = Math.min(p.x - s.box.min.x, s.box.max.x - p.x, p.y - s.box.min.y, s.box.max.y - p.y, p.z - s.box.min.z, s.box.max.z - p.z);
          if (d > SKIN) inside.push({bone: b, in: s.name, depth: +d.toFixed(3)});
        }
      }
      const feet = [her.bones.leftFoot, her.bones.rightFoot].filter(Boolean) as THREE.Vector3[];
      const low = feet.length ? feet.reduce((a, b) => (a.y < b.y ? a : b)) : null;
      const sup = low ? supportBelow(low) : null;
      out.her = {hips: her.bones.hips?.toArray().map((v) => +v.toFixed(3)), foot: low ? +low.y.toFixed(3) : null,
        support: sup === null ? null : +sup.toFixed(3), inside};
    }
    // things inside things: a thing's box shared with another solid (not with its own parts)
    const things = new Map<THREE.Object3D, THREE.Box3>();
    scene.traverse((o) => { if (o.userData?.thing) things.set(o, new THREE.Box3().setFromObject(o)); });
    const thingFaults: {thing: string; with: string; share: number; gap: number | null}[] = [];
    for (const [o, box] of things) {
      if (box.isEmpty()) continue;
      const vol = Math.max(1e-6, box.getSize(new THREE.Vector3()).toArray().reduce((a, b) => a * b, 1));
      for (const s of solids) {
        if (under(s.mesh, o)) continue;
        const x = box.clone().intersect(s.box);
        if (x.isEmpty()) continue;
        const share = x.getSize(new THREE.Vector3()).toArray().reduce((a, b) => a * b, 1) / vol;
        if (share > 0.15) thingFaults.push({thing: String(o.userData.thing), with: s.name, share: +share.toFixed(2), gap: null});
      }
      const c = box.getCenter(new THREE.Vector3());
      const sup = supportBelow(new THREE.Vector3(c.x, box.min.y + 0.002, c.z), o);
      if (sup !== null && !o.userData.float && box.min.y - sup > 0.03) thingFaults.push({thing: String(o.userData.thing), with: 'air', share: 0, gap: +(box.min.y - sup).toFixed(3)});
    }
    out.things = thingFaults;
    console.log('PROBE ' + JSON.stringify(out));
  });
  return null;
};
