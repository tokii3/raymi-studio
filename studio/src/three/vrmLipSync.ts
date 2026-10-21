/** Approximate mouth shapes from the already aligned lyric words and VRM vowel presets. */
export type TimedLyricWord = {roma?: string; w?: string; t0: number; t1: number};
export type VrmMouthKey = {f: number; values: Partial<Record<'a' | 'i' | 'u' | 'e' | 'o', number>>};

const vowels = new Set(['a', 'i', 'u', 'e', 'o']);

function vowelShape(group: string): VrmMouthKey['values'] {
  const g = group.toLowerCase();
  if (g.includes('oo') || g.includes('ou')) return {u: 0.9};
  if (g.includes('ow')) return {o: 0.45, u: 0.6};
  if (g.includes('ai') || g.includes('ay') || g.includes('ei') || g.includes('ey')) return {e: 0.62, i: 0.48};
  if (g.includes('oi') || g.includes('oy')) return {o: 0.6, i: 0.5};
  if (g.includes('ee')) return {i: 0.9};
  if (g.includes('au')) return {a: 0.55, u: 0.42};
  const letter = [...g].find((c) => vowels.has(c)) ?? (g.includes('y') ? 'i' : 'a');
  return {[letter]: 1};
}

function consonantShape(group: string, next: VrmMouthKey['values'] | undefined): VrmMouthKey['values'] {
  const g = group.toLowerCase();
  if (/[bmp]/.test(g)) return {}; // brief lip closure; this VRM has no native closed-mouth viseme
  if (/[szfv]/.test(g) || /(th|sh|ch|j)/.test(g)) return {i: 0.38}; // narrower teeth/tongue approximation
  if (/[wn]/.test(g)) return {u: 0.16, i: 0.12};
  if (next) return Object.fromEntries(Object.entries(next).map(([k, v]) => [k, (v ?? 0) * 0.22])) as VrmMouthKey['values'];
  return {};
}

/** Build smooth, deterministic VRM mouth keys in clip-local frames from tracked romanized words. */
export function makeVrmMouthKeys(words: TimedLyricWord[], fps: number, excerptStartSeconds: number): VrmMouthKey[] {
  const byFrame = new Map<number, VrmMouthKey['values']>();
  const put = (frame: number, values: VrmMouthKey['values']) => byFrame.set(Math.max(0, Math.round(frame)), values);
  for (const word of words) {
    const from = (word.t0 - excerptStartSeconds) * fps;
    const to = (word.t1 - excerptStartSeconds) * fps;
    if (to <= 0 || from < -1 || to <= from) continue;
    const spelling = (word.roma || word.w || '').toLowerCase().replace(/[^a-z]/g, '');
    if (!spelling) continue;
    const groups = spelling.match(/[aeiouy]+|[^aeiouy]+/g) ?? [];
    const shapes = groups.map((g, i) => /[aeiouy]/.test(g)
      ? vowelShape(g)
      : consonantShape(g, groups.slice(i + 1).find((x) => /[aeiouy]/.test(x)) ? vowelShape(groups.slice(i + 1).find((x) => /[aeiouy]/.test(x))!) : undefined));
    const weights = groups.map((g) => /[aeiouy]/.test(g) ? 1 : 0.38);
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

/** Interpolate between keys so mouth movement stays smooth at video frame rate. */
export function vrmMouthAt(keys: VrmMouthKey[], f: number): VrmMouthKey['values'] {
  if (!keys.length || f < keys[0].f) return {};
  let i = 0;
  while (i < keys.length - 1 && keys[i + 1].f < f) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const t = a === b ? 0 : Math.max(0, Math.min(1, (f - a.f) / Math.max(1, b.f - a.f)));
  const out: VrmMouthKey['values'] = {};
  for (const v of ['a', 'i', 'u', 'e', 'o'] as const) {
    const n = (a.values[v] ?? 0) + ((b.values[v] ?? 0) - (a.values[v] ?? 0)) * t;
    if (n > 0.015) out[v] = n;
  }
  return out;
}
