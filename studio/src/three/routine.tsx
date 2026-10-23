// The routine (Take Me to the Beach, 2026-10-22): the things of a grey working day in the deep sea, built once and
// reusable by every later video - the white gloves on strings that move her like a marionette, the boss (a chest, a
// tie, giant hands, never a face), fish coworkers / commuters with varied silhouettes, and the desk things (twin-bell
// alarm clock, tide calendar, shell phone, snow globe, postcard, files, onigiri, headphones, sticky note, printer,
// lamp, can, monitor, chair). A set draws them from its shot options:
//   things: [{kind, pos, rot?, scale?, at?, out?, text?, ...}]  - any desk thing at a place (frames from timeline.py)
//   strings: [{hand: 'left'|'right', anchor: [x,y,z], at?, out?, snap?, slack?, glove?}]  - gloves + strings to her wrists
//   boss: {pos, rotY?, scale?, hands?: 'desk'|'reach'|'hold'|'up', puff_at?, reach_at?}
//   crowd: [{pos, yaw?, seed?, scale?, hold?: 'coffee'|'phone'|'paper'|null, look_at?, tap?, dance?}]
// Everything is matte toon (look.tsx), deterministic, and moves by the frame only.
import React from 'react';
import * as THREE from 'three';
import {RBox, drawText} from './parts';
import {canvasTexture, rnd, toon} from './look';
import {vrmAnatomy} from './VrmPuppet';
import {ease} from '../film/motion';
import {PovThing, type PovThingSpec} from './pov_things';

type P3 = [number, number, number];
const since = (t: unknown, f: number) => (typeof t === 'number' ? f - t : -1);
const GLOVE = '#d9d6e4', STRING = '#f2f2f8', INK = '#1a1030';

// ---------------------------------------------------------------- printed things (her font only, hard rule 5)
function printTex(id: string, w: number, h: number, bg: string, lines: {t: string; px: number; c: string; y: number}[]) {
  return canvasTexture(`print${id}`, w, h, (ctx, W, H) => {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    for (const l of lines) drawText(ctx, l.t, W / 2, l.y * H, l.px * H, l.c, {maxW: W * 0.9});
  });
}

const Printed: React.FC<{size: [number, number]; id: string; bg: string; lines: {t: string; px: number; c: string; y: number}[];
  pos?: P3; rot?: P3; glow?: boolean}> = ({size, id, bg, lines, pos = [0, 0, 0], rot = [0, 0, 0], glow = false}) => {
  const tex = printTex(id, 512, Math.round((512 * size[1]) / size[0]), bg, lines);
  return (
    <mesh position={pos} rotation={rot}>
      <planeGeometry args={size} />
      {glow ? <meshBasicMaterial map={tex} toneMapped={false} /> : <meshToonMaterial map={tex} />}
    </mesh>
  );
};

// ---------------------------------------------------------------- the white glove
/** A white cartoon glove: palm, four fingers, a thumb, a cuff. pose: 'hold' (pinches a string), 'point', 'open', 'grab'. */
export const Glove: React.FC<{pos?: P3; rot?: P3; scale?: number; pose?: 'hold' | 'point' | 'open' | 'grab'; c?: string}> = ({
  pos = [0, 0, 0], rot = [0, 0, 0], scale = 1, pose = 'hold', c = GLOVE,
}) => {
  const m = toon(c);
  const curl = pose === 'grab' ? 1.3 : pose === 'hold' ? 0.9 : pose === 'point' ? 1.4 : 0.15;
  return (
    <group position={pos} rotation={rot} scale={scale}>
      <mesh material={m} scale={[1, 1.1, 0.5]} castShadow><sphereGeometry args={[0.1, 36, 28]} /></mesh>
      {/* cuff with the three seams of a cartoon glove */}
      <mesh material={m} position={[0, 0.13, 0]} castShadow><cylinderGeometry args={[0.085, 0.07, 0.07, 32]} /></mesh>
      {[-0.03, 0, 0.03].map((x, i) => <mesh key={i} position={[x, 0.02, 0.047]} material={toon('#cfc8e0')} scale={[0.006, 0.05, 0.004]}><boxGeometry args={[1, 1, 1]} /></mesh>)}
      {[-0.065, -0.022, 0.022, 0.065].map((x, i) => {
        const c2 = pose === 'point' && i === 1 ? 0 : curl * (1 - i * 0.05);
        return (
          <group key={i} position={[x, -0.09, 0]} rotation={[c2 * 0.9, 0, (i - 1.5) * 0.06]}>
            <mesh material={m} position={[0, -0.045, 0]} castShadow><capsuleGeometry args={[0.024, 0.06, 8, 18]} /></mesh>
            <group position={[0, -0.09, 0]} rotation={[c2, 0, 0]}>
              <mesh material={m} position={[0, -0.03, 0]}><capsuleGeometry args={[0.022, 0.04, 8, 18]} /></mesh>
            </group>
          </group>
        );
      })}
      <group position={[0.095, -0.02, 0.02]} rotation={[0, 0, -0.9 - (pose === 'open' ? 0 : 0.4)]}>
        <mesh material={m} position={[0, -0.04, 0]}><capsuleGeometry args={[0.025, 0.06, 8, 18]} /></mesh>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- strings: the marionette rule
export type StringSpec = {hand: 'left' | 'right'; anchor: P3; at?: number; out?: number; snap?: number; slack?: number;
  glove?: boolean; tug?: number[]; c?: string};

function sagCurve(a: THREE.Vector3, b: THREE.Vector3, sag: number): THREE.CatmullRomCurve3 {
  const mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, -sag, 0));
  return new THREE.CatmullRomCurve3([a, mid, b]);
}

const Thread: React.FC<{a: THREE.Vector3; b: THREE.Vector3; sag: number; c: string; r?: number}> = ({a, b, sag, c, r = 0.004}) => {
  const curve = sagCurve(a, b, sag);
  const geo = new THREE.TubeGeometry(curve, 24, r, 5, false);
  return <mesh geometry={geo} renderOrder={5}><meshBasicMaterial color={c} toneMapped={false} /></mesh>;
};

/** Gloves above the frame, a string from each to HER wrist (VRM bone, read after she is posed - draw this after her).
 *  at: the string appears (hooked); snap: it breaks - the upper half whips up, the lower half drops and dangles;
 *  out: the glove lets go and leaves; tug: frames the glove jerks up (the pull that moves her arm first). */
export const Strings: React.FC<{list: unknown; vrm: string | null; f: number}> = ({list, vrm, f}) => {
  if (!Array.isArray(list) || !vrm) return null;
  const body = vrmAnatomy(vrm);
  return (
    <group>
      {(list as StringSpec[]).map((s, i) => {
        if (typeof s.at === 'number' && f < s.at) return null;
        const wrist = body[s.hand === 'left' ? 'leftHand' : 'rightHand'];
        if (!wrist) return null;
        const hook = typeof s.at === 'number' ? Math.min(1, (f - s.at) / 6) : 1;
        let tug = 0;
        for (const t of s.tug ?? []) { const d = f - t; if (d >= 0 && d < 10) tug = Math.max(tug, Math.sin((d / 10) * Math.PI)); }
        const anchor = new THREE.Vector3(...s.anchor).add(new THREE.Vector3(0, 0.12 * tug, 0));
        const leave = since(s.out, f);
        if (leave >= 0) anchor.add(new THREE.Vector3(0, ease('in', leave / 14) * 3, 0));
        const glove = s.glove === false ? null : (
          <Glove pos={[anchor.x, anchor.y + 0.1, anchor.z]} rot={[Math.PI, 0.3 * Math.sin(i + 1), 0.15 * Math.sin(f / 17 + i)]} scale={1.15} pose="hold" />
        );
        const c = s.c ?? STRING;
        const ds = since(s.snap, f);
        if (ds >= 0) {
          // snapped: the top half recoils to the glove, the bottom half falls from her wrist and swings
          const cut = anchor.clone().lerp(wrist, 0.5);
          const up = anchor.clone().lerp(cut, Math.max(0, 1 - ds / 5));
          const hang = wrist.clone().add(new THREE.Vector3(0.05 * Math.sin(ds / 4), -Math.min(0.35, 0.05 + ds * 0.03), 0.03));
          return (
            <group key={i}>
              {glove}
              {ds < 5 ? <Thread a={anchor} b={up} sag={0} c={c} /> : null}
              <Thread a={wrist} b={hang} sag={0.01} c={c} />
            </group>
          );
        }
        // hooking: the string drops from the glove to her wrist over 6 frames
        const end = anchor.clone().lerp(wrist, ease('out', hook));
        const sag = (s.slack ?? 0.05) * (1 - tug) * anchor.distanceTo(wrist) * 0.25;
        return (
          <group key={i}>
            {glove}
            <Thread a={anchor} b={end} sag={sag} c={c} />
            {hook >= 1 ? <mesh position={wrist} renderOrder={5}><torusGeometry args={[0.035, 0.006, 6, 18]} /><meshBasicMaterial color={c} toneMapped={false} /></mesh> : null}
          </group>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- the boss: a chest, a tie, giant hands
export type BossSpec = {pos: P3; rotY?: number; scale?: number; hands?: 'desk' | 'reach' | 'hold' | 'up' | 'lips'; puff_at?: number;
  reach_at?: number; tie?: string};

export const Boss: React.FC<{s: BossSpec; f: number}> = ({s, f}) => {
  const dp = since(s.puff_at, f);
  const puff = dp >= 0 ? 1 + 0.18 * ease('out', Math.min(1, dp / 10)) : 1;
  const dr = since(s.reach_at, f);
  const reach = dr >= 0 ? ease('inOut', Math.min(1, dr / 14)) : 0;
  const suit = '#2f3346', shirt = '#e8e6ee', tie = s.tie ?? '#5a6ac8';
  const handPose = s.hands ?? 'desk';
  const hand = (side: number) => {
    const base: P3 = handPose === 'up' ? [side * 0.75, 1.9, 0.3] : handPose === 'hold' ? [side * 0.25, 1.0, 0.75]
      : handPose === 'lips' ? [side * 0.6, 0.9, 0.4] : [side * 0.7, 0.78, 0.7];
    const p: P3 = [base[0] * (1 - 0.6 * reach), base[1] + 0.1 * reach, base[2] + 0.9 * reach];
    return <Glove key={side} pos={p} rot={[handPose === 'up' ? 0 : -1.2 + 0.4 * reach, 0, side * 0.2]} scale={2.2} c="#b9b4c9"
      pose={handPose === 'reach' || reach > 0 ? 'grab' : handPose === 'hold' ? 'open' : 'open'} />;
  };
  return (
    <group position={s.pos} rotation={[0, s.rotY ?? 0, 0]} scale={s.scale ?? 1}>
      {/* the chest: a suit torso cut at the top of the frame - no head on purpose */}
      <group scale={[puff, 1, puff]}>
        <RBox size={[1.5, 1.7, 0.75]} pos={[0, 1.55, 0]} r={0.28} c={suit} t="fabric" />
        <mesh position={[0, 1.75, 0.38]} rotation={[0, 0, Math.PI]} material={toon(shirt)}><circleGeometry args={[0.32, 3]} /></mesh>
        {/* lapels */}
        {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.2, 1.72, 0.39]} rotation={[0, 0, sd * 0.35]} material={toon('#262a3b')} scale={[0.18, 0.75, 1]}><planeGeometry args={[1, 1]} /></mesh>)}
        {/* the tie, with its little fish pattern */}
        <mesh position={[0, 1.55, 0.4]} material={toon(tie)} scale={[0.16, 0.8, 1]}><planeGeometry args={[1, 1]} /></mesh>
        <mesh position={[0, 1.13, 0.4]} rotation={[0, 0, Math.PI / 4]} material={toon(tie)} scale={[0.11, 0.11, 1]}><planeGeometry args={[1, 1]} /></mesh>
        {[0, 1, 2].map((k) => <mesh key={k} position={[0, 1.8 - k * 0.22, 0.405]} material={toon('#a9b4ff')} scale={[0.06, 0.03, 1]}><circleGeometry args={[0.5, 8]} /></mesh>)}
        {/* sleeves down to the giant hands */}
        {[-1, 1].map((sd) => <mesh key={`s${sd}`} position={[sd * 0.78, 1.35, 0.2]} rotation={[0.5, 0, sd * 0.25]} material={toon(suit)}><capsuleGeometry args={[0.2, 0.7, 6, 10]} /></mesh>)}
      </group>
      {hand(-1)}{hand(1)}
    </group>
  );
};

// ---------------------------------------------------------------- fish coworkers / commuters
export type FishSpec = {pos: P3; yaw?: number; seed?: number; scale?: number; hold?: 'coffee' | 'phone' | 'paper' | null;
  look_at?: number; tap?: boolean; dance?: boolean; c?: string};

const FISH_SHAPES = [
  {body: [0.42, 0.62, 0.3], c: '#7b84a6'},    // round grouper
  {body: [0.26, 0.85, 0.24], c: '#8a7fa8'},   // tall thin needlefish
  {body: [0.5, 0.5, 0.45], c: '#9aa0b8'},     // puffer
  {body: [0.36, 0.7, 0.16], c: '#6f8aa3'},    // flat angelfish
  {body: [0.3, 0.75, 0.3], c: '#a08f9e'},     // cod in a coat
];

/** An upright fish in office clothes (shirt + tie or a coat), a coffee / phone / paper, staring. Varied by seed. */
export const FishWorker: React.FC<{s: FishSpec; f: number; camPos?: P3}> = ({s, f, camPos}) => {
  const seed = s.seed ?? 0;
  const sh = FISH_SHAPES[seed % FISH_SHAPES.length];
  const [bx, by, bz] = sh.body;
  const c = s.c ?? sh.c;
  const look = since(s.look_at, f);
  const toLens = camPos ? Math.atan2(camPos[0] - s.pos[0], camPos[2] - s.pos[2]) : 0;
  const yaw = look >= 0 ? (s.yaw ?? 0) + (toLens - (s.yaw ?? 0)) * ease('snap', Math.min(1, look / 6)) : (s.yaw ?? 0);
  const bob = s.dance ? Math.abs(Math.sin(f * 0.33 + seed)) * 0.08 : s.tap ? Math.abs(Math.sin(f * 0.33)) * 0.02 : 0.006 * Math.sin(f / 14 + seed);
  const coat = rnd(seed * 3.1) > 0.5;
  const shirt = coat ? '#5b5f73' : '#dfe0ea';
  return (
    <group position={[s.pos[0], s.pos[1] + bob, s.pos[2]]} rotation={[0, yaw, s.dance ? 0.15 * Math.sin(f * 0.33 + seed) : 0]} scale={s.scale ?? 1}>
      {/* legs: two short dark trousers */}
      {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.09, 0.22, 0]} material={toon('#2c2f3f')} castShadow><capsuleGeometry args={[0.06, 0.32, 4, 8]} /></mesh>)}
      {/* the fish body standing upright, clothes around its lower half */}
      <mesh position={[0, 0.5 + by * 0.5, 0]} material={toon(c)} scale={[bx, by, bz]} castShadow><sphereGeometry args={[0.5, 18, 14]} /></mesh>
      <mesh position={[0, 0.55 + by * 0.25, 0]} material={toon(shirt)} scale={[bx * 1.04, by * 0.52, bz * 1.06]}><sphereGeometry args={[0.5, 18, 10, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55]} /></mesh>
      {!coat ? <mesh position={[0, 0.62 + by * 0.3, bz * 0.53]} material={toon(['#6b5fd0', '#3e7a8a', '#b0546b'][seed % 3])} scale={[0.05, 0.22, 1]}><planeGeometry args={[1, 1]} /></mesh> : null}
      {/* the big flat fish eyes, both looking the same way - the stare */}
      {[-1, 1].map((sd) => (
        <group key={`e${sd}`} position={[sd * bx * 0.22, 0.5 + by * 0.78, bz * 0.42]}>
          <mesh material={toon('#f2f0f8')}><sphereGeometry args={[0.06, 12, 10]} /></mesh>
          <mesh position={[0, 0, 0.045]} material={toon('#141020')}><sphereGeometry args={[0.03, 10, 8]} /></mesh>
        </group>
      ))}
      <mesh position={[0, 0.5 + by * 0.6, bz * 0.5]} rotation={[0, 0, Math.PI / 2]} material={toon('#3a2e40')} scale={[0.02, 0.07, 1]}><planeGeometry args={[1, 1]} /></mesh>
      {/* tail fin out the back, fins as arms */}
      <mesh position={[0, 0.5 + by * 0.45, -bz * 0.55]} rotation={[0.4, 0, 0]} material={toon(c, '#000', 1, {side: THREE.DoubleSide})} scale={[bx * 0.7, by * 0.35, 1]}><circleGeometry args={[0.5, 3]} /></mesh>
      {[-1, 1].map((sd) => (
        <group key={`a${sd}`} position={[sd * bx * 0.5, 0.5 + by * 0.45, 0.04]} rotation={[s.hold && sd > 0 ? -1.1 : -0.1, 0, sd * 0.4]}>
          <mesh material={toon(c)} position={[0, -0.12, 0]}><capsuleGeometry args={[0.04, 0.18, 4, 8]} /></mesh>
          {sd > 0 && s.hold === 'coffee' ? <group position={[0, -0.24, 0.02]}>
            <mesh material={toon('#f0ece4')}><cylinderGeometry args={[0.04, 0.034, 0.1, 12]} /></mesh>
            <mesh position={[0, 0.052, 0]} material={toon('#3a2a24')}><cylinderGeometry args={[0.036, 0.036, 0.005, 12]} /></mesh>
          </group> : null}
          {sd > 0 && s.hold === 'phone' ? <RBox size={[0.07, 0.13, 0.012]} pos={[0, -0.24, 0.03]} r={0.008} c="#1b1d2a" e="#8fb8ff" ei={0.4} /> : null}
          {sd > 0 && s.hold === 'paper' ? <mesh position={[0, -0.26, 0.05]} material={toon('#f4f2ea')}><planeGeometry args={[0.2, 0.26]} /></mesh> : null}
        </group>
      ))}
    </group>
  );
};

export const Crowd: React.FC<{list: unknown; f: number; camPos?: P3}> = ({list, f, camPos}) => {
  if (!Array.isArray(list)) return null;
  return <group>{(list as FishSpec[]).map((s, i) => <FishWorker key={i} s={{seed: i, ...s}} f={f} camPos={camPos} />)}</group>;
};

// ---------------------------------------------------------------- desk things
export type ThingSpec = {kind: string; pos: P3; rot?: P3; scale?: number; at?: number; out?: number; text?: string; n?: number;
  ring_at?: number[]; crack?: number; empty?: boolean; open_at?: number; spit?: number[]; land?: number[]; c?: string};

/** The twin-bell alarm clock; its bells are two shells. ring_at: frames it rings (shakes on 8ths for ~1 s). */
export const AlarmClock: React.FC<{t: ThingSpec; f: number}> = ({t, f}) => {
  let ring = 0;
  for (const r of t.ring_at ?? []) { const d = f - r; if (d >= 0 && d < 30) ring = 1; }
  const shake = ring ? Math.sin(f * 2.4) * 0.08 : 0;
  const face = canvasTexture('clockface', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#fbf6ea'; ctx.beginPath(); ctx.arc(w / 2, h / 2, w * 0.48, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.lineCap = 'round';
    for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(w / 2 + Math.cos(a) * w * 0.38, h / 2 + Math.sin(a) * h * 0.38); ctx.lineTo(w / 2 + Math.cos(a) * w * 0.44, h / 2 + Math.sin(a) * h * 0.44); ctx.stroke(); }
    ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(w / 2, h / 2); ctx.lineTo(w / 2, h * 0.2); ctx.stroke();       // 6:00 sharp
    ctx.beginPath(); ctx.moveTo(w / 2, h / 2); ctx.lineTo(w / 2, h * 0.68); ctx.stroke();
  });
  return (
    <group position={t.pos} rotation={t.rot ?? [0, 0, 0]} scale={t.scale ?? 1}>
      <group rotation={[0, 0, shake]} position={[0, ring ? Math.abs(Math.sin(f * 1.2)) * 0.01 : 0, 0]}>
        <mesh position={[0, 0.11, 0]} rotation={[Math.PI / 2, 0, 0]} material={toon('#6f7ae0')} castShadow><cylinderGeometry args={[0.1, 0.1, 0.06, 28]} /></mesh>
        <mesh position={[0, 0.11, 0.031]}><circleGeometry args={[0.088, 28]} /><meshBasicMaterial map={face} toneMapped={false} /></mesh>
        {[-1, 1].map((sd) => (
          <group key={sd} position={[sd * 0.07, 0.21, 0]} rotation={[0, 0, sd * -0.5]}>
            {/* shell bells: scalloped half spheres */}
            <mesh material={toon('#f1c7d8')} castShadow><sphereGeometry args={[0.045, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
          </group>
        ))}
        <mesh position={[0, 0.205, 0]} material={toon('#c9c3dd')}><boxGeometry args={[0.012, 0.04, 0.012]} /></mesh>
        {[-1, 1].map((sd) => <mesh key={`l${sd}`} position={[sd * 0.06, 0.03, 0]} rotation={[0, 0, sd * 0.4]} material={toon('#4b52a8')}><cylinderGeometry args={[0.008, 0.008, 0.07, 6]} /></mesh>)}
      </group>
    </group>
  );
};

/** The tide calendar: a block pad with a big DAY number; text = the page shown. */
export const Calendar: React.FC<{t: ThingSpec; f: number}> = ({t}) => {
  const text = t.text ?? 'DAY 1';
  return (
    <group position={t.pos} rotation={t.rot ?? [0, 0, 0]} scale={t.scale ?? 1}>
      <RBox size={[0.36, 0.44, 0.04]} pos={[0, 0.22, 0]} r={0.01} c="#3a4a7a" />
      <Printed id={`cal${text}`} size={[0.32, 0.34]} pos={[0, 0.2, 0.021]} bg="#f7f3e8"
        lines={[{t: 'TIDE', px: 0.14, c: '#4a6ad0', y: 0.16}, {t: text, px: 0.36, c: INK, y: 0.58}]} />
      {[-0.1, 0, 0.1].map((x, i) => <mesh key={i} position={[x, 0.41, 0.025]} material={toon('#c9c3dd')}><torusGeometry args={[0.014, 0.004, 6, 12]} /></mesh>)}
    </group>
  );
};

/** A loose calendar page (the blizzard, the torn page): text, tumbling while it flies from pos along +x. */
export const Page: React.FC<{t: ThingSpec; f: number}> = ({t, f}) => {
  const d = since(t.at, f);
  if (typeof t.at === 'number' && d < 0) return null;
  const k = Math.max(0, d);
  const pos: P3 = [t.pos[0] + k * 0.06, t.pos[1] + Math.sin(k * 0.2) * 0.05 - k * 0.01, t.pos[2] + k * 0.03];
  return (
    <group position={pos} rotation={[0.3 * Math.sin(k * 0.3), k * 0.15, 0.4 * Math.sin(k * 0.2)]} scale={t.scale ?? 1}>
      <Printed id={`page${t.text}`} size={[0.32, 0.36]} bg="#f7f3e8" lines={[{t: t.text ?? '', px: 0.34, c: INK, y: 0.55}]} />
    </group>
  );
};

/** Her shell phone (a scallop case), screen with text; ring_at = it buzzes. */
export const ShellPhone: React.FC<{t: ThingSpec; f: number}> = ({t, f}) => {
  let buzz = 0;
  for (const r of t.ring_at ?? []) { const d = f - r; if (d >= 0 && d < 40) buzz = Math.sin(f * 3) * 0.03; }
  const lines = (t.text ?? '').split('|');
  return (
    <group position={t.pos} rotation={t.rot ?? [0, 0, 0]} scale={t.scale ?? 1}>
      <group rotation={[0, 0, buzz]}>
        <RBox size={[0.09, 0.17, 0.014]} r={0.012} c="#f3c9d6" />
        <Printed id={`phone${t.text}`} size={[0.078, 0.15]} pos={[0, 0, 0.008]} bg={t.empty ? '#05060c' : '#1a2140'} glow
          lines={lines.map((l, i) => ({t: l, px: i ? 0.07 : 0.1, c: i ? '#c9d6ff' : '#ffffff', y: 0.3 + i * 0.14}))} />
      </group>
    </group>
  );
};

/** The boss's snow globe: grey paper mountains under glass, paper snow, "FORECAST: SNOW" on the base.
 *  crack 0..1 = a star of cracks on the glass; empty = only the base + the broken rim. */
export const SnowGlobe: React.FC<{t: ThingSpec; f: number}> = ({t, f}) => {
  const crack = t.crack ?? 0;
  return (
    <group position={t.pos} rotation={t.rot ?? [0, 0, 0]} scale={t.scale ?? 1}>
      <RBox size={[0.22, 0.07, 0.22]} pos={[0, 0.035, 0]} r={0.02} c="#3b3550" />
      <Printed id={`globelabel${t.text ?? ''}`} size={[0.2, 0.05]} pos={[0, 0.035, 0.111]} bg="#3b3550"
        lines={[{t: t.text ?? 'FORECAST: SNOW', px: 0.6, c: '#f2ecff', y: 0.5}]} />
      {!t.empty ? (
        <group position={[0, 0.16, 0]}>
          {/* the boss's 'mountains': stacks of grey files under the snow (a metaphor - never a real mountain, toki 2026-10-23) */}
          {[[-0.045, 7, 0.02], [0.04, 5, 0.03], [0, 10, -0.03], [0.05, 3, -0.04]].map(([x, n, z], i) => (
            <group key={i} position={[x, -0.075, z]}>
              {Array.from({length: n}, (_, k) => <mesh key={k} position={[0.003 * Math.sin(k * 2.1 + i), 0.006 + k * 0.012, 0]} rotation={[0, 0.2 * Math.sin(k * 3.7 + i), 0]}
                material={toon(['#9aa0b4', '#b8bdcc', '#7f879e'][(k + i) % 3])}><boxGeometry args={[0.05, 0.01, 0.038]} /></mesh>)}
            </group>
          ))}
          {Array.from({length: 22}, (_, i) => {
            const a = rnd(i * 2.3) * Math.PI * 2, r = rnd(i * 1.7) * 0.08;
            const y = ((rnd(i * 4.1) * 0.2 - f * 0.002 * (0.5 + rnd(i))) % 0.2 + 0.2) % 0.2 - 0.08;
            return <mesh key={`s${i}`} position={[Math.cos(a) * r, y, Math.sin(a) * r]}><planeGeometry args={[0.008, 0.008]} /><meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} toneMapped={false} /></mesh>;
          })}
          <mesh renderOrder={6}><sphereGeometry args={[0.11, 28, 20]} />
            <meshToonMaterial color="#b9d6ee" transparent opacity={0.22} depthWrite={false} /></mesh>
          {/* a glass rim + a bright specular streak + its own cold glow: it reads as a snow globe at phone size */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.075, 0]} renderOrder={7}><torusGeometry args={[0.085, 0.01, 8, 28]} /><meshToonMaterial color="#e8f6ff" /></mesh>
          <mesh position={[-0.045, 0.05, 0.085]} rotation={[0, -0.4, 0.6]} renderOrder={8}><planeGeometry args={[0.018, 0.07]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.85} toneMapped={false} /></mesh>
          {crack > 0 ? Array.from({length: 9}, (_, i) => {
            const a = (i / 9) * Math.PI * 2;
            return <mesh key={`c${i}`} position={[Math.cos(a) * 0.04 * crack, Math.sin(a) * 0.04 * crack, 0.105]} rotation={[0, 0, a]} renderOrder={7}>
              <planeGeometry args={[0.09 * crack, 0.003]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>;
          }) : null}
        </group>
      ) : (
        <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon('#dff2ff', '#000', 1, {side: THREE.DoubleSide, opacity: 0.5})}><ringGeometry args={[0.07, 0.1, 18, 1]} /></mesh>
      )}
    </group>
  );
};

/** The postcard of the beach (from above, Salmon waving) on the front; text on the back (handwriting). */
export const Postcard: React.FC<{t: ThingSpec; f: number}> = ({t}) => {
  const front = canvasTexture('postcard_front', 512, 340, (ctx, w, h) => {
    // her dream (the 'beach' as a metaphor, toki 2026-10-23): her luminous sea from above - light rays, her motes,
    // her own ray silhouette with Salmon, a star; no sand, no sun
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#7fe9ff'); g.addColorStop(0.5, '#2a8fd0'); g.addColorStop(1, '#14306e');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(w * (0.1 + k * 0.15), 0); ctx.lineTo(w * (0.18 + k * 0.15), 0); ctx.lineTo(w * (0.05 + k * 0.17), h); ctx.lineTo(w * (-0.02 + k * 0.17), h); ctx.fill(); }
    for (let k = 0; k < 40; k++) { ctx.fillStyle = k % 3 ? '#c9a6ff' : '#bff6ff'; ctx.beginPath(); ctx.arc(rnd(k) * w, rnd(k + 9) * h, 2 + rnd(k + 3) * 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#3a2a8a'; ctx.beginPath(); ctx.moveTo(w * 0.42, h * 0.5); ctx.lineTo(w * 0.52, h * 0.38); ctx.lineTo(w * 0.62, h * 0.5); ctx.lineTo(w * 0.52, h * 0.6); ctx.closePath(); ctx.fill();   // her ray shape
    ctx.strokeStyle = '#3a2a8a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(w * 0.52, h * 0.6); ctx.lineTo(w * 0.5, h * 0.78); ctx.stroke();
    ctx.fillStyle = '#ff8a5c'; ctx.beginPath(); ctx.ellipse(w * 0.3, h * 0.42, w * 0.05, h * 0.03, -0.4, 0, Math.PI * 2); ctx.fill();   // Salmon
    ctx.fillStyle = '#ffd34d'; ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2, r = k % 2 ? 9 : 22; ctx.lineTo(w * 0.8 + Math.cos(a) * r, h * 0.22 + Math.sin(a) * r); } ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 14; ctx.strokeRect(7, 7, w - 14, h - 14);
  });
  return (
    <group position={t.pos} rotation={t.rot ?? [0, 0, 0]} scale={t.scale ?? 1}>
      {/* the only warm thing in the grey office: a warm glow rim behind the card (it must read at phone size) */}
      <mesh position={[0, 0, -0.002]}><planeGeometry args={[0.172, 0.122]} /><meshBasicMaterial color="#ffc46b" toneMapped={false} /></mesh>
      <mesh><planeGeometry args={[0.15, 0.1]} /><meshBasicMaterial map={front} toneMapped={false} /></mesh>
      {t.text ? <Printed id={`pcback${t.text}`} size={[0.15, 0.1]} pos={[0, 0, -0.001]} rot={[0, Math.PI, 0]} bg="#f7f1e2"
        lines={[{t: t.text, px: 0.22, c: '#3a3aa0', y: 0.5}]} /> : null}
    </group>
  );
};

/** Files: a stack of grey folders with labels; n = how many; land = frames four new folders land on top. */
export const Files: React.FC<{t: ThingSpec; f: number}> = ({t, f}) => {
  const base = t.n ?? 6;
  let n = base;
  for (const g of t.land ?? []) if (f >= g) n += 4;
  const label = t.text ?? '';
  return (
    <group position={t.pos} rotation={t.rot ?? [0, 0, 0]} scale={t.scale ?? 1}>
      {Array.from({length: n}, (_, i) => {
        const land = (t.land ?? []).find((g, j) => i >= base + j * 4 && i < base + (j + 1) * 4);
        const dl = land !== undefined ? f - land : 99;
        const drop = dl < 6 ? (1 - dl / 6) * 0.3 : 0;
        return (
          <group key={i} position={[0.01 * Math.sin(i * 2.1), 0.022 + i * 0.044 + drop, 0.01 * Math.cos(i * 1.3)]} rotation={[0, 0.12 * Math.sin(i * 3.7), 0]}>
            <RBox size={[0.34, 0.04, 0.26]} r={0.006} c={['#8d93a8', '#a3a7b8', '#7d8399'][i % 3]} t="paper" />
            {label && i % 3 === 1 ? <Printed id={`file${label}`} size={[0.2, 0.034]} pos={[0, 0, 0.131]} bg="#e9e6dc" lines={[{t: label, px: 0.75, c: INK, y: 0.5}]} /> : null}
          </group>
        );
      })}
    </group>
  );
};

/** The onigiri with its paper wrapper strip (text printed on the strip). */
export const Onigiri: React.FC<{t: ThingSpec; f: number}> = ({t}) => (
  <group position={t.pos} rotation={t.rot ?? [0, 0, 0]} scale={t.scale ?? 1}>
    <mesh material={toon('#f6f4ee')} scale={[1, 1, 0.55]} castShadow><coneGeometry args={[0.06, 0.09, 3]} /></mesh>
    <mesh position={[0, -0.03, 0.02]} material={toon('#1d2a24')} scale={[0.05, 0.035, 1]}><planeGeometry args={[1, 1]} /></mesh>
  </group>
);

/** Headphones (her violet ones): a band and two cups. */
export const Headphones: React.FC<{t: ThingSpec; f: number}> = ({t}) => (
  <group position={t.pos} rotation={t.rot ?? [0, 0, 0]} scale={t.scale ?? 1}>
    <mesh material={toon('#5a3ea8')}><torusGeometry args={[0.09, 0.012, 8, 24, Math.PI]} /></mesh>
    {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.09, -0.01, 0]} rotation={[0, 0, Math.PI / 2]} material={toon('#b98cff', '#7a4cff', 0.3)}><cylinderGeometry args={[0.035, 0.035, 0.03, 18]} /></mesh>)}
  </group>
);

/** A yellow sticky note in her handwriting. */
export const Sticky: React.FC<{t: ThingSpec; f: number}> = ({t}) => (
  <group position={t.pos} rotation={t.rot ?? [0, 0, 0]} scale={t.scale ?? 1}>
    <Printed id={`sticky${t.text}`} size={[0.08, 0.08]} bg="#ffe066" lines={[{t: t.text ?? 'SUN', px: 0.42, c: '#2a2a80', y: 0.52}]} />
  </group>
);

/** The printer; spit = frames it pushes a page out with text (the TAKE pages). */
export const Printer: React.FC<{t: ThingSpec; f: number}> = ({t, f}) => (
  <group position={t.pos} rotation={t.rot ?? [0, 0, 0]} scale={t.scale ?? 1}>
    <RBox size={[0.46, 0.22, 0.36]} pos={[0, 0.11, 0]} r={0.03} c="#c9ccd8" />
    <RBox size={[0.34, 0.02, 0.2]} pos={[0, 0.235, -0.04]} r={0.005} c="#9da2b4" />
    {(t.spit ?? []).map((s, i) => {
      const d = f - s;
      if (d < 0) return null;
      const out = Math.min(1, d / 5);
      const fly = Math.max(0, d - 5);
      return (
        <group key={i} position={[0.02 * i, 0.16 + fly * 0.03, 0.18 + out * 0.15 + fly * 0.05]} rotation={[-1.2 + fly * 0.15, 0.2 * i, 0.1 * fly]}>
          <Printed id={`printer${t.text}`} size={[0.3, 0.42]} bg="#fbfbf6" lines={[{t: t.text ?? 'TAKE', px: 0.22, c: INK, y: 0.5}]} />
        </group>
      );
    })}
  </group>
);

/** The boss's desk lamp (the interrogation sun); on = it shines. */
export const DeskLamp: React.FC<{t: ThingSpec; f: number}> = ({t}) => (
  <group position={t.pos} rotation={t.rot ?? [0, 0, 0]} scale={t.scale ?? 1}>
    <mesh material={toon('#3b3d52')} position={[0, 0.015, 0]}><cylinderGeometry args={[0.09, 0.1, 0.03, 18]} /></mesh>
    <mesh material={toon('#3b3d52')} position={[0, 0.2, 0]} rotation={[0, 0, 0.3]}><cylinderGeometry args={[0.012, 0.012, 0.38, 8]} /></mesh>
    <group position={[-0.06, 0.38, 0]} rotation={[0, 0, -1.1]}>
      <mesh material={toon('#e7d27a')}><coneGeometry args={[0.09, 0.13, 20, 1, true]} /></mesh>
      {t.text ? <Printed id={`lamp${t.text}`} size={[0.15, 0.05]} pos={[0, 0, 0.07]} rot={[0, 0, Math.PI / 2]} bg="#e7d27a" lines={[{t: t.text, px: 0.6, c: INK, y: 0.5}]} /> : null}
      <mesh position={[0, -0.06, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.08, 20]} /><meshBasicMaterial color="#fff6c8" toneMapped={false} /></mesh>
      <pointLight position={[0, -0.12, 0]} color="#fff2b8" intensity={3} distance={3} decay={1.6} />
    </group>
  </group>
);

/** A drink can ("CAN IT"); open_at = the tab pops, a puff of spray. */
export const Can: React.FC<{t: ThingSpec; f: number}> = ({t, f}) => {
  const d = since(t.open_at, f);
  return (
    <group position={t.pos} rotation={t.rot ?? [0, 0, 0]} scale={t.scale ?? 1}>
      <mesh material={toon('#e85a7a')} castShadow><cylinderGeometry args={[0.033, 0.033, 0.12, 24]} /></mesh>
      <Printed id={`can${t.text}`} size={[0.06, 0.06]} pos={[0, 0, 0.034]} bg="#e85a7a" lines={[{t: t.text ?? 'CAN IT', px: 0.3, c: '#ffffff', y: 0.5}]} />
      <mesh position={[0, 0.061, 0]} material={toon('#c9ccd8')}><cylinderGeometry args={[0.03, 0.03, 0.004, 20]} /></mesh>
      <mesh position={[0.01, 0.065, 0]} rotation={[0, 0, d >= 0 ? -0.9 : 0]} material={toon('#9da2b4')}><boxGeometry args={[0.025, 0.003, 0.012]} /></mesh>
      {d >= 0 && d < 12 ? Array.from({length: 10}, (_, i) => (
        <mesh key={i} position={[0.01 + (rnd(i) - 0.5) * 0.04 * d, 0.07 + d * 0.012 * (0.6 + rnd(i * 2)), (rnd(i * 3) - 0.5) * 0.03 * d]}>
          <sphereGeometry args={[0.004 + 0.003 * rnd(i * 5), 6, 4]} /><meshBasicMaterial color="#ffffff" transparent opacity={1 - d / 12} toneMapped={false} />
        </mesh>
      )) : null}
    </group>
  );
};

/** An office monitor; text = the screen (a lyric or an app); dark = black screen (her reflection shot). */
export const Monitor: React.FC<{t: ThingSpec; f: number}> = ({t}) => (
  <group position={t.pos} rotation={t.rot ?? [0, 0, 0]} scale={t.scale ?? 1}>
    <RBox size={[0.62, 0.4, 0.04]} pos={[0, 0.42, 0]} r={0.02} c="#262838" />
    <Printed id={`mon${t.text ?? ''}${t.empty ? 'd' : ''}`} size={[0.56, 0.34]} pos={[0, 0.42, 0.021]} glow bg={t.empty ? '#07080e' : '#2c3550'}
      lines={t.text && !t.empty ? [{t: t.text, px: 0.16, c: '#e9eeff', y: 0.5}] : []} />
    <mesh position={[0, 0.16, -0.02]} material={toon('#262838')}><boxGeometry args={[0.05, 0.16, 0.04]} /></mesh>
    <RBox size={[0.24, 0.02, 0.16]} pos={[0, 0.01, -0.02]} r={0.008} c="#262838" />
  </group>
);

/** An office chair (spins with rot). */
export const Chair: React.FC<{t: ThingSpec; f: number}> = ({t}) => (
  <group position={t.pos} rotation={t.rot ?? [0, 0, 0]} scale={t.scale ?? 1}>
    <RBox size={[0.5, 0.08, 0.48]} pos={[0, 0.46, 0]} r={0.03} c={t.c ?? '#4a4e66'} t="fabric" />
    <RBox size={[0.48, 0.55, 0.07]} pos={[0, 0.8, -0.22]} r={0.04} c={t.c ?? '#4a4e66'} t="fabric" />
    <mesh position={[0, 0.24, 0]} material={toon('#2a2c3a')}><cylinderGeometry args={[0.03, 0.03, 0.42, 10]} /></mesh>
    {Array.from({length: 5}, (_, i) => <mesh key={i} position={[Math.cos(i * 1.256) * 0.2, 0.03, Math.sin(i * 1.256) * 0.2]} rotation={[0, -i * 1.256, Math.PI / 2]} material={toon('#2a2c3a')}><cylinderGeometry args={[0.018, 0.018, 0.4, 6]} /></mesh>)}
  </group>
);

/** A grey office desk with drawers. */
export const Desk: React.FC<{pos: P3; rotY?: number; c?: string; w?: number}> = ({pos, rotY = 0, c = '#9ca0b2', w = 1.4}) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <RBox size={[w, 0.05, 0.75]} pos={[0, 0.74, 0]} r={0.015} c={c} t="wood" />
    <RBox size={[0.4, 0.68, 0.7]} pos={[w / 2 - 0.22, 0.36, 0]} r={0.02} c="#878b9e" t="metal" />
    {[0, 1, 2].map((k) => <mesh key={k} position={[w / 2 - 0.22, 0.58 - k * 0.2, 0.352]} material={toon('#c6c9d6')}><boxGeometry args={[0.12, 0.015, 0.01]} /></mesh>)}
    <mesh position={[-w / 2 + 0.04, 0.37, 0]} material={toon('#878b9e')}><boxGeometry args={[0.04, 0.72, 0.68]} /></mesh>
  </group>
);

/** Every desk thing listed in opts.things (each kind by name). */
export const Things: React.FC<{list: unknown; f: number}> = ({list, f}) => {
  if (!Array.isArray(list)) return null;
  return (
    <group>
      {(list as ThingSpec[]).map((t, i) => {
        if (typeof t.at === 'number' && f < t.at && t.kind !== 'page') return null;
        if (typeof t.out === 'number' && f >= t.out) return null;
        switch (t.kind) {
          case 'clock': return <AlarmClock key={i} t={t} f={f} />;
          case 'calendar': return <Calendar key={i} t={t} f={f} />;
          case 'page': return <Page key={i} t={t} f={f} />;
          case 'phone': return <ShellPhone key={i} t={t} f={f} />;
          case 'globe': return <SnowGlobe key={i} t={t} f={f} />;
          case 'postcard': return <Postcard key={i} t={t} f={f} />;
          case 'files': return <Files key={i} t={t} f={f} />;
          case 'onigiri': return <Onigiri key={i} t={t} f={f} />;
          case 'headphones': return <Headphones key={i} t={t} f={f} />;
          case 'sticky': return <Sticky key={i} t={t} f={f} />;
          case 'printer': return <Printer key={i} t={t} f={f} />;
          case 'lamp': return <DeskLamp key={i} t={t} f={f} />;
          case 'can': return <Can key={i} t={t} f={f} />;
          case 'monitor': return <Monitor key={i} t={t} f={f} />;
          case 'chair': return <Chair key={i} t={t} f={f} />;
          case 'glove': return <Glove key={i} pos={t.pos} rot={t.rot} scale={t.scale ?? 1} pose={(t.text as 'hold' | 'point' | 'open' | 'grab') ?? 'open'} />;
          default: return <PovThing key={i} t={t as unknown as PovThingSpec} f={f} />;   // pov_things.tsx kinds
        }
      })}
    </group>
  );
};

/** All routine things a set draws from its options (the set adds its own architecture around them). */
export const RoutineLife: React.FC<{opts: Record<string, unknown>; f: number; camPos?: P3}> = ({opts, f, camPos}) => (
  <group>
    <Things list={opts.things} f={f} />
    <Crowd list={opts.crowd} f={f} camPos={camPos} />
    {opts.boss ? <Boss s={opts.boss as BossSpec} f={f} /> : null}
  </group>
);
