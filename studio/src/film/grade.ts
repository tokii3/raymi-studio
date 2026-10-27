// The colour grade library - the studio's default LOOK STEP (toki 2026-10-19: "nach der kritik mit den farben
// abmischen etc war es schon besser"). A video picks one grade per act (shots.json "acts", raymi/timeline.py writes it
// into every shot's opts.grade); a shot may still name its own. Each grade is a mix like After Effects: contrast +
// saturation on the picture, a split tone (light from above, deep colour in the shadows), a vignette - and the colours
// its lyrics take (lyrics v2: type gets its colour from the scene's light, never one colour for the whole video).
// Her skin keeps its pale grey-blue (hard rule 9): the grades are moderate and her sprite is unlit by the set.
// New grades are added here (with a catalog line), never as a per-video hack.
import {Color} from 'three';

export type Tone = {filter: string; top: string; bottom: string; split: number; vignette: number};
export type LyricTone = {color: string; accent: string; sub: string; shadow: string};

export const TONES: Record<string, Tone & {lyric: LyricTone}> = {
  // daylight under water: cool light from the surface over violet depth
  day: {filter: 'contrast(1.24) saturate(1.28) brightness(0.94)', top: '#36d6ff', bottom: '#2a0858', split: 0.42, vignette: 0.7,
    lyric: {color: '#f2fbff', accent: '#ffd25e', sub: '#c4efff', shadow: 'rgba(20,6,60,0.82)'}},
  // the light going out: blue-grey, low
  closing: {filter: 'contrast(1.26) saturate(1.15) brightness(0.9)', top: '#2a7fae', bottom: '#14042e', split: 0.45, vignette: 0.75,
    lyric: {color: '#e8f4ff', accent: '#86dcff', sub: '#b3d0e8', shadow: 'rgba(8,2,30,0.86)'}},
  // a lamp in the night: amber over wine
  night: {filter: 'contrast(1.26) saturate(1.25) brightness(0.93)', top: '#ffb35c', bottom: '#2e0630', split: 0.4, vignette: 0.75,
    lyric: {color: '#fff1dc', accent: '#ffb84a', sub: '#f1d2a8', shadow: 'rgba(34,4,20,0.86)'}},
  // her own light (灯闇): violet in the black
  own: {filter: 'contrast(1.24) saturate(1.28) brightness(0.93)', top: '#b98cff', bottom: '#0e0424', split: 0.42, vignette: 0.75,
    lyric: {color: '#f5edff', accent: '#cfa8ff', sub: '#d6c4f4', shadow: 'rgba(14,4,36,0.86)'}},
  // warm interior / sunset: peach light over plum (her skin stays cool: moderate)
  warm: {filter: 'contrast(1.18) saturate(1.2) brightness(0.96)', top: '#ffb38a', bottom: '#3a0d3a', split: 0.36, vignette: 0.65,
    lyric: {color: '#fff4ea', accent: '#ff7a8a', sub: '#f5d6c6', shadow: 'rgba(40,8,30,0.82)'}},
  // embers under the night sky: moon-blue light from above over plum shadows, the warm glow of the sea (FIRESTARTER act 9)
  ember: {filter: 'contrast(1.22) saturate(1.3) brightness(0.97)', top: '#8fa0ff', bottom: '#3a0a3c', split: 0.4, vignette: 0.7,
    lyric: {color: '#fff3e2', accent: '#ffb347', sub: '#eadcff', shadow: 'rgba(10,4,34,0.86)'}},
  // neutral: a clean, bright picture (comedy, daylight on land)
  clean: {filter: 'contrast(1.12) saturate(1.12) brightness(1.0)', top: '#cfefff', bottom: '#1c1440', split: 0.25, vignette: 0.5,
    lyric: {color: '#ffffff', accent: '#ffcf4a', sub: '#e4ecff', shadow: 'rgba(16,10,40,0.8)'}},
  // POV Shorts (toki 2026-10-23: "nichts ueberlichtet, uebersaturiert"): a calm, film-like grade - low contrast and
  // saturation lift, highlights held under white, cool shadows; the picture's colour comes from the set's light
  pov: {filter: 'contrast(1.06) saturate(1.02) brightness(0.95)', top: '#bcd6ff', bottom: '#1a1238', split: 0.28, vignette: 0.55,
    lyric: {color: '#f6f2ff', accent: '#c9a8ff', sub: '#dcd6f0', shadow: 'rgba(14,8,34,0.84)'}},
  // the same for warm interiors (her room at night, a lamp; Halloween)
  pov_warm: {filter: 'contrast(1.06) saturate(1.04) brightness(0.95)', top: '#ffd2a8', bottom: '#22102e', split: 0.28, vignette: 0.58,
    lyric: {color: '#fff6ec', accent: '#ffb86b', sub: '#f0dccc', shadow: 'rgba(30,10,24,0.84)'}},
  // Watch Me (2026-10-24): ONE family for the three worlds - the same curve, saturation and pink + gold accent pair,
  // only the light's tint changes (studio paper warm-white, the corner's night blue, the museum's gold); highlights
  // held under white (toki: never burnt), shadows deep but never grey
  wm_paper: {filter: 'contrast(1.14) saturate(1.1) brightness(0.95)', top: '#ffe6ef', bottom: '#1c1236', split: 0.32, vignette: 0.6,
    lyric: {color: '#fff7fb', accent: '#ff3d7f', sub: '#f2dde8', shadow: 'rgba(28,10,40,0.84)'}},
  wm_night: {filter: 'contrast(1.14) saturate(1.1) brightness(0.95)', top: '#9fb8ff', bottom: '#1a0c34', split: 0.36, vignette: 0.66,
    lyric: {color: '#f2f6ff', accent: '#ff3d7f', sub: '#cfd8f4', shadow: 'rgba(10,6,36,0.86)'}},
  wm_gold: {filter: 'contrast(1.14) saturate(1.1) brightness(0.95)', top: '#ffd08a', bottom: '#2a0a1e', split: 0.34, vignette: 0.64,
    lyric: {color: '#fff6e6', accent: '#ff3d7f', sub: '#f2dcc0', shadow: 'rgba(36,8,20,0.86)'}},
  // Love is War (2026-10-25): the boards' night grades (own / closing, saturate 1.15-1.28) turned her pale lavender skin
  // saturated blue-violet (look-critic ideas 1: "she looks like a recolour", rule 9). These keep saturation at 1.0 and
  // let the LIGHTS carry the colour (her glow, the beam, the bolt), the skin stays as modelled. Build stills 1 (2026-10-27,
  // refs measure): sat_mean 0.75 against the pros' <= 0.64 and her skin read blue-violet -> saturate 0.84.
  war_night: {filter: 'contrast(1.18) saturate(0.84) brightness(0.96)', top: '#c4ccff', bottom: '#0d0a22', split: 0.26, vignette: 0.6,
    lyric: {color: '#f3f1ff', accent: '#ffd9a0', sub: '#d9dcf0', shadow: 'rgba(8,6,28,0.86)'}},
  // the ink world: near-monochrome paper and ink, one red, her violet - contrast high, colour low
  war_ink: {filter: 'contrast(1.25) saturate(0.85) brightness(0.98)', top: '#fff4ea', bottom: '#0a0810', split: 0.2, vignette: 0.5,
    lyric: {color: '#0a0810', accent: '#c81f37', sub: '#3a3640', shadow: 'rgba(240,232,220,0.8)'}},
  // the riser's end (Love is War 2026-10-26, script v3b): the grade climbs toward white over the measured riser - the
  // pros' build into a drop (LEARNED.md); used only as grade_to over a riser, never as a section's grade
  war_white: {filter: 'contrast(0.94) saturate(0.75) brightness(1.22)', top: '#ffffff', bottom: '#cfd2e8', split: 0.34, vignette: 0.12,
    lyric: {color: '#0a0810', accent: '#c81f37', sub: '#3a3640', shadow: 'rgba(240,232,220,0.8)'}},
  // VRM Firestarter look test: retain the deep-violet setting while keeping highlights on pale MToon materials.
  vrm_fire: {filter: 'contrast(1.08) saturate(1.08) brightness(0.92)', top: '#d39a82', bottom: '#180d31', split: 0.36, vignette: 0.62,
    lyric: {color: '#f3ecff', accent: '#ffc46b', sub: '#d8d2e8', shadow: 'rgba(12,5,30,0.84)'}},
};

/** Two grades mixed (a grade change ON an event inside a shot, e.g. the red wave's front): numbers of the filter, the
 *  split-tone colours and the vignette blend; t = 0 a, 1 b. */
export function mixTone(a: Tone & {lyric: LyricTone}, b: Tone & {lyric: LyricTone}, t: number): Tone & {lyric: LyricTone} {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const nums = (s: string) => (s.match(/[\d.]+/g) ?? []).map(Number);
  const [ca, sa, ba] = nums(a.filter), [cb, sb, bb] = nums(b.filter);
  const L = (x: number, y: number) => x + (y - x) * t;
  const C = (x: string, y: string) => `#${new Color(x).lerp(new Color(y), t).getHexString()}`;
  return {filter: `contrast(${L(ca, cb).toFixed(3)}) saturate(${L(sa, sb).toFixed(3)}) brightness(${L(ba, bb).toFixed(3)})`,
    top: C(a.top, b.top), bottom: C(a.bottom, b.bottom), split: L(a.split, b.split), vignette: L(a.vignette, b.vignette),
    lyric: t < 0.5 ? a.lyric : b.lyric};
}

/** The grade of a shot: its own opts.grade (written per act by the compiler), else a guess from the set. */
export function gradeName(opts: Record<string, unknown>, set: string): string {
  const g = String(opts.grade ?? (opts.glow ? 'own' : set === 'cardtable' ? 'night' : Number(opts.dim ?? 0) >= 0.5 ? 'closing' : 'day'));
  return g in TONES ? g : 'day';
}
