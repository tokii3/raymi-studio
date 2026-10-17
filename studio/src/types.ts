// Mirror of raymi/plan.py props(). Python resolves and checks; this side only draws.
export type Box = [number, number, number, number];

export type Beat = {
  from: number;
  to: number;
  sprite: string;
  size: [number, number];
  anatomy: {head?: Box; eyes?: Box[]; hands?: Box[]; feet?: Box[]; tail?: Box[]};
  faceBox?: Box | null;
  cuts: string[];
  act: 'idle' | 'pop' | 'hop' | 'tilt' | 'lean' | 'shake' | 'slide_in' | 'bounce' | 'shrink';
  shot: 'wide' | 'medium' | 'close' | 'extreme';
  side: 'center' | 'left' | 'right';
  icon?: string | null;
  key: string[];
};

export type Word = {w: string; from: number; to: number; key: boolean};

export type ShortProps = {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  world: 'deep_sea' | 'paper' | 'night_sky' | 'sunset_reef' | 'screen';
  accent: string;
  hook: {text: string; to: number};
  cta: {text: string; from: number};
  words: Word[];
  beats: Beat[];
  voice: string;
};
