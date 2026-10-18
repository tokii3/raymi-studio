// node --test test/   - the cut-edge guard (hard rule 9) catches a cut edge in frame and lets a clean one pass.
import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL, fileURLToPath} from 'node:url';
import {build} from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(os.tmpdir(), `raymi-check-test-${process.pid}.mjs`);
await build({entryPoints: [path.join(here, '../src/film/check.ts')], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error'});
const {checkFilm} = await import(pathToFileURL(out).href);
const {puppetAt, cameraAt, ease} = await import(pathToFileURL(out).href).then(async () => {
  const o2 = out.replace('.mjs', '-m.mjs');
  await build({entryPoints: [path.join(here, '../src/film/motion.ts')], bundle: true, format: 'esm', platform: 'node', outfile: o2, logLevel: 'error'});
  return import(pathToFileURL(o2).href);
});

const key = (cuts, pos = [0, 0, 0]) => ({f: 0, sprite: 'sprites/x.png', size: [900, 1500], cuts, top: 0.04, feet: 0.98, pos,
  height: 1.55, act: 'idle', move: 0, arc: 0});
const film = (cuts, cam) => ({width: 1920, height: 1080, fps: 30, durationInFrames: 10, hits: [], shots: [{id: 's1', from: 0, to: 10,
  camera: [{f: 0, ...cam}], kick: 0, puppets: [key(cuts)]}]});
const wide = {pos: [0, 1, 6], look: [0, 1, 0], fov: 35};
const close = {pos: [0, 0.9, 0.6], look: [0, 0.9, 0], fov: 35};   // only her middle in frame

test('a cut top edge in a wide shot is refused', () => {
  const f = checkFilm(film(['top'], wide));
  assert.ok(f.length > 0 && f[0].side === 'top');
});

test('the same sprite is fine when the cut edges are outside the frame', () => {
  assert.equal(checkFilm(film(['top', 'left', 'right'], close)).length, 0);
});

test('a cut bottom below an opaque floor is hidden', () => {
  const props = film(['bottom'], wide);
  props.shots[0].puppets[0].pos = [0, -0.4, 0];
  assert.equal(checkFilm(props).length, 0);
});

test('a clean sprite is always allowed', () => {
  assert.equal(checkFilm(film([], wide)).length, 0);
});

test('puppet: held pose, a fast move smears and lands', () => {
  const keys = [key([], [-1, 0, 0]), {...key([], [1, 0, 0]), f: 20, move: 6, arc: 0.4, ease: 'snap'}];
  assert.deepEqual(puppetAt(keys, 5).pos, [-1, 0, 0]);
  const mid = puppetAt(keys, 16);
  assert.ok(mid.smear > 0.3 && mid.lift > 0);
  assert.deepEqual(puppetAt(keys, 25).pos, [1, 0, 0]);
});

test('camera keys interpolate and ease', () => {
  const c = cameraAt([{f: 0, pos: [0, 0, 10], look: [0, 0, 0], fov: 40}, {f: 10, pos: [0, 0, 0], look: [0, 0, 0], fov: 20, ease: 'linear'}], 5);
  assert.ok(Math.abs(c.pos[2] - 5) < 0.05 && Math.abs(c.fov - 30) < 1e-9);
  assert.equal(ease('hold', 0.99), 0);
});

test('lyrics guard: a line anchored off-screen is refused, a centred one passes', async () => {
  const o3 = out.replace('.mjs', '-l.mjs');
  await build({entryPoints: [path.join(here, '../src/film/check.ts')], bundle: true, format: 'esm', platform: 'node', outfile: o3, logLevel: 'error'});
  const {lyricsOutOfFrame} = await import(pathToFileURL(o3).href);
  const mk = (anchor) => ({width: 1920, height: 1080, fps: 30, durationInFrames: 60, hits: [], shots: [{id: 's', from: 0, to: 60,
    camera: [{f: 0, pos: [0, 1, 6], look: [0, 1, 0], fov: 35}], kick: 0, puppets: [],
    lyrics: {kind: 'sign', anchor, rotY: 0, size: 0.3, width: 4, color: '#fff', accent: '#fc0', outline: '#000', lit: false},
    words: [{w: 'You', from: 0, to: 10, key: false, line: 0, idx: 0}, {w: 'KING', from: 10, to: 30, key: true, line: 0, idx: 1}]}]});
  assert.equal(lyricsOutOfFrame(mk([0, 1.5, 0])).length, 0);
  assert.ok(lyricsOutOfFrame(mk([0, 3.4, 0])).length > 0);
});
