// The colour grade library - the studio's default LOOK STEP (toki 2026-10-19: "nach der kritik mit den farben
// abmischen etc war es schon besser"). A video picks one grade per act (shots.json "acts", raymi/timeline.py writes it
// into every shot's opts.grade); a shot may still name its own. Each grade is a mix like After Effects: contrast +
// saturation on the picture, a split tone (light from above, deep colour in the shadows), a vignette - and the colours
// its lyrics take (lyrics v2: type gets its colour from the scene's light, never one colour for the whole video).
// Her skin keeps its pale grey-blue (hard rule 9): the grades are moderate and her sprite is unlit by the set.
// New grades are added here (with a catalog line), never as a per-video hack.
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
  // neutral: a clean, bright picture (comedy, daylight on land)
  clean: {filter: 'contrast(1.12) saturate(1.12) brightness(1.0)', top: '#cfefff', bottom: '#1c1440', split: 0.25, vignette: 0.5,
    lyric: {color: '#ffffff', accent: '#ffcf4a', sub: '#e4ecff', shadow: 'rgba(16,10,40,0.8)'}},
};

/** The grade of a shot: its own opts.grade (written per act by the compiler), else a guess from the set. */
export function gradeName(opts: Record<string, unknown>, set: string): string {
  const g = String(opts.grade ?? (opts.glow ? 'own' : set === 'cardtable' ? 'night' : Number(opts.dim ?? 0) >= 0.5 ? 'closing' : 'day'));
  return g in TONES ? g : 'day';
}
