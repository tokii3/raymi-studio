// Short VRM motion study: the same deterministic pose and spring-bone simulation as VrmBoard, rendered as a clip.
import React, {useLayoutEffect} from 'react';
import * as THREE from 'three';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {SETS} from './three/sets';
import {useTexturesReady} from './three/look';
import {VrmPuppet, useVrmReady} from './three/VrmPuppet';
import {Grade} from './film/Film';
import {TONES, gradeName} from './film/grade';
import type {V3} from './film/types';
import type {VrmKey} from './three/vrmPoses';
import {makeVrmMouthKeys, type TimedLyricWord} from './three/vrmLipSync';
import {ease} from './film/motion';

type CamKey = {f: number; pos: V3; look: V3; fov: number};

export type VrmClipProps = {
  composition: 'VrmClip'; width: number; height: number; fps: number; durationInFrames: number;
  vrm: string; sprites: string[]; set: string; opts: Record<string, unknown>;
  motions?: string[];
  cam: {pos: V3; look: V3; fov: number}; camKeys?: CamKey[]; keys: VrmKey[];
  lyrics?: {source: string; startSeconds: number}; mouthWords?: TimedLyricWord[];
  lock?: number; glowGain?: number; materialStyle?: string; grain?: number;
  audio?: {src: string; file: string; startFrame: number; volume?: number} | null;
};

const Lens: React.FC<{pos: V3; look: V3; fov: number}> = ({pos, look, fov}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pos); c.lookAt(...look); c.fov = fov; c.near = 0.05; c.far = 200;
    c.updateProjectionMatrix(); c.updateMatrixWorld(true);
  }, [camera, pos, look, fov]);
  return null;
};

export const VrmClip: React.FC<VrmClipProps> = (props) => {
  const f = useCurrentFrame();
  const {width: W, height: H, fps} = useVideoConfig();
  const vrmReady = useVrmReady([staticFile(props.vrm)], (props.motions ?? []).map(staticFile));
  const texReady = useTexturesReady(props.sprites.map((s) => staticFile(s)));
  const Set = SETS[props.set];
  const tone = TONES[gradeName(props.opts, props.set)];
  const camera = cameraAt(props.camKeys, f, props.cam);
  const mouthKeys = props.mouthWords ? makeVrmMouthKeys(props.mouthWords, fps, props.lyrics?.startSeconds ?? 0) : [];
  return (
    <AbsoluteFill style={{backgroundColor: '#090614', overflow: 'hidden'}}>
      <AbsoluteFill style={{filter: tone.filter}}>
        {vrmReady && texReady ? (
          <ThreeCanvas width={W} height={H} shadows flat gl={{antialias: true, preserveDrawingBuffer: true}}
            camera={{fov: camera.fov, near: 0.05, far: 200, position: camera.pos}}>
            <Lens {...camera} />
            {Set ? <Set f={f} fps={fps} opts={props.opts} hits={[]} beats={[]} camPos={camera.pos} /> : null}
            <VrmPuppet url={staticFile(props.vrm)} keys={props.keys} mouthKeys={mouthKeys} f={f} fps={fps} from={0} camPos={camera.pos}
              lock={props.lock ?? 0.25} shadow={String(props.opts.shadow ?? '#120b2b')} glow={String(props.opts.glow ?? '') || undefined}
              glowGain={props.glowGain ?? 0} materialStyle={props.materialStyle ?? 'firestarter'} />
          </ThreeCanvas>
        ) : null}
      </AbsoluteFill>
      {props.audio ? <Audio src={staticFile(props.audio.file)} startFrom={props.audio.startFrame} volume={props.audio.volume ?? 0.7} /> : null}
      <Grade grain={props.grain ?? 0.025} tone={tone} />
    </AbsoluteFill>
  );
};

function cameraAt(keys: CamKey[] | undefined, f: number, fallback: Omit<CamKey, 'f'>): CamKey {
  if (!keys?.length) return {...fallback, f};
  let i = 0;
  while (i < keys.length - 1 && keys[i + 1].f <= f) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const t = a === b ? 0 : ease('inOut', (f - a.f) / Math.max(1, b.f - a.f));
  const mix = (x: V3, y: V3): V3 => [x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t];
  return {f, pos: mix(a.pos, b.pos), look: mix(a.look, b.look), fov: a.fov + (b.fov - a.fov) * t};
}
