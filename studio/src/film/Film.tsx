// The music-video composition: built 3D sets seen through a real camera, Raymi in the space, lyrics as objects,
// transitions through things. MV (1920x1080) and its Short (1080x1920) are the SAME timeline (types.ts) - only the
// frame differs; the camera widens its vertical view for portrait (motion.fovFor).
import React, {useLayoutEffect} from 'react';
import * as THREE from 'three';
import {AbsoluteFill, Audio, cancelRender, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {useRaymiFont} from '../font';
import {grainTile} from '../textures';
import {ReactionIcon} from '../Icons';
import {SETS} from '../three/sets';
import {Puppet3D} from '../three/Puppet3D';
import {Words3D} from '../three/Words3D';
import {CapCrown} from '../three/props';
import {useTexturesReady} from '../three/look';
import {makeCamera, puppetMatrix, visibleCutEdges} from './check';
import {planeSize, puppetAt} from './motion';
import {Transitions, whipStyle} from './Transitions';
import type {FilmProps, Shot} from './types';

export function shotAt(shots: Shot[], f: number): number {
  for (let i = shots.length - 1; i >= 0; i--) if (f >= shots[i].from) return i;
  return 0;
}

const CameraRig: React.FC<{cam: THREE.PerspectiveCamera}> = ({cam}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.copy(cam.position);
    c.quaternion.copy(cam.quaternion);
    c.fov = cam.fov; c.aspect = cam.aspect; c.near = cam.near; c.far = cam.far;
    c.updateProjectionMatrix();
    c.updateMatrixWorld(true);
  });
  return null;
};

/** World point on her figure: u = 0..1 across the sprite, t = 0..1 from the sprite top. */
function figurePoint(shot: Shot, f: number, fps: number, camPos: [number, number, number], u: number, t: number): THREE.Vector3 | null {
  const p = puppetAt(shot.puppets, f, fps);
  if (!p) return null;
  const {w, h} = planeSize(p.key);
  return new THREE.Vector3((u - 0.5) * w, (p.key.feet - t) * h, 0).applyMatrix4(puppetMatrix(p, camPos));
}

export const Film: React.FC<FilmProps> = (props) => {
  const fontReady = useRaymiFont();
  const texReady = useTexturesReady(props.sprites.map((s) => staticFile(s)));
  const ready = fontReady && texReady;
  const f = useCurrentFrame();
  const {width: W, height: H, fps} = useVideoConfig();
  const i = shotAt(props.shots, f);
  const shot = props.shots[i];
  const aspect = W / H;
  const cam = makeCamera(shot, f, aspect, props.hits, fps);
  const camPos: [number, number, number] = [cam.position.x, cam.position.y, cam.position.z];
  const faults = visibleCutEdges(shot, f, aspect, props.hits, fps);
  if (faults.length) cancelRender(new Error(`cut sprite edge on screen: ${JSON.stringify(faults)} - reframe the shot (hard rule 9)`));
  const Set = SETS[shot.set];
  if (!Set) cancelRender(new Error(`unknown set ${shot.set}`));
  const pose = puppetAt(shot.puppets, f, fps);
  const head = pose ? figurePoint(shot, f, fps, camPos, 0.62, pose.key.top + 0.02) : null;
  // the bottle-cap crown on her head; cap_off (frame) = she takes it off and tosses it back onto its pebble (12 frames)
  const capOff = typeof shot.opts.cap_off === 'number' ? shot.opts.cap_off : Infinity;
  // the crown sits on her HEAD (head box centre), not the sprite centre: leaning poses carry it with them (stills run 14)
  const crownUV = (k: Shot['puppets'][number]): [number, number] => (k.head ? [(k.head[0] + k.head[2]) / 2, k.head[1] + 0.035] : [0.5, k.top + 0.035]);
  let crownAt = shot.opts.crown === 'head' && pose ? figurePoint(shot, f, fps, camPos, ...crownUV(pose.key)) : null;
  if (crownAt && f >= capOff) {
    const t = (f - capOff) / 12;
    const from = figurePoint(shot, capOff, fps, camPos, ...crownUV(pose!.key))!;
    const to = new THREE.Vector3(...((shot.opts.pebble as [number, number, number]) ?? [0.25, 0.42, -1.25]));
    crownAt = t >= 1 ? null : from.clone().lerp(to, t).add(new THREE.Vector3(0, Math.sin(Math.PI * t) * 0.6, 0));
  }
  let icon: React.ReactNode = null;
  if (pose?.key.icon && head) {
    const n = head.clone().project(cam);
    if (n.z < 1) icon = <ReactionIcon kind={pose.key.icon} x={(n.x * 0.5 + 0.5) * W + W * 0.04} y={(-n.y * 0.5 + 0.5) * H} local={pose.local} accent="#b56bff" />;
  }
  return (
    <AbsoluteFill style={{backgroundColor: '#0b0818', overflow: 'hidden'}}>
      <AbsoluteFill style={{...whipStyle(props.shots, f, W), filter: [whipStyle(props.shots, f, W).filter, gradeOf(shot).filter].filter(Boolean).join(' ')}}>
        {ready ? (
          <ThreeCanvas width={W} height={H} shadows flat gl={{antialias: true, preserveDrawingBuffer: true}}
            camera={{fov: cam.fov, near: 0.05, far: 200, position: camPos}}>
            <CameraRig cam={cam} />
            {Set ? <Set f={f} fps={fps} opts={shot.opts} hits={props.hits} beats={props.beats} camPos={camPos} /> : null}
            <Puppet3D keys={shot.puppets} f={f} fps={fps} camPos={camPos} shadow={String(shot.opts.shadow ?? '#1d0b38')}
              glow={shot.opts.glow ? String(shot.opts.glow) : undefined} />
            {crownAt ? (
              <group position={[crownAt.x, crownAt.y, crownAt.z]} rotation={[0, Math.atan2(camPos[0] - crownAt.x, camPos[2] - crownAt.z), 0]}>
                <CapCrown pos={[0, 0.0, 0]} rot={[0.12, 0, -0.18]} scale={0.62} />
              </group>
            ) : null}
            {shot.lyrics ? <Words3D L={shot.lyrics} words={shot.words} f={f} fps={fps} /> : null}
          </ThreeCanvas>
        ) : null}
      </AbsoluteFill>
      {icon}
      <Transitions shots={props.shots} f={f} />
      <Grade grain={props.grain} tone={gradeOf(shot)} />
      {props.audio ? <Audio src={staticFile(props.audio.file)} trimBefore={Math.round(props.audio.from * fps)} /> : null}
    </AbsoluteFill>
  );
};

// The colour grade (toki 2026-10-18: "sehr blass und ohne Tiefe" - like a mix in After Effects): contrast + saturation
// on the picture, a split tone (cool light from the water above, deep violet in the shadows below) and a heavier
// vignette. Per act: day (the show), night (the lamp: amber over wine), own (her violet light). Her skin keeps its
// pale grey-blue (hard rule 9): the grade is moderate and her sprite is unlit by the set.
export type Tone = {filter: string; top: string; bottom: string; split: number; vignette: number};
const TONES: Record<string, Tone> = {
  day: {filter: 'contrast(1.16) saturate(1.2) brightness(0.96)', top: '#36d6ff', bottom: '#3a0f6e', split: 0.34, vignette: 0.62},
  closing: {filter: 'contrast(1.2) saturate(1.1) brightness(0.92)', top: '#2a7fae', bottom: '#1a0638', split: 0.4, vignette: 0.7},
  night: {filter: 'contrast(1.2) saturate(1.18) brightness(0.95)', top: '#ffb35c', bottom: '#3b0a3a', split: 0.32, vignette: 0.72},
  own: {filter: 'contrast(1.18) saturate(1.22) brightness(0.95)', top: '#b98cff', bottom: '#14062e', split: 0.36, vignette: 0.7},
};
export function gradeOf(shot: Shot): Tone {
  const g = String(shot.opts.grade ?? (shot.opts.glow ? 'own' : shot.set === 'cardtable' ? 'night' : Number(shot.opts.dim ?? 0) >= 0.5 ? 'closing' : 'day'));
  return TONES[g] ?? TONES.day;
}

const Grade: React.FC<{grain: number; tone: Tone}> = ({grain, tone}) => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${tone.top} 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0) 55%, ${tone.bottom} 100%)`,
        mixBlendMode: 'soft-light', opacity: tone.split}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(8,2,24,${tone.vignette}) 100%)`}} />
      <AbsoluteFill style={{opacity: grain, mixBlendMode: 'overlay', backgroundImage: grainTile,
        backgroundPosition: `${Math.floor(random(`gx${f % 24}`) * 256)}px ${Math.floor(random(`gy${f % 24}`) * 256)}px`}} />
    </>
  );
};
