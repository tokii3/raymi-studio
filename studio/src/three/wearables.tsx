// Things on her body (POV Shorts 2026-10-23): chopsticks with a salmon slice in her hand, the salmon costume (a hood
// she looks out of, fins on her forearms, a tail on her hips). A video names them on an actor key:
//   "props": [{"item": "chopsticks_slice", "at": "hand_r", "off": [0, 0, 0], "rot": [0, 0, 0], "scale": 1}]
// Each item is built in its own frame: x = along the bone (hand: toward the fingers, forearm: toward the wrist,
// head / hips: her facing), y = up out of the bone (hand: the thumb side, head: up), z = x cross y. The frame comes
// from her posed bones (positions only), so it is the same for every VRM whatever its raw bone axes are.
// Sizes are world metres for a 1.55 m Raymi (scaled with her height).
import React from 'react';
import * as THREE from 'three';
import type {VRM, VRMHumanBoneName} from '@pixiv/three-vrm';
import {toon} from './look';
import type {WornProp} from './vrmPoses';

export const WEARABLES = ['chopsticks', 'chopsticks_slice', 'salmon_hood', 'salmon_fin', 'salmon_tail'] as const;

const SALMON = '#ff8f6b', SALMON_DARK = '#e86d52', SALMON_BELLY = '#ffc3a8', INK = '#140b24';

const v = () => new THREE.Vector3();
const pos = (vrm: VRM, b: VRMHumanBoneName) => vrm.humanoid.getRawBoneNode(b)?.getWorldPosition(v()) ?? null;

/** The item frame of a bone: origin + rotation (x along, y up, z side) from her posed joints. */
export function boneFrame(vrm: VRM, at: WornProp['at'], facing: THREE.Vector3): {o: THREE.Vector3; q: THREE.Quaternion} | null {
  const side = at.endsWith('_l') ? 'left' : 'right';
  let o: THREE.Vector3 | null, x: THREE.Vector3, up: THREE.Vector3;
  if (at === 'hand_r' || at === 'hand_l') {
    const hand = pos(vrm, `${side}Hand` as VRMHumanBoneName);
    const mid = pos(vrm, `${side}MiddleProximal` as VRMHumanBoneName);
    const thumb = pos(vrm, `${side}ThumbProximal` as VRMHumanBoneName) ?? pos(vrm, `${side}ThumbMetacarpal` as VRMHumanBoneName);
    if (!hand || !mid) return null;
    o = hand.clone().lerp(mid, 0.6);
    x = mid.clone().sub(hand).normalize();
    up = thumb ? thumb.clone().sub(hand) : new THREE.Vector3(0, 1, 0);
  } else if (at === 'forearm_r' || at === 'forearm_l') {
    const el = pos(vrm, `${side}LowerArm` as VRMHumanBoneName), wr = pos(vrm, `${side}Hand` as VRMHumanBoneName);
    if (!el || !wr) return null;
    o = el.clone().lerp(wr, 0.5);
    x = wr.clone().sub(el).normalize();
    up = new THREE.Vector3(0, 1, 0);
  } else if (at === 'head') {
    const head = pos(vrm, 'head'), neck = pos(vrm, 'neck');
    if (!head || !neck) return null;
    up = head.clone().sub(neck).normalize();
    o = head;
    x = facing.clone();
  } else {
    o = pos(vrm, 'hips');
    if (!o) return null;
    x = facing.clone();
    up = new THREE.Vector3(0, 1, 0);
  }
  // orthonormal: y = up minus its part along x
  const y = up.sub(x.clone().multiplyScalar(up.dot(x)));
  if (y.lengthSq() < 1e-6) y.set(0, 1, 0);
  y.normalize();
  const z = new THREE.Vector3().crossVectors(x, y).normalize();
  const m = new THREE.Matrix4().makeBasis(x, y, z);
  return {o, q: new THREE.Quaternion().setFromRotationMatrix(m)};
}

const Chopsticks: React.FC<{slice: boolean}> = ({slice}) => (
  <group>
    {[-0.006, 0.006].map((dz, i) => (
      <mesh key={i} position={[0.07, 0.012, dz]} rotation={[0, 0, Math.PI / 2 - 0.04 * i]} material={toon('#5b3f8a')} castShadow>
        <cylinderGeometry args={[0.0028, 0.0042, 0.23, 6]} />
      </mesh>
    ))}
    {slice ? (
      <group position={[0.18, 0.012, 0]}>
        {/* a thick orange salmon slice with white fat lines, read big at phone size */}
        <mesh material={toon('#ff7a3d')} scale={[1, 0.38, 0.62]} castShadow><boxGeometry args={[0.07, 0.04, 0.05]} /></mesh>
        {[-0.02, 0, 0.02].map((dx, i) => (
          <mesh key={i} position={[dx, 0.0077, 0]} rotation={[0, 0.5, 0]} material={toon('#fff1e6')}><boxGeometry args={[0.004, 0.002, 0.034]} /></mesh>
        ))}
      </group>
    ) : null}
  </group>
);

/** The salmon hood: a big salmon head she wears, her face in its open mouth (x = her facing). */
const SalmonHood: React.FC = () => (
  <group position={[-0.02, 0.06, 0]}>
    {/* the head shell behind and over her head */}
    <mesh material={toon(SALMON, '#000', 1, {side: THREE.DoubleSide})} scale={[1.05, 0.95, 1.0]} castShadow>
      <sphereGeometry args={[0.17, 24, 16, Math.PI * 0.35, Math.PI * 1.3]} />
    </mesh>
    {/* the open mouth rim around her face (upper + lower lip) */}
    <mesh position={[0.1, 0.0, 0]} rotation={[0, Math.PI / 2, 0]} material={toon(SALMON_DARK)}><torusGeometry args={[0.15, 0.025, 8, 28, Math.PI * 1.15]} /></mesh>
    <mesh position={[0.1, -0.11, 0]} rotation={[0, Math.PI / 2, Math.PI]} material={toon(SALMON_BELLY)} scale={[1, 0.45, 1]}><torusGeometry args={[0.13, 0.03, 8, 20, Math.PI * 0.9]} /></mesh>
    {/* big round eyes on top, the dorsal fin */}
    {[-1, 1].map((s) => (
      <group key={s} position={[0.06, 0.15, s * 0.09]}>
        <mesh material={toon('#ffffff')}><sphereGeometry args={[0.04, 14, 10]} /></mesh>
        <mesh position={[0.03, 0.005, 0]} material={toon(INK)}><sphereGeometry args={[0.02, 10, 8]} /></mesh>
      </group>
    ))}
    <mesh position={[-0.06, 0.2, 0]} rotation={[0, 0, 0.5]} material={toon(SALMON_DARK, '#000', 1, {side: THREE.DoubleSide})} scale={[0.12, 0.09, 1]}>
      <circleGeometry args={[0.5, 3]} />
    </mesh>
  </group>
);

/** A salmon pectoral fin on her forearm (x = toward her wrist). */
const SalmonFin: React.FC = () => (
  <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, -0.3]} material={toon(SALMON_DARK, '#000', 1, {side: THREE.DoubleSide})} scale={[0.2, 0.12, 1]} castShadow>
    <circleGeometry args={[0.5, 3]} />
  </mesh>
);

/** The costume's tail fin on her hips, behind her (x = her facing, so -x is her back). */
const SalmonTail: React.FC = () => (
  <group position={[-0.14, -0.05, 0]}>
    <mesh material={toon(SALMON)} scale={[1, 0.5, 0.35]} castShadow><sphereGeometry args={[0.1, 12, 8]} /></mesh>
    <mesh position={[-0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={toon(SALMON_DARK)} scale={[1, 1, 0.25]}><coneGeometry args={[0.1, 0.14, 3]} /></mesh>
  </group>
);

function item(name: string): React.ReactNode {
  switch (name) {
    case 'chopsticks': return <Chopsticks slice={false} />;
    case 'chopsticks_slice': return <Chopsticks slice />;
    case 'salmon_hood': return <SalmonHood />;
    case 'salmon_fin': return <SalmonFin />;
    case 'salmon_tail': return <SalmonTail />;
    default: return null;
  }
}

/** Every prop of the current key on her posed bones. `scale` = her height / 1.55. */
export function wornProps(vrm: VRM, list: WornProp[] | undefined, facing: THREE.Vector3, scale: number): React.ReactNode {
  if (!list?.length) return null;
  return list.map((w, i) => {
    const fr = boneFrame(vrm, w.at, facing);
    if (!fr) return null;
    const off = new THREE.Vector3(...(w.off ?? [0, 0, 0])).applyQuaternion(fr.q).multiplyScalar(scale);
    const extra = new THREE.Quaternion().setFromEuler(new THREE.Euler(...(w.rot ?? [0, 0, 0])));
    const q = fr.q.clone().multiply(extra);
    return (
      <group key={`${w.item}${i}`} position={[fr.o.x + off.x, fr.o.y + off.y, fr.o.z + off.z]} quaternion={q} scale={(w.scale ?? 1) * scale}>
        {item(w.item)}
      </group>
    );
  });
}
