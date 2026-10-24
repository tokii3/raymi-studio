// Lip sync v2 (studio/src/three/vrmLipSync.ts): pure math, nothing is drawn. node --test test/lipsync.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {build} from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(os.tmpdir(), `raymi-lipsync-${process.pid}.mjs`);
await build({entryPoints: [path.join(here, '..', 'src', 'three', 'vrmLipSync.ts')], bundle: true, format: 'esm',
  platform: 'node', outfile: out, logLevel: 'error'});
const L = await import(pathToFileURL(out).href);
fs.rmSync(out, {force: true});

test('English words become sounds, not letters', () => {
  assert.deepEqual(L.englishPhonemes('take'), ['T', 'EH', 'IY', 'K']);       // magic e: EY diphthong
  assert.deepEqual(L.englishPhonemes('beach'), ['B', 'IY', 'CH']);
  assert.deepEqual(L.englishPhonemes('mountain'), ['M', 'AA', 'UW', 'N', 'T', 'AX', 'N']);
  assert.deepEqual(L.englishPhonemes('night'), ['N', 'AA', 'IY', 'T']);
  assert.deepEqual(L.englishPhonemes('shine'), ['SH', 'AA', 'IY', 'N']);
  assert.deepEqual(L.englishPhonemes('now'), ['N', 'AA', 'UW']);
  assert.deepEqual(L.englishPhonemes('happy'), ['HH', 'AE', 'P', 'IY']);
});

test('Japanese romaji is read as syllables', () => {
  assert.deepEqual(L.romajiPhonemes('tsuki'), ['S', 'JU', 'K', 'IY']);
  assert.deepEqual(L.romajiPhonemes('kitto'), ['K', 'IY', 'Q', 'T', 'OW']);
  assert.deepEqual(L.romajiPhonemes('umi'), ['JU', 'M', 'IY']);
  assert.deepEqual(L.romajiPhonemes('san'), ['S', 'AA', 'N']);
});

const words = [{w: 'Take', t0: 1.0, t1: 1.4}, {w: 'me', t0: 1.4, t1: 1.6}, {w: 'to', t0: 1.6, t1: 1.75}, {w: 'the', t0: 1.75, t1: 1.9},
  {w: 'beach', t0: 1.9, t1: 3.0}];

test('no shape ever goes to 100 % and the mouth rests in a pause', () => {
  const m = L.mouthFrames(words, 30, 0, 120, {env: Array(120).fill(1)});
  for (const v of m) for (const k of ['a', 'i', 'u', 'e', 'o']) assert.ok((v[k] ?? 0) <= L.DEFAULT_CAPS[k] + 1e-9, `${k} ${v[k]}`);
  assert.deepEqual(m[10], {});                    // 0.33 s: nothing sung yet
  assert.ok(Object.keys(m[110]).length === 0 || Object.values(m[110]).every((x) => x < 0.05));   // 3.67 s: rests again
});

test('m and b close the lips', () => {
  const m = L.mouthFrames(words, 30, 0, 120, {});
  const me = m.slice(41, 45).map((v) => v.close ?? 0);     // "me" starts at 1.4 s = frame 42 (2 frames lead)
  const beach = m.slice(56, 60).map((v) => v.close ?? 0);  // "beach" at 1.9 s = frame 57
  assert.ok(Math.max(...me) > 0.6, `me ${me}`);
  assert.ok(Math.max(...beach) > 0.6, `beach ${beach}`);
});

test('a long sung vowel holds its shape; loudness scales it', () => {
  const loud = L.mouthFrames(words, 30, 0, 120, {env: Array(120).fill(1)});
  const soft = L.mouthFrames(words, 30, 0, 120, {env: Array(120).fill(0)});
  const held = loud.slice(66, 86).map((v) => v.i ?? 0);    // "beach" IY held 2.2-2.85 s
  assert.ok(Math.min(...held) > 0.3, `held ${held}`);
  assert.ok((soft[75].i ?? 0) < (loud[75].i ?? 0));
});

test('frames are smooth: no shape jumps more than its cap in one frame', () => {
  const m = L.mouthFrames(words, 30, 0, 120, {});
  for (let f = 1; f < m.length; f++) for (const k of ['a', 'i', 'u', 'e', 'o']) {
    assert.ok(Math.abs((m[f][k] ?? 0) - (m[f - 1][k] ?? 0)) < 0.45, `${k} at ${f}`);
  }
});

test('v1 keys are still available for the side by side comparison', () => {
  const k = L.makeVrmMouthKeys(words, 30, 0, 120, {version: 'v1'});
  assert.ok(k.some((x) => (x.values.a ?? 0) === 1 || (x.values.e ?? 0) > 0.5));
});

test('a sung line opens her mouth visibly: open vowels reach most of their cap (toki 2026-10-24 "keine Mundsynchro")', () => {
  // "me to the beach" as sung in Beach (fast syllables, ~0.3 s each)
  const words = [{w: 'me', t0: 0.0, t1: 0.3}, {w: 'to', t0: 0.3, t1: 0.55}, {w: 'the', t0: 0.55, t1: 0.75}, {w: 'beach', t0: 0.75, t1: 1.3}];
  const keys = L.makeVrmMouthKeys(words, 30, 0, 45);
  const peak = (v) => Math.max(...keys.map((k) => k.values[v] ?? 0));
  const open = Math.max(peak('a'), peak('i'), peak('u'), peak('e'), peak('o'));
  assert.ok(open >= 0.4, `the widest vowel only reaches ${open.toFixed(2)}`);
  for (const [v, cap] of Object.entries(L.DEFAULT_CAPS)) assert.ok(peak(v) <= cap + 1e-9, `${v} over its cap`);
});
