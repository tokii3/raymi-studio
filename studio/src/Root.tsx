import React from 'react';
import {Composition} from 'remotion';
import {Short} from './Short';
import type {ShortProps} from './types';

// Default props only keep the Studio from crashing without a job; real renders always pass --props.
const empty: ShortProps = {
  fps: 30, width: 1080, height: 1920, durationInFrames: 60, world: 'deep_sea', accent: '#b56bff',
  hook: {text: 'no job loaded', to: 30}, cta: {text: 'which job?', from: 30}, words: [], beats: [], voice: '',
};

export const Root: React.FC = () => (
  <Composition
    id="Short"
    component={Short as unknown as React.FC<Record<string, unknown>>}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={60}
    defaultProps={empty as unknown as Record<string, unknown>}
    calculateMetadata={({props}) => {
      const p = props as unknown as ShortProps;
      return {durationInFrames: p.durationInFrames, fps: p.fps, width: p.width, height: p.height};
    }}
  />
);
