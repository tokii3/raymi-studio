// Lyrics v2 layout - ONE function for the renderer (Words3D, real font metrics) and the guards (check.ts, exact widths
// from raymi/timeline.py), so what the guard measures is what the picture shows.
// A lyric block = the sung line (key word huge, fillers smaller) and, under a Japanese line, its romaji and its English
// (toki 2026-10-19: "bei japanischen songs soll immer romaji / englisch noch unten mit stehen"). Units: metres on the
// block's own surface (x right, y up), centred on the anchor; `size` = cap height of a normal word.
import type {LyricSub, Lyrics, Word3} from './types';
import * as THREE from 'three';

export const CAP = 0.72;            // cap height share of the font size (her font)
export const PAD_EM = 0.25;         // texture room left / right of a word (its soft shadow)
export const TEX_EM = 1.45;         // texture height in em (glyph + shadow below)
export const SUB = 0.7;             // romaji / English size vs a normal word (type-critic style frames 1: 0.6 too small)
export const KEY = 2.8;             // default key word size vs a normal word (v2: one word HUGE)

export type Item = {kind: 'main' | 'roma' | 'en'; text: string; idx: number; key: boolean; size: number; x: number; y: number; w: number; h: number; row: number};

/** em advance of a text in her heavy font (the caller measures: canvas in the browser, timeline em in node). */
export type Measure = (text: string, kind: Item['kind'], idx: number) => number;

const plane = (size: number, em: number) => ({w: (size / CAP) * (em + 2 * PAD_EM), h: (size / CAP) * TEX_EM});

/** Lay out one line block. Words of the line in order; sub = its romaji + English (or none). */
export function blockLayout(words: Word3[], sub: LyricSub | undefined, L: Lyrics, measure: Measure): Item[] {
  const keyScale = L.keyScale ?? KEY;
  type Raw = Omit<Item, 'x' | 'y' | 'row'>;
  const main: Raw[] = words.map((w) => {
    let size = L.size * (w.key ? keyScale : 1);
    let p = plane(size, measure(w.w, 'main', w.idx));
    if (p.w > L.width) { size *= L.width / p.w; p = plane(size, measure(w.w, 'main', w.idx)); }   // never past its surface
    return {kind: 'main', text: w.w, idx: w.idx, key: w.key, size, w: p.w, h: p.h};
  });
  const subRow = (kind: 'roma' | 'en', text: string): Raw[] => text.split(/\s+/).filter(Boolean).map((t, i) => {
    let size = L.size * SUB;
    let p = plane(size, measure(t, kind, i));
    if (p.w > L.width) { size *= L.width / p.w; p = plane(size, measure(t, kind, i)); }
    return {kind, text: t, idx: i, key: false, size, w: p.w, h: p.h};
  });
  const groups: Raw[][] = [main];
  if (sub?.roma) groups.push(subRow('roma', sub.roma));
  if (sub?.en) groups.push(subRow('en', sub.en));
  // wrap every group into rows at the surface width; words touch (their padding is the gap)
  const rows: {items: Raw[]; group: number}[] = [];
  groups.forEach((g, gi) => {
    let cur: Raw[] = [], rw = 0;
    for (const it of g) {
      const gap = it.kind === 'main' ? 0 : it.size * 0.28;          // Latin sub rows need a word space
      if (cur.length && rw + gap + it.w > L.width) { rows.push({items: cur, group: gi}); cur = []; rw = 0; }
      rw += (cur.length ? gap : 0) + it.w;
      cur.push(it);
    }
    if (cur.length) rows.push({items: cur, group: gi});
  });
  const rowH = rows.map((r) => Math.max(...r.items.map((i) => (i.size / CAP) * (i.kind === 'main' ? 1.12 : 1.2))));
  const groupGap = L.size * 0.35;
  const gapsBefore = rows.map((r, i) => (i > 0 && rows[i - 1].group !== r.group ? groupGap : 0));
  const total = rowH.reduce((a, b) => a + b, 0) + gapsBefore.reduce((a, b) => a + b, 0);
  const out: Item[] = [];
  let y = total / 2;
  rows.forEach((r, ri) => {
    y -= gapsBefore[ri] + rowH[ri] / 2;
    const gap = r.items[0].kind === 'main' ? 0 : r.items[0].size * 0.28;
    const W = r.items.reduce((a, i) => a + i.w, 0) + gap * (r.items.length - 1);
    let x = -W / 2;
    for (const it of r.items) { out.push({...it, x: x + it.w / 2, y, row: ri}); x += it.w + gap; }
    y -= rowH[ri] / 2;
  });
  return out;
}

/** The block's rotation on its surface: facing (rotY), tilt (lie on a floor / lean back), roll (follow the diagonal). */
export function blockRotation(L: Lyrics): THREE.Euler {
  const d = Math.PI / 180;
  return new THREE.Euler((L.tilt ?? 0) * d, L.rotY * d, (L.roll ?? 0) * d, 'YXZ');
}

/** The romaji words visible when k of n sung words are out (romaji follows the voice). */
export function romaShown(k: number, n: number, m: number): number {
  return n <= 0 ? m : Math.min(m, Math.ceil((k / n) * m));
}

export const subOf = (L: Lyrics, line: number): LyricSub | undefined => L.subs?.[String(line)];
