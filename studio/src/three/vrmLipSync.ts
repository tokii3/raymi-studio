// Raymi sings along: mouth shapes from the measured lyric words (lyrics_timed.json) and the vocal stem's loudness.
//
// v2 (toki 2026-10-22): by SOUND, not by letters. Each word becomes phonemes (English: rules + a small dictionary,
// Japanese: its romaji, which is already phonetic), each phoneme a viseme on her VRM: the vowel presets a/i/u/e/o
// plus her raw `Fcl_MTH_Close` morph for m / b / p (lips really meet). Nothing goes to 100 %: every shape has a cap
// (a wide-open mouth looks shouted, not sung), the vocal loudness scales the opening, consonants lean into the next
// vowel (coarticulation), the mouth leads the sound by two frames, and a per-frame attack / release smooths it.
// Pure math: the renderer and the tests (test/lipsync.test.mjs) call the same functions.

export type TimedLyricWord = {roma?: string; w?: string; t0: number; t1: number};
export type Viseme = 'a' | 'i' | 'u' | 'e' | 'o' | 'close';
export type MouthValues = Partial<Record<Viseme, number>>;
export type VrmMouthKey = {f: number; values: MouthValues};
export type LipSyncOpts = {
  version?: 'v1' | 'v2';
  env?: number[] | null;       // vocal loudness per clip frame, 0..1 (studio/clip.mjs measures it from the stem)
  caps?: MouthValues;          // the most each shape may open
  gain?: number;               // whole-mouth scale (a whispered verse 0.6, a belted chorus 1.1)
  lead?: number;               // frames the mouth moves before the sound
};

const VISEMES: Viseme[] = ['a', 'i', 'u', 'e', 'o', 'close'];
// the most each shape may open (VRoid A at 1.0 is a shout); close is lips pressed and may go to 1
export const DEFAULT_CAPS: Required<MouthValues> = {a: 0.6, i: 0.45, u: 0.48, e: 0.5, o: 0.55, close: 1};
const REACH = 1.6;

// ------------------------------------------------------------------ phonemes
// ARPAbet-like symbols, only what changes the mouth
type Ph = string;

const PH: Record<Ph, MouthValues> = {
  AA: {a: 1}, AE: {a: 0.72, e: 0.38}, AH: {a: 0.6, e: 0.12}, AO: {o: 0.85, a: 0.25}, EH: {e: 0.95},
  IH: {i: 0.75, e: 0.2}, IY: {i: 1}, UH: {u: 0.7, o: 0.15}, UW: {u: 1}, OW: {o: 1}, ER: {o: 0.4, u: 0.35},
  AX: {a: 0.38, e: 0.12},                               // schwa: small and lazy
  JU: {u: 0.6, i: 0.25},                                // Japanese u is not rounded
  M: {close: 1}, B: {close: 1}, P: {close: 1},
  F: {close: 0.42, i: 0.22}, V: {close: 0.42, i: 0.22},
  W: {u: 0.85},
  SH: {u: 0.38, i: 0.3}, CH: {u: 0.36, i: 0.3}, JH: {u: 0.36, i: 0.3}, ZH: {u: 0.36, i: 0.3},
  S: {i: 0.36, e: 0.08}, Z: {i: 0.36, e: 0.08}, T: {i: 0.3, e: 0.1}, D: {i: 0.3, e: 0.1}, N: {i: 0.26, e: 0.08},
  TH: {e: 0.3, i: 0.1}, DH: {e: 0.26, i: 0.1}, L: {e: 0.3, a: 0.1},
  R: {u: 0.38, o: 0.15}, Y: {i: 0.55},
  K: {}, G: {}, NG: {}, HH: {},                         // the tongue works, the lips follow the neighbouring vowel
  Q: {},                                                // a held stop (Japanese small tsu): the mouth waits
};
const VOWEL = new Set(['AA', 'AE', 'AH', 'AO', 'EH', 'IH', 'IY', 'UH', 'UW', 'OW', 'ER', 'AX', 'JU']);
const LIPS = new Set(['M', 'B', 'P', 'F', 'V', 'W']);  // shapes that must really show, never diluted by the vowel
const DIPHTHONG: Record<string, [Ph, Ph]> = {AY: ['AA', 'IY'], EY: ['EH', 'IY'], OY: ['OW', 'IY'], AW: ['AA', 'UW'], OU: ['OW', 'UW']};

// frequent song words the rules get wrong (spelling is not sound)
const DICT: Record<string, string> = {
  i: 'AY', im: 'AY M', ive: 'AY V', ill: 'AY L', id: 'AY D', a: 'AX', the: 'DH AX', to: 'T UW', too: 'T UW', two: 'T UW',
  you: 'Y UW', your: 'Y AO R', youre: 'Y AO R', me: 'M IY', my: 'M AY', we: 'W IY', be: 'B IY', he: 'HH IY', she: 'SH IY',
  of: 'AH V', one: 'W AH N', once: 'W AH N S', do: 'D UW', does: 'D AH Z', done: 'D AH N', who: 'HH UW', what: 'W AH T',
  have: 'HH AE V', give: 'G IH V', live: 'L IH V', love: 'L AH V', come: 'K AH M', some: 'S AH M', are: 'AA R',
  were: 'W ER', where: 'W EH R', there: 'DH EH R', their: 'DH EH R', here: 'HH IY R', no: 'N OW', so: 'S OW', go: 'G OW',
  oh: 'OW', ooh: 'UW', ah: 'AA', yeah: 'Y EH', said: 'S EH D', says: 'S EH Z', again: 'AX G EH N', been: 'B IH N',
  could: 'K UH D', would: 'W UH D', should: 'SH UH D', put: 'P UH T', want: 'W AA N T', mountain: 'M AW N T AX N',
  beach: 'B IY CH', take: 'T EY K', can: 'K AE N', cant: 'K AE N T', dont: 'D OW N T', all: 'AO L', call: 'K AO L',
  away: 'AX W EY', any: 'EH N IY', many: 'M EH N IY', heart: 'HH AA R T', eye: 'AY', eyes: 'AY Z', fire: 'F AY ER',
  through: 'TH R UW', though: 'DH OW', thought: 'TH AO T', know: 'N OW', knew: 'N UW', night: 'N AY T', right: 'R AY T',
  life: 'L AY F', time: 'T AY M', world: 'W ER L D', wanna: 'W AA N AX', gonna: 'G AA N AX', gotta: 'G AA T AX',
  baby: 'B EY B IY', people: 'P IY P AX L', every: 'EH V R IY', everything: 'EH V R IY TH IH NG', crazy: 'K R EY Z IY',
};

/** English word -> phonemes by spelling rules (good enough for the MOUTH: only visible classes matter). */
export function englishPhonemes(word: string): Ph[] {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return [];
  if (DICT[w]) return expand(DICT[w].split(' '));
  if (w.endsWith('s') && DICT[w.slice(0, -1)]) return [...expand(DICT[w.slice(0, -1)].split(' ')), 'Z'];
  const out: Ph[] = [];
  const vowelAt = (j: number) => j >= 0 && j < w.length && 'aeiou'.includes(w[j]);
  // magic e: a final e after a single consonant lengthens the vowel before it (take, time, home, cute)
  const magic = w.length > 2 && w.endsWith('e') && !vowelAt(w.length - 2) && vowelAt(w.length - 3) && !vowelAt(w.length - 4);
  const longOf: Record<string, Ph[]> = {a: ['EY'], e: ['IY'], i: ['AY'], o: ['OW'], u: ['UW']};
  let i = 0;
  const take = (s: string) => w.startsWith(s, i);
  while (i < w.length) {
    const rest = w.length - i;
    const prev = w[i - 1];
    if (i === 0 && (take('kn') || take('wr'))) { out.push(take('kn') ? 'N' : 'R'); i += 2; continue; }
    if (take('tch')) { out.push('CH'); i += 3; continue; }
    if (take('igh')) { out.push('AY'); i += 3; continue; }
    if (take('eigh')) { out.push('EY'); i += 4; continue; }
    if (take('ough')) { out.push('OW'); i += 4; continue; }
    if (take('tion')) { out.push('SH', 'AX', 'N'); i += 4; continue; }
    const two: Record<string, Ph[]> = {sh: ['SH'], ch: ['CH'], th: ['TH'], ph: ['F'], ng: ['NG'], ck: ['K'], qu: ['K', 'W'],
      wh: ['W'], ee: ['IY'], ea: ['IY'], ie: ['IY'], oo: ['UW'], ou: ['AW'], ow: ['OW'], oa: ['OW'], ai: ['EY'], ay: ['EY'],
      ey: ['EY'], oi: ['OY'], oy: ['OY'], au: ['AO'], aw: ['AO'], ew: ['UW'], ue: ['UW'], gh: []};
    const pair = w.slice(i, i + 2);
    if (pair === 'ie' && rest === 2 && w.length <= 3) { out.push('AY'); i += 2; continue; }   // die, lie, tie
    if (pair === 'ow' && (rest === 2 || w[i + 2] === 'n') && 'hndwbt'.includes(prev ?? '')) { out.push('AW'); i += 2; continue; }   // now, how, down, town
    if (two[pair]) { out.push(...two[pair]); i += 2; continue; }
    if ((pair === 'er' || pair === 'ir' || pair === 'ur') && (rest === 2 || !vowelAt(i + 2))) { out.push('ER'); i += 2; continue; }
    if (pair === 'ar' && !vowelAt(i + 2)) { out.push('AA', 'R'); i += 2; continue; }
    if (pair === 'or' && !vowelAt(i + 2)) { out.push('AO', 'R'); i += 2; continue; }
    if (rest === 2 && pair === 'le' && i > 0 && !vowelAt(i - 1)) { out.push('AX', 'L'); i += 2; continue; }
    const c = w[i];
    if (c === prev && !'aeiou'.includes(c)) { i++; continue; }   // doubled consonant: one sound
    if (c === 'e' && i === w.length - 1 && w.length > 2) { i++; continue; }   // silent final e
    if (c === 'y') {
      if (i === 0 || vowelAt(i + 1)) out.push('Y');
      else out.push(/[aeiou]/.test(w.slice(0, i)) ? 'IY' : 'AY');   // happy vs my / fly
      i++; continue;
    }
    if ('aeiou'.includes(c)) {
      if (magic && i === w.length - 3) out.push(...longOf[c]);
      else if (c === 'o' && rest === 1) out.push('OW');           // go, so, hello
      else if (c === 'e' && rest === 1) out.push('IY');           // me, be
      else out.push(({a: 'AE', e: 'EH', i: 'IH', o: 'AA', u: 'AH'} as Record<string, Ph>)[c]);
      i++; continue;
    }
    const one: Record<string, Ph[]> = {b: ['B'], d: ['D'], f: ['F'], h: ['HH'], j: ['JH'], k: ['K'], l: ['L'], m: ['M'], n: ['N'],
      p: ['P'], r: ['R'], s: ['S'], t: ['T'], v: ['V'], w: ['W'], x: ['K', 'S'], z: ['Z']};
    if (c === 'c') { out.push('eiy'.includes(w[i + 1] ?? '') ? 'S' : 'K'); i++; continue; }
    if (c === 'g') { out.push('G'); i++; continue; }
    out.push(...(one[c] ?? [])); i++;
  }
  return expand(out);
}

/** Japanese romaji (Hepburn, from pykakasi) -> phonemes. Syllable = consonants + vowel; n alone = N. */
export function romajiPhonemes(roma: string): Ph[] {
  const r = roma.toLowerCase().replace(/[^a-z]/g, '');
  const out: Ph[] = [];
  const V: Record<string, Ph> = {a: 'AA', i: 'IY', u: 'JU', e: 'EH', o: 'OW'};
  let i = 0;
  while (i < r.length) {
    const c = r[i];
    if (V[c]) { out.push(V[c]); i++; continue; }
    if (c === 'n' && !V[r[i + 1] ?? ''] && r[i + 1] !== 'y') { out.push('N'); i++; continue; }
    if (c === r[i + 1] && c !== 'n') { out.push('Q'); i++; continue; }       // small tsu: a held stop
    const cons: [string, Ph[]][] = [['tsu', ['S']], ['ts', ['S']], ['sh', ['SH']], ['ch', ['CH']], ['j', ['JH']], ['f', ['F']],
      ['ky', ['K', 'Y']], ['gy', ['G', 'Y']], ['ny', ['N', 'Y']], ['hy', ['HH', 'Y']], ['my', ['M', 'Y']], ['ry', ['R', 'Y']],
      ['by', ['B', 'Y']], ['py', ['P', 'Y']]];
    const hit = cons.find(([k]) => r.startsWith(k, i) && k !== 'tsu');
    if (hit) { out.push(...hit[1]); i += hit[0].length; continue; }
    const one: Record<string, Ph> = {k: 'K', g: 'G', s: 'S', z: 'Z', t: 'T', d: 'D', n: 'N', h: 'HH', b: 'B', p: 'P', m: 'M', y: 'Y', r: 'R', w: 'W', v: 'V'};
    if (one[c]) out.push(one[c]);
    i++;
  }
  return out;
}

function expand(ps: Ph[]): Ph[] {
  return ps.flatMap((p) => DIPHTHONG[p] ?? [p]);
}

const isJapanese = (s: string) => /[぀-ヿ㐀-鿿가-힯]/.test(s);   // kana, kanji, Hangul: read by their romanisation

export function wordPhonemes(word: TimedLyricWord): Ph[] {
  const w = word.w ?? '';
  if (isJapanese(w)) return romajiPhonemes(word.roma ?? '');
  return englishPhonemes(w || word.roma || '');
}

// ------------------------------------------------------------------ timing + shapes
type Seg = {s: number; e: number; ph: Ph};

/** Phoneme segments in seconds: consonants get a short real time, vowels share the rest (a sung note sits on its vowel). */
function segments(word: TimedLyricWord): Seg[] {
  const ps = wordPhonemes(word);
  if (!ps.length) return [];
  const span = Math.max(0.04, word.t1 - word.t0);
  const nCons = ps.filter((p) => !VOWEL.has(p)).length;
  const nVow = ps.length - nCons;
  const consT = nVow ? Math.min(0.075, (span * 0.45) / Math.max(1, nCons)) : span / ps.length;
  // a diphthong's second half and the schwa are shorter than a full vowel
  const vw: number[] = ps.map((p, i) => (!VOWEL.has(p) ? 0 : p === 'AX' ? 0.6 : (i > 0 && VOWEL.has(ps[i - 1]) ? 0.55 : 1)));
  const vSum = vw.reduce((a, b) => a + b, 0) || 1;
  const vowT = Math.max(0, span - consT * nCons);
  const out: Seg[] = [];
  let t = word.t0;
  ps.forEach((p, i) => {
    const d = VOWEL.has(p) ? (vowT * vw[i]) / vSum : consT;
    out.push({s: t, e: t + d, ph: p});
    t += d;
  });
  return out;
}

function nextVowel(segs: Seg[], i: number, within = 0.25): Seg | undefined {
  for (let j = i + 1; j < segs.length; j++) {
    if (segs[j].s - segs[i].e > within) return undefined;
    if (VOWEL.has(segs[j].ph)) return segs[j];
  }
  return undefined;
}

function prevVowel(segs: Seg[], i: number, within = 0.12): Seg | undefined {
  for (let j = i - 1; j >= 0; j--) {
    if (segs[i].s - segs[j].e > within) return undefined;
    if (VOWEL.has(segs[j].ph)) return segs[j];
  }
  return undefined;
}

const add = (o: MouthValues, v: MouthValues, k: number) => {
  for (const n of VISEMES) if (v[n]) o[n] = (o[n] ?? 0) + (v[n] as number) * k;
};

/** Per-frame mouth for the whole clip (frame 0 = excerptStartSeconds). */
export function mouthFrames(words: TimedLyricWord[], fps: number, excerptStartSeconds: number, frames: number,
  opts: LipSyncOpts = {}): MouthValues[] {
  const caps = {...DEFAULT_CAPS, ...(opts.caps ?? {})};
  const gain = opts.gain ?? 1;
  const lead = opts.lead ?? 2;
  const segs = words.slice().sort((a, b) => a.t0 - b.t0).flatMap(segments);
  // 1. the target shape per frame (relative 0..1, before caps)
  const target: MouthValues[] = [];
  let j = 0;
  for (let f = 0; f < frames; f++) {
    const t = excerptStartSeconds + (f + lead) / fps;
    while (j < segs.length - 1 && segs[j].e <= t) j++;
    const o: MouthValues = {};
    const seg = segs[j];
    if (seg && t >= seg.s && t < seg.e) {
      const base = PH[seg.ph] ?? {};
      if (VOWEL.has(seg.ph) || LIPS.has(seg.ph)) add(o, base, 1);
      else {
        // tongue consonants: their own small shape, half-way into the vowel that follows (or stays from before)
        add(o, base, 0.55);
        const v = nextVowel(segs, j) ?? prevVowel(segs, j);
        if (v) add(o, PH[v.ph], 0.45);
      }
      // lips close for m / b / p even while the vowel shapes fade
      if (LIPS.has(seg.ph) && seg.ph !== 'W') { const v = nextVowel(segs, j); if (v) add(o, PH[v.ph], 0.12); }
    } else {
      // between words: a short gap keeps a hint of the last vowel (singers do not snap shut), a pause rests
      const prev = seg && t >= seg.e ? seg : segs[j - 1];
      if (prev && t - prev.e < 0.14 && VOWEL.has(prev.ph)) add(o, PH[prev.ph], 0.3 * (1 - (t - prev.e) / 0.14));
    }
    target.push(o);
  }
  // 2. loudness scales the opening (never the lip closure); 3. attack / release smoothing; 4. caps
  const env = opts.env ?? null;
  const out: MouthValues[] = [];
  const cur: Record<Viseme, number> = {a: 0, i: 0, u: 0, e: 0, o: 0, close: 0};
  for (let f = 0; f < frames; f++) {
    const loud = env ? Math.max(0, Math.min(1, env[Math.min(env.length - 1, f + lead)] ?? 0)) : 0.8;
    const open = (0.55 + 0.45 * loud) * gain;
    const o: MouthValues = {};
    for (const n of VISEMES) {
      const want = (target[f][n] ?? 0) * (n === 'close' ? 1 : open);
      const k = n === 'close' ? (want > cur[n] ? 0.8 : 0.6) : (want > cur[n] ? 0.6 : 0.42);
      cur[n] += (want - cur[n]) * k;
      // toki 2026-10-24 ("keine Mundsynchro"): sung syllables are short - the smoothed value rarely reaches its target,
      // the mouth stayed at 20-40 % and read as closed. REACH lifts it so a sung vowel meets its cap (never 100 %).
      const v = Math.min(caps[n], cur[n] * caps[n] * (n === 'close' ? 1 : REACH));
      if (v > 0.012) o[n] = Math.round(v * 1000) / 1000;
    }
    // pressed lips leave no room for an open vowel
    if (o.close) for (const n of ['a', 'i', 'u', 'e', 'o'] as const) if (o[n]) o[n] = Math.round(o[n]! * (1 - 0.85 * o.close) * 1000) / 1000;
    out.push(o);
  }
  return out;
}

// ------------------------------------------------------------------ v1 (2026-10-21, by letters) - kept for comparison
const v1Vowels = new Set(['a', 'i', 'u', 'e', 'o']);
function v1VowelShape(group: string): MouthValues {
  const g = group.toLowerCase();
  if (g.includes('oo') || g.includes('ou')) return {u: 0.9};
  if (g.includes('ow')) return {o: 0.45, u: 0.6};
  if (g.includes('ai') || g.includes('ay') || g.includes('ei') || g.includes('ey')) return {e: 0.62, i: 0.48};
  if (g.includes('oi') || g.includes('oy')) return {o: 0.6, i: 0.5};
  if (g.includes('ee')) return {i: 0.9};
  if (g.includes('au')) return {a: 0.55, u: 0.42};
  const letter = [...g].find((c) => v1Vowels.has(c)) ?? (g.includes('y') ? 'i' : 'a');
  return {[letter]: 1};
}
function v1ConsonantShape(group: string, next: MouthValues | undefined): MouthValues {
  const g = group.toLowerCase();
  if (/[bmp]/.test(g)) return {};
  if (/[szfv]/.test(g) || /(th|sh|ch|j)/.test(g)) return {i: 0.38};
  if (/[wn]/.test(g)) return {u: 0.16, i: 0.12};
  if (next) return Object.fromEntries(Object.entries(next).map(([k, v]) => [k, (v ?? 0) * 0.22])) as MouthValues;
  return {};
}
function v1Keys(words: TimedLyricWord[], fps: number, excerptStartSeconds: number): VrmMouthKey[] {
  const byFrame = new Map<number, MouthValues>();
  const put = (frame: number, values: MouthValues) => byFrame.set(Math.max(0, Math.round(frame)), values);
  for (const word of words) {
    const from = (word.t0 - excerptStartSeconds) * fps;
    const to = (word.t1 - excerptStartSeconds) * fps;
    if (to <= 0 || from < -1 || to <= from) continue;
    const spelling = (word.roma || word.w || '').toLowerCase().replace(/[^a-z]/g, '');
    if (!spelling) continue;
    const groups = spelling.match(/[aeiouy]+|[^aeiouy]+/g) ?? [];
    const isV = (g: string) => /[aeiouy]/.test(g);
    const shapes = groups.map((g, i) => {
      const nv = groups.slice(i + 1).find(isV);
      return isV(g) ? v1VowelShape(g) : v1ConsonantShape(g, nv ? v1VowelShape(nv) : undefined);
    });
    const weights = groups.map((g) => (isV(g) ? 1 : 0.38));
    const sum = weights.reduce((a, b) => a + b, 0);
    const span = Math.max(1, to - from);
    let cursor = Math.max(0, from);
    put(cursor, {});
    for (let i = 0; i < groups.length; i++) {
      const len = span * weights[i] / sum;
      put(cursor + len * 0.5, shapes[i]);
      cursor += len;
    }
    put(to + 1, {});
  }
  return [...byFrame.entries()].sort((a, b) => a[0] - b[0]).map(([f, values]) => ({f, values}));
}

/** Mouth keys for a clip: v2 (default) = one key per frame from mouthFrames; v1 = the letter-based keys of 2026-10-21. */
export function makeVrmMouthKeys(words: TimedLyricWord[], fps: number, excerptStartSeconds: number,
  frames?: number, opts: LipSyncOpts = {}): VrmMouthKey[] {
  if (opts.version === 'v1') return v1Keys(words, fps, excerptStartSeconds);
  const n = frames ?? Math.ceil((Math.max(0, ...words.map((w) => w.t1)) - excerptStartSeconds) * fps) + fps;
  return mouthFrames(words, fps, excerptStartSeconds, Math.max(0, n), opts).map((values, f) => ({f, values}));
}

/** Interpolate between keys so mouth movement stays smooth at video frame rate. */
export function vrmMouthAt(keys: VrmMouthKey[], f: number): MouthValues {
  if (!keys.length || f < keys[0].f) return {};
  let lo = 0, hi = keys.length - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (keys[m].f <= f) lo = m; else hi = m - 1; }
  const a = keys[lo], b = keys[Math.min(lo + 1, keys.length - 1)];
  const t = a === b ? 0 : Math.max(0, Math.min(1, (f - a.f) / Math.max(1, b.f - a.f)));
  const out: MouthValues = {};
  for (const v of VISEMES) {
    const n = (a.values[v] ?? 0) + ((b.values[v] ?? 0) - (a.values[v] ?? 0)) * t;
    if (n > 0.012) out[v] = n;
  }
  return out;
}
