// VRM test board (look development, roadmap item 4): every frame is one tile - a built set, a camera, the 3D Raymi
// (VrmPuppet) in a key pose, optionally the painted sprite beside her for the comparison. Rendered only as cloud
// stills (jobs/<job>/board.json + stills.json). Not a video: the film still uses Puppet3D until toki decides.
import React, {useLayoutEffect} from 'react';
import * as THREE from 'three';
import {AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {SETS} from './three/sets';
import {useTexturesReady} from './three/look';
import {Puppet3D} from './three/Puppet3D';
import {VrmPuppet, useVrmReady} from './three/VrmPuppet';
import type {VrmKey} from './three/vrmPoses';
import {Grade} from './film/Film';
import {TONES, gradeName} from './film/grade';
import type {PuppetKey, V3} from './film/types';

export type BoardTile = {
  name: string;
  set: string;
  opts: Record<string, unknown>;
  cam: {pos: V3; look: V3; fov: number};
  keys: VrmKey[];                 // f relative to the tile (0 = a still)
  lock?: number;                  // VrmPuppet colour lock (hard rule 9)
  materialStyle?: string;
  glowGain?: number;
  sprite?: PuppetKey | null;      // the painted puppet next to her, for the comparison
};

export type VrmBoardProps = {composition: 'VrmBoard'; width: number; height: number; fps: number; durationInFrames: number;
  vrm: string; sprites: string[]; tiles: BoardTile[]; grain?: number;
  // Mixamo clips the tiles play ("motions/<id>.fbx"; a key's `motion` + `clipFrom` picks the moment) - a clip sheet
  // shows each clip on her real rig before a script relies on it (Love is War 2026-10-25: the board loaded none)
  motions?: string[]};

const Lens: React.FC<{pos: V3; look: V3; fov: number}> = ({pos, look, fov}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...pos);
    c.lookAt(...look);
    c.fov = fov; c.near = 0.05; c.far = 200;
    c.updateProjectionMatrix();
    c.updateMatrixWorld(true);
  });
  return null;
};

export const VrmBoard: React.FC<VrmBoardProps> = (props) => {
  const f = useCurrentFrame();
  const {width: W, height: H, fps} = useVideoConfig();
  const vrmReady = useVrmReady([staticFile(props.vrm)], (props.motions ?? []).map((m) => staticFile(m)));
  const texReady = useTexturesReady(props.sprites.map((s) => staticFile(s)));
  const tile = props.tiles[Math.min(f, props.tiles.length - 1)];
  const Set = SETS[tile.set];
  const tone = TONES[gradeName(tile.opts, tile.set)];
  const keys = tile.keys.map((k) => ({...k, f: k.f + f}));
  const sprite = tile.sprite ? [{...tile.sprite, f}] : [];
  return (
    <AbsoluteFill style={{backgroundColor: '#0b0818', overflow: 'hidden'}}>
      <AbsoluteFill style={{filter: tone.filter}}>
        {vrmReady && texReady ? (
          <ThreeCanvas width={W} height={H} shadows flat gl={{antialias: true, preserveDrawingBuffer: true}}
            camera={{fov: tile.cam.fov, near: 0.05, far: 200, position: tile.cam.pos}}>
            <Lens {...tile.cam} />
            {Set ? <Set f={f} fps={fps} opts={tile.opts} hits={[]} beats={[]} camPos={tile.cam.pos} /> : null}
            <VrmPuppet url={staticFile(props.vrm)} keys={keys} f={f} fps={fps} from={f} camPos={tile.cam.pos}
              lock={tile.lock ?? 0.6} shadow={String(tile.opts.shadow ?? '#1d0b38')}
              glow={tile.opts.glow ? String(tile.opts.glow) : undefined} glowGain={tile.glowGain}
              materialStyle={tile.materialStyle} />
            {sprite.length ? <Puppet3D keys={sprite} f={f} fps={fps} camPos={tile.cam.pos} shadow={String(tile.opts.shadow ?? '#1d0b38')} /> : null}
          </ThreeCanvas>
        ) : null}
      </AbsoluteFill>
      <Grade grain={props.grain ?? 0.06} tone={tone} />
    </AbsoluteFill>
  );
};
