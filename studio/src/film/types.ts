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
  mask?: string[];         // her coarse silhouette: rows top..bottom of "0"/"1" cells over the sprite (timeline.py)
  pos: V3;                 // feet position in the set
  height: number;          // her figure height (head top .. feet) in metres
  act: Act;
  icon?: string | null;
  flip?: boolean;
  rot?: number;            // degrees in the picture plane: she lies back / floats / dives (a standing sprite turned)
  move: number;            // frames the move from the previous key's pos takes (ends at f)
  arc: number;             // hop height of that move (m)
  ease?: Ease;
};

export type Word3 = {w: string; from: number; to: number; key: boolean; line: number; idx: number; em?: number | null};

/** Lyrics v2: what a line shows under itself - romaji + English for a Japanese line (toki 2026-10-19), with the exact
 *  widths in her heavy font (em, from raymi/timeline.py) for the guards. */
export type LyricSub = {roma: string; en: string; romaEm?: number[] | null; enEm?: number[] | null};

export type LyricKind = 'sign' | 'float' | 'stamp' | 'glass' | 'card' | 'ticker' | 'firework';
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
  // ---- lyrics v2 (style 'v2'; 'v1' = the KING-era flat outlined marker, kept until toki approves v2 as the default)
  style?: 'v1' | 'v2';
  tilt?: number;           // degrees about the surface's x axis: -90 = lying flat on a floor / table, -10 = leaning back
  roll?: number;           // degrees in the surface plane: the block follows the pose / the diagonal (This Is War)
  keyScale?: number;       // key word size / normal size (v2 default 2.8: one word huge)
  auto?: boolean;          // colours from the scene's grade (grade.ts LyricTone) instead of color / accent
  subs?: Record<string, LyricSub>;   // per lyric line index: romaji + English under a Japanese line
  small?: string | null;   // a written reason to go below the readable size on purpose (a principle, not a law)
  reveal?: 'burn' | null;  // each word is BURNED in left to right over its sung time (a crack writing it), hot leading edge
  dim?: number | null;     // 0..1 brightness of the non-key words (a line lying dark, only its key word glowing)
  mirror?: number | null;  // firework words: the water surface height they are mirrored in (null = no mirror)
};

export type TransitionKind = 'cut' | 'bubbles' | 'ink' | 'whip' | 'flash' | 'pass' | 'rewind';
export type Transition = {kind: TransitionKind; frames: number; obj?: string; dir?: number};

export type SetEvent = {f: number; kind: string; arg?: number | string};

/** A main element: worn on her head (crown, hat), her face, a lyric word, or a prop box in the set. */
export type Hero = {name: string; kind: 'worn' | 'face' | 'word' | 'prop'; word?: string; min: number; size?: [number, number]; center?: V3; why_small?: string | null;
  uv?: [number, number]};   // uv: a prop she HOLDS - its box centre is that point of her sprite (the flame in her palm)

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
  solids?: {name: string; center: V3; size: V3}[];                            // props: lens never inside, face never hidden
  hero?: Hero[];           // the video's main element(s) this shot must show readably (treatment -> shots.json heroes)
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
  heavy?: boolean;         // some lyric uses v2 (her heavy weight must be loaded)
  vrm?: string;            // replace the 2D actor with this model while keeping the exact same film timeline
  overlay?: {hook: {text: string; from: number; to: number}; cta: {text: string; from: number} | null} | null;   // the Short only
};
