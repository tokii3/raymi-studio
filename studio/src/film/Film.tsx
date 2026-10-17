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
import {BottleCap} from '../three/props';
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
  const crownAt = shot.opts.crown === 'head' && pose ? figurePoint(shot, f, fps, camPos, 0.5, pose.key.top + 0.035) : null;
  let icon: React.ReactNode = null;
  if (pose?.key.icon && head) {
    const n = head.clone().project(cam);
    if (n.z < 1) icon = <ReactionIcon kind={pose.key.icon} x={(n.x * 0.5 + 0.5) * W + W * 0.04} y={(-n.y * 0.5 + 0.5) * H} local={pose.local} accent="#b56bff" />;
  }
  return (
    <AbsoluteFill style={{backgroundColor: '#0b0818', overflow: 'hidden'}}>
      <AbsoluteFill style={whipStyle(props.shots, f, W)}>
        {ready ? (
          <ThreeCanvas width={W} height={H} shadows flat gl={{antialias: true, preserveDrawingBuffer: true}}
            camera={{fov: cam.fov, near: 0.05, far: 200, position: camPos}}>
            <CameraRig cam={cam} />
            {Set ? <Set f={f} fps={fps} opts={shot.opts} hits={props.hits} beats={props.beats} /> : null}
            <Puppet3D keys={shot.puppets} f={f} fps={fps} camPos={camPos} shadow={String(shot.opts.shadow ?? '#1d0b38')}
              glow={shot.opts.glow ? String(shot.opts.glow) : undefined} />
            {crownAt ? (
              <group position={[crownAt.x, crownAt.y, crownAt.z]} rotation={[0, Math.atan2(camPos[0] - crownAt.x, camPos[2] - crownAt.z), 0]}>
                <BottleCap pos={[0, 0.02, 0]} rot={[0.75, 0, -0.22]} scale={0.95} c="#d9a63a" top="#5b2a91" />
              </group>
            ) : null}
            {shot.lyrics ? <Words3D L={shot.lyrics} words={shot.words} f={f} fps={fps} /> : null}
          </ThreeCanvas>
        ) : null}
      </AbsoluteFill>
      {icon}
      <Transitions shots={props.shots} f={f} />
      <Grade grain={props.grain} />
      {props.audio ? <Audio src={staticFile(props.audio.file)} trimBefore={Math.round(props.audio.from * fps)} /> : null}
    </AbsoluteFill>
  );
};

const Grade: React.FC<{grain: number}> = ({grain}) => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 58%, rgba(10,2,30,0.5) 100%)'}} />
      <AbsoluteFill style={{opacity: grain, mixBlendMode: 'overlay', backgroundImage: grainTile,
        backgroundPosition: `${Math.floor(random(`gx${f % 24}`) * 256)}px ${Math.floor(random(`gy${f % 24}`) * 256)}px`}} />
    </>
  );
};
