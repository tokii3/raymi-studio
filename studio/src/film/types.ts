// The film timeline: ONE data format for every music video and its Short (raymi/timeline.py compiles
// jobs/<job>/shots.json into this; the studio only draws). Units: frames, metres, Y up, floor at y = 0.
export type V3 = [number, number, number];
export type Ease = 'linear' | 'in' | 'out' | 'inOut' | 'snap' | 'hold';

/** A camera key: where the lens is, what it looks at, vertical field of view (degrees, for 16:9), roll (deg). */
export type CamKey = {f: number; pos: V3; look: V3; fov: number; roll?: number; ease?: Ease};

export type Act = 'idle' | 'pop' | 'hop' | 'bounce' | 'shake' | 'tilt' | 'lean' | 'shrink' | 'turn' | 'stomp' | 'float';

/** A held key pose of Raymi: from frame f on she shows this sprite at pos (feet), doing act. */
export type PuppetKey = {
  f: number;
  sprite: string;          // public path, e.g. sprites/WS_F_SMUG_WINK_UV_141.png
  size: [number, number];  // sprite px
  cuts: string[];          // sides where the source image cut her figure: must never be seen
  top: number;             // fraction of the sprite height where her head / ears start
  feet: number;            // fraction where her feet touch the floor
  head?: [number, number, number, number];   // her head box in the sprite (fractions x0, y0, x1, y1)
  pos: V3;                 // feet position in the set
  height: number;          // her figure height (head top .. feet) in metres
  act: Act;
  icon?: string | null;
  flip?: boolean;
  move: number;            // frames the move from the previous key's pos takes (ends at f)
  arc: number;             // hop height of that move (m)
  ease?: Ease;
};

export type Word3 = {w: string; from: number; to: number; key: boolean; line: number; idx: number; em?: number | null};

export type LyricKind = 'sign' | 'float' | 'stamp' | 'glass' | 'card' | 'ticker';
export type LyricMaterial = 'fog' | 'engraved' | 'screen' | 'print' | 'felt' | 'light';
export type Lyrics = {
  kind: LyricKind;
  anchor: V3;
  rotY: number;            // degrees, the surface's facing
  size: number;            // cap height of a normal word (m); key words x2.2
  width: number;           // wrap width (m)
  color: string;
  accent: string;
  outline: string;
  lit: boolean;            // true = painted on a surface (takes the set light), false = emits (neon, screen)
  over?: boolean;          // true = the words cross her face on purpose (the script says why)
  material?: LyricMaterial | null;   // what the words are made of on their object (default: painted ink)
};

export type TransitionKind = 'cut' | 'bubbles' | 'ink' | 'whip' | 'flash' | 'pass';
export type Transition = {kind: TransitionKind; frames: number; obj?: string; dir?: number};

export type SetEvent = {f: number; kind: string; arg?: number | string};

export type Shot = {
  id: string;
  from: number;
  to: number;
  set: string;
  opts: Record<string, unknown>;
  camera: CamKey[];
  kick: number;            // camera kick on music hits (0 = none)
  puppets: PuppetKey[];    // one Raymi; keys in time order
  lyrics: Lyrics | null;
  words: Word3[];
  transition: Transition;  // into the NEXT shot
  events: SetEvent[];
  texts?: {name: string; center: V3; size: [number, number]; rot: number}[];   // readable props: never cut by the frame
  noLens?: {name: string; min: V3; max: V3}[];                                // the camera may never be inside these
};

export type FilmProps = {
  composition: 'MV' | 'MVShort';
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  audio: {file: string; from: number; to: number} | null;
  shots: Shot[];
  hits: number[];          // frames of strong music hits (song map), film time
  beats: number[];         // frames of beats, film time
  sprites: string[];
  grain: number;
  title?: string;
  overlay?: {hook: {text: string; from: number; to: number}; cta: {text: string; from: number} | null} | null;   // the Short only
};
