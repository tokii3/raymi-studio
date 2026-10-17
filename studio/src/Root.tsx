import React from 'react';
import {Composition} from 'remotion';
import {Short} from './Short';
import {Film} from './film/Film';
import type {ShortProps} from './types';
import type {FilmProps} from './film/types';

// Default props only keep the Studio from crashing without a job; real renders always pass the job's props.
const empty: ShortProps = {
  fps: 30, width: 1080, height: 1920, durationInFrames: 60, world: 'deep_sea', accent: '#b56bff',
  hook: {text: 'no job loaded', to: 30}, cta: {text: 'which job?', from: 30}, words: [], beats: [], voice: '',
};

const film = (composition: FilmProps['composition'], width: number, height: number): FilmProps => ({
  composition, width, height, fps: 30, durationInFrames: 30, audio: null, hits: [], beats: [], sprites: [], grain: 0.06,
  shots: [{id: 'empty', from: 0, to: 30, set: 'aquarium', opts: {}, kick: 0, puppets: [], lyrics: null, words: [],
    transition: {kind: 'cut', frames: 0}, events: [], camera: [{f: 0, pos: [0, 0.75, 9.5], look: [0, 1.3, 0], fov: 33}]}],
});

const meta = ({props}: {props: Record<string, unknown>}) => {
  const p = props as unknown as {durationInFrames: number; fps: number; width: number; height: number};
  return {durationInFrames: p.durationInFrames, fps: p.fps, width: p.width, height: p.height};
};

export const Root: React.FC = () => (
  <>
    <Composition id="Short" component={Short as unknown as React.FC<Record<string, unknown>>} width={1080} height={1920}
      fps={30} durationInFrames={60} defaultProps={empty as unknown as Record<string, unknown>} calculateMetadata={meta} />
    {/* music video 16:9 and its Short 9:16 - the same timeline (film/types.ts) */}
    <Composition id="MV" component={Film as unknown as React.FC<Record<string, unknown>>} width={1920} height={1080}
      fps={30} durationInFrames={30} defaultProps={film('MV', 1920, 1080) as unknown as Record<string, unknown>} calculateMetadata={meta} />
    <Composition id="MVShort" component={Film as unknown as React.FC<Record<string, unknown>>} width={1080} height={1920}
      fps={30} durationInFrames={30} defaultProps={film('MVShort', 1080, 1920) as unknown as Record<string, unknown>} calculateMetadata={meta} />
  </>
);
