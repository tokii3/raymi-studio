// The after-effects pass over the 3D picture (toki 2026-10-23: "keine After Effects ... alles sehr flach, keine
// Schatten, keine Materialien"). Real-time post-processing inside the canvas, deterministic per frame:
//   ao     - ambient occlusion: contact shadows where things meet (feet on the floor, files on the desk) = depth
//   bloom  - glow on everything bright: her chest lights, the light shaft, screens, lamps, lit lyric words
//   dof    - depth of field: the focus distance (m from the lens) - close-ups get a soft background
//   chroma - a hair of chromatic aberration at the frame edge (a lens, not a render)
// A shot sets them in opts.post ({ao, bloom, dof, chroma}); defaults give every 3D shot ao + bloom.
import React from 'react';
import {Bloom, ChromaticAberration, DepthOfField, EffectComposer, N8AO} from '@react-three/postprocessing';
import {BlendFunction} from 'postprocessing';
import * as THREE from 'three';

export type PostSpec = {ao?: number; bloom?: number; dof?: number | null; dofRange?: number; chroma?: number; off?: boolean};

export const PostFX: React.FC<{spec?: PostSpec}> = ({spec = {}}) => {
  if (spec.off) return null;
  const ao = spec.ao ?? 1, bloom = spec.bloom ?? 0.55, chroma = spec.chroma ?? 0.0006;
  const effects: React.ReactElement[] = [];
  if (ao > 0) effects.push(<N8AO key="ao" aoRadius={0.55} distanceFalloff={0.7} intensity={2.4 * ao} quality="low" halfRes color={new THREE.Color('#0d0820')} />);
  if (typeof spec.dof === 'number') effects.push(<DepthOfField key="dof" worldFocusDistance={spec.dof} worldFocusRange={spec.dofRange ?? 0.6} bokehScale={3} />);
  if (bloom > 0) effects.push(<Bloom key="bloom" intensity={bloom} luminanceThreshold={0.86} luminanceSmoothing={0.12} mipmapBlur radius={0.65} />);
  if (chroma > 0) effects.push(<ChromaticAberration key="ca" offset={new THREE.Vector2(chroma, chroma)} radialModulation modulationOffset={0.35} blendFunction={BlendFunction.NORMAL} />);
  // an 8-bit frame buffer (2026-10-24, Beach shot 31 black): in the default half-float buffer one invalid pixel (NaN /
  // Inf) from the scene survives and every blur - bloom, DoF, AO - spreads it into black blocks or a black frame;
  // 8 bits clamp it on write. Bloom keys on the LDR picture (threshold 0.86), which is what it did anyway.
  return <EffectComposer multisampling={0} enableNormalPass={false} frameBufferType={THREE.UnsignedByteType}>{effects}</EffectComposer>;
};
