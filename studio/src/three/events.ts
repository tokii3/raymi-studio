// Timed set events: the compiler (raymi/timeline.py TIME_OPTS) turns the script's song seconds into film frames, so a
// set option like banks_off: [1998, 2034] or crowd_look: [[1550, 'left']] is read here the same way by every set.
import {ease} from '../film/motion';

/** Frames of a timed option: a number, a list of numbers, or a list of [frame, value] pairs (value dropped). */
export function frames(v: unknown): number[] {
  if (typeof v === 'number') return [v];
  if (!Array.isArray(v)) return [];
  if (v.length === 2 && typeof v[0] === 'number' && typeof v[1] === 'string') return [v[0]];
  return v.map((x) => (Array.isArray(x) ? x[0] : x)).filter((x): x is number => typeof x === 'number');
}

/** How many of the option's moments have happened by frame f ('all' = every one). */
export function passed(v: unknown, f: number, all = 99): number {
  if (v === 'all' || v === true) return all;
  return frames(v).filter((t) => t <= f).length;
}

/** Frames since the latest moment (Infinity before the first). */
export function since(v: unknown, f: number): number {
  const p = frames(v).filter((t) => t <= f);
  return p.length ? f - Math.max(...p) : Infinity;
}

/** The value of the latest [frame, value] pair reached, eased in over `dur` frames: {from, to, t}. */
export function stepValue<T>(v: unknown, f: number, dur = 6): {from: T | null; to: T | null; t: number} {
  if (!Array.isArray(v)) return {from: null, to: null, t: 1};
  const pairs = (v.length === 2 && typeof v[0] === 'number' ? [v] : v) as [number, T][];
  let from: T | null = null, to: T | null = null, at = -Infinity;
  for (const [t, x] of pairs) if (t <= f) { from = to; to = x; at = t; }
  return {from, to, t: ease('out', (f - at) / dur)};
}

/** A 0..1 flare that decays over n frames after each moment. */
export function flare(v: unknown, f: number, n = 6): number {
  const d = since(v, f);
  return d < n ? 1 - d / n : 0;
}
