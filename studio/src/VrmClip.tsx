// Short VRM motion study: the same deterministic pose and spring-bone simulation as VrmBoard, rendered as a clip.
// 2026-10-22: a clip can be several SEGMENTS (each its own set, camera v2 path, 2D effects) joined by camera
// transitions, so the studio's new parts (lip sync v2, spline / dolly / handheld lens, spin / zoom cuts, the 2D
// layer, Raymi on twos with an ink line) are proven in one cloud render before a film uses them.
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
import {cameraAt, fovFor, type Cam} from './film/motion';
import {Transitions, whipStyle} from './film/Transitions';
import {Fx2D, Fx2DDefs, fxFilter, type Fx} from './film/Fx2D';
import type {CamKey, Shot, Transition, V3} from './film/types';
import type {VrmKey} from './three/vrmPoses';
import {makeVrmMouthKeys, type TimedLyricWord} from './three/vrmLipSync';

export type ClipSegment = {from: number; to: number; set: string; opts: Record<string, unknown>; camKeys: CamKey[];
  transition?: Transition; fx?: Fx[]};

export type VrmClipProps = {
  composition: 'VrmClip'; width: number; height: number; fps: number; durationInFrames: number;
  vrm: string; sprites: string[]; set: string; opts: Record<string, unknown>;
  motions?: string[];
  cam: {pos: V3; look: V3; fov: number}; camKeys?: CamKey[]; keys: VrmKey[];
  segments?: ClipSegment[];
  fx?: Fx[];
  lyrics?: {source: string; startSeconds: number; vocals?: string}; mouthWords?: TimedLyricWord[];
  mouthEnv?: number[] | null; lipsync?: 'v1' | 'v2'; mouthGain?: number;
  step?: number; outline?: number; outlineColor?: string;
  lock?: number; glowGain?: number; materialStyle?: string; grain?: number;
  audio?: {src: string; file: string; startFrame: number; volume?: number} | null;
};

const Lens: React.FC<{cam: Cam; aspect: number}> = ({cam, aspect}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...cam.pos); c.up.set(0, 1, 0); c.lookAt(...cam.look);
    if (cam.roll) c.rotateZ((cam.roll * Math.PI) / 180);
    c.fov = fovFor(cam.fov, aspect); c.near = 0.05; c.far = 200;
    c.updateProjectionMatrix(); c.updateMatrixWorld(true);
  }, [camera, cam, aspect]);
  return null;
};

function segmentsOf(p: VrmClipProps): ClipSegment[] {
  if (p.segments?.length) return p.segments;
  const keys: CamKey[] = p.camKeys?.length ? p.camKeys : [{f: 0, ...p.cam}];
  return [{from: 0, to: p.durationInFrames, set: p.set, opts: p.opts, camKeys: keys, fx: p.fx}];
}

const mouthCache = new Map<string, ReturnType<typeof makeVrmMouthKeys>>();

export const VrmClip: React.FC<VrmClipProps> = (props) => {
  const f = useCurrentFrame();
  const {width: W, height: H, fps} = useVideoConfig();
  const vrmReady = useVrmReady([staticFile(props.vrm)], (props.motions ?? []).map(staticFile));
  const texReady = useTexturesReady(props.sprites.map((s) => staticFile(s)));
  const segs = segmentsOf(props);
  const si = Math.max(0, segs.findIndex((s) => f >= s.from && f < s.to));
  const seg = segs[si] ?? segs[0];
  const Set = SETS[seg.set];
  const tone = TONES[gradeName(seg.opts, seg.set)];
  const cam = cameraAt(seg.camKeys, f, [], 0, fps);
  // the mouth for the whole clip is computed once (pure, same on every worker)
  const mkey = `${props.lipsync ?? 'v2'}|${props.durationInFrames}|${props.mouthGain ?? 1}|${props.mouthWords?.length ?? 0}`;
  let mouthKeys = mouthCache.get(mkey);
  if (!mouthKeys) {
    mouthKeys = props.mouthWords ? makeVrmMouthKeys(props.mouthWords, fps, props.lyrics?.startSeconds ?? 0, props.durationInFrames,
      {version: props.lipsync ?? 'v2', env: props.mouthEnv ?? null, gain: props.mouthGain ?? 1}) : [];
    mouthCache.set(mkey, mouthKeys);
  }
  // Transitions only read each segment's start and its transition into the next
  const asShots = segs.map((s) => ({from: s.from, to: s.to, transition: s.transition ?? {kind: 'cut', frames: 0}})) as unknown as Shot[];
  const move = whipStyle(asShots, f, W);
  const filter = [move.filter, tone.filter, fxFilter([...(props.fx ?? []), ...(seg.fx ?? [])], f)].filter(Boolean).join(' ');
  const fx = [...(props.fx ?? []), ...(seg.fx ?? [])];
  return (
    <AbsoluteFill style={{backgroundColor: '#090614', overflow: 'hidden'}}>
      <Fx2DDefs fx={fx} f={f} />
      <AbsoluteFill style={{...move, filter}}>
        {vrmReady && texReady ? (
          <ThreeCanvas width={W} height={H} shadows flat gl={{antialias: true, preserveDrawingBuffer: true}}
            camera={{fov: cam.fov, near: 0.05, far: 200, position: cam.pos}}>
            <Lens cam={cam} aspect={W / H} />
            {Set ? <Set f={f} fps={fps} opts={seg.opts} hits={[]} beats={[]} camPos={cam.pos} /> : null}
            <VrmPuppet url={staticFile(props.vrm)} keys={props.keys} mouthKeys={mouthKeys} f={f} fps={fps} from={0} camPos={cam.pos}
              lock={props.lock ?? 0.25} shadow={String(seg.opts.shadow ?? '#120b2b')} glow={String(seg.opts.glow ?? '') || undefined}
              glowGain={props.glowGain ?? 0} materialStyle={props.materialStyle ?? 'firestarter'}
              step={props.step ?? 1} outline={props.outline ?? 0} outlineColor={props.outlineColor} />
          </ThreeCanvas>
        ) : null}
      </AbsoluteFill>
      <Fx2D fx={fx} f={f} />
      <Transitions shots={asShots} f={f} />
      {props.audio ? <Audio src={staticFile(props.audio.file)} startFrom={props.audio.startFrame} volume={props.audio.volume ?? 0.7} /> : null}
      <Grade grain={props.grain ?? 0.025} tone={tone} />
    </AbsoluteFill>
  );
};
