// World transitions (toki 2026-10-24, Watch Me: "das Set neu aufbauen / altes Set löst sich auf, fliegt weg,
// verflüssigt sich etc für Transitions"). Any set can leave or arrive piece by piece around her ONE spot - no set needs
// to know about it: <WorldMotion> moves the set's own top-level pieces. A shot says
//   "world": {"out": "fly" | "dissolve" | "melt", "out_at": <song s>, "out_s": <s>,
//             "in": "assemble" | "rise", "in_at": <song s>, "in_s": <s>}
// (the compiler turns *_at into frames: raymi/timeline.py NESTED_OPTS "world"; *_s stay seconds).
// Rules: the ground she stands on never moves (a room shell lying on the floor stays - Beach: "fällt aus dem Himmel");
// lights stay; every piece moves on its own delay so the change runs out FROM HER (near pieces first); melt sinks the
// pieces into a sheet of her sea water rising at her feet.
import React, {useLayoutEffect, useRef} from 'react';
import * as THREE from 'three';
import {rnd} from './look';

type Phase = {kind: string; at: number; fade?: number};
export type WorldSpec = {out?: Phase; in?: Phase};
export type WorldOpt = {out?: string; out_at?: number; out_s?: number; in?: string; in_at?: number; in_s?: number};

/** shots.json "world" (flat, compiled) -> the two phases. */
export function worldSpec(o: unknown, fps = 30): WorldSpec | undefined {
  if (!o || typeof o !== 'object') return undefined;
  const w = o as WorldOpt;
  return {
    out: w.out && typeof w.out_at === 'number' ? {kind: w.out, at: w.out_at, fade: (w.out_s ?? 0.6) * fps} : undefined,
    in: w.in && typeof w.in_at === 'number' ? {kind: w.in, at: w.in_at, fade: (w.in_s ?? 0.6) * fps} : undefined,
  };
}

const SHELL = 2.5;
const ease = (t: number) => t * t * (3 - 2 * t);

/** 0 = the piece is home, 1 = fully gone (out) / not yet arrived (in). */
function away(spec: WorldSpec | undefined, f: number, delay: number): {v: number; kind: string | null; dir: 'out' | 'in' | null} {
  if (spec?.out && f >= spec.out.at) {
    const d = Math.max(1, spec.out.fade ?? 15);
    return {v: ease(Math.min(1, Math.max(0, (f - spec.out.at - delay * d * 0.6) / (d * 0.4 + 1)))), kind: spec.out.kind, dir: 'out'};
  }
  if (spec?.in) {
    const d = Math.max(1, spec.in.fade ?? 15);
    const t = (f - spec.in.at - delay * d * 0.6) / (d * 0.4 + 1);
    return {v: 1 - ease(Math.min(1, Math.max(0, t))), kind: spec.in.kind, dir: 'in'};
  }
  return {v: 0, kind: null, dir: null};
}

function isGround(o: THREE.Object3D): boolean {
  const b = new THREE.Box3().setFromObject(o);
  if (b.isEmpty()) return false;
  const s = b.getSize(new THREE.Vector3());
  return [s.x, s.z].every((v) => v > SHELL) && b.max.y < 0.25;          // a floor / a road: she stands on it
}

type Home = {ground: boolean; dist: number; seed: number};

export const WorldMotion: React.FC<{spec?: WorldSpec; f: number; centre?: [number, number, number]; children: React.ReactNode}> = ({spec, f, centre = [0, 0, 0], children}) => {
  const ref = useRef<THREE.Group>(null);
  const c = new THREE.Vector3(...centre);
  useLayoutEffect(() => {
    const root = ref.current?.children[0];
    if (!root) return;
    root.updateMatrixWorld(true);
    let far = 1;
    const pieces = root.children.filter((o) => !(o as THREE.Light).isLight && o.type !== 'Object3D');
    for (const [i, o] of pieces.entries()) {
      if (!o.userData.home) {
        const b = new THREE.Box3().setFromObject(o);
        const m = b.isEmpty() ? o.position.clone() : b.getCenter(new THREE.Vector3());
        o.userData.home = {ground: isGround(o), dist: Math.hypot(m.x - c.x, m.z - c.z), seed: i} as Home;
      }
      far = Math.max(far, (o.userData.home as Home).dist);
    }
    for (const o of pieces) {
      const h = o.userData.home as Home;
      // the base of this frame: what the set itself put there. r3f re-applies a prop only when it CHANGED, so a piece
      // still where we left it last frame gets its stored base back (no drift), a piece the set moved keeps the move
      const left = o.userData.left as {p: THREE.Vector3; q: THREE.Quaternion; s: THREE.Vector3; v: boolean} | undefined;
      const base = o.userData.base as {p: THREE.Vector3; q: THREE.Quaternion; s: THREE.Vector3; v: boolean} | undefined;
      if (left && base) {
        if (o.position.equals(left.p)) o.position.copy(base.p);
        if (o.quaternion.equals(left.q)) o.quaternion.copy(base.q);
        if (o.scale.equals(left.s)) o.scale.copy(base.s);
        if (o.visible === left.v) o.visible = base.v;
      }
      o.userData.base = {p: o.position.clone(), q: o.quaternion.clone(), s: o.scale.clone(), v: o.visible};
      const b0 = o.userData.base;
      const remember = () => { o.userData.left = {p: o.position.clone(), q: o.quaternion.clone(), s: o.scale.clone(), v: o.visible}; };
      if (h.ground) { remember(); continue; }
      const {v, kind} = away(spec, f, h.dist / far);
      if (v <= 0.0005 || !kind) { remember(); continue; }
      const dir = new THREE.Vector3(b0.p.x - c.x, 0, b0.p.z - c.z);
      if (dir.lengthSq() < 1e-4) dir.set(rnd(h.seed) - 0.5, 0, rnd(h.seed + 1) - 0.5);
      dir.normalize();
      if (kind === 'fly' || kind === 'assemble') {
        // out on a curve: away from her, up and spinning (paper in a gust)
        o.position.addScaledVector(dir, v * (4 + 4 * rnd(h.seed + 2))).add(new THREE.Vector3(0, v * v * (3 + 3 * rnd(h.seed + 3)), 0));
        o.rotateOnAxis(new THREE.Vector3(rnd(h.seed + 4), 1, rnd(h.seed + 5)).normalize(), v * (2 + 3 * rnd(h.seed + 6)) * (h.seed % 2 ? 1 : -1));
      } else if (kind === 'dissolve') {
        // scraps: shrink to nothing while drifting up a little
        o.scale.multiplyScalar(Math.max(0.001, 1 - v));
        o.position.y += v * 0.6;
        if (v > 0.98) o.visible = false;
      } else if (kind === 'melt' || kind === 'rise') {
        // into the water at her feet: squash down and sink
        o.scale.y *= Math.max(0.001, 1 - v);
        o.position.y = b0.p.y * (1 - v) - v * 0.4;
        if (v > 0.98) o.visible = false;
      }
      remember();
    }
  });
  // her sea water spreading from her feet while a world melts (or a new one rises out of it)
  const melt = spec?.out?.kind === 'melt' ? spec.out : spec?.in?.kind === 'rise' ? spec.in : null;
  let water = 0;
  if (melt) {
    const d = Math.max(1, melt.fade ?? 15);
    const t = Math.min(1, Math.max(0, (f - melt.at) / d));
    water = spec?.out?.kind === 'melt' ? Math.sin(Math.PI * Math.min(1, t * 1.2)) : 1 - t;
  }
  return (
    <group ref={ref}>
      {children}
      {water > 0.01 ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centre[0], 0.012, centre[2]]} renderOrder={4} userData={{noSupport: true}}>
          <circleGeometry args={[0.6 + 7 * water, 48]} />
          <meshToonMaterial color="#3a8fb8" transparent opacity={0.55 * Math.min(1, water * 2)} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
};
