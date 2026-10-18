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

test('lyrics guard: words over her face are refused unless lyrics.over says so', async () => {
  const o4 = out.replace('.mjs', '-f.mjs');
  await build({entryPoints: [path.join(here, '../src/film/check.ts')], bundle: true, format: 'esm', platform: 'node', outfile: o4, logLevel: 'error'});
  const {lyricsOutOfFrame} = await import(pathToFileURL(o4).href);
  const mk = (over) => ({width: 1920, height: 1080, fps: 30, durationInFrames: 60, hits: [], shots: [{id: 's', from: 0, to: 60,
    camera: [{f: 0, pos: [0, 1, 6], look: [0, 1, 0], fov: 35}], kick: 0,
    puppets: [{...key([], [0, 0, 0]), head: [0.3, 0.04, 0.7, 0.3]}],
    lyrics: {kind: 'sign', anchor: [0, 1.35, 0.2], rotY: 0, size: 0.15, width: 2, color: '#fff', accent: '#fc0', outline: '#000', lit: false, over},
    words: [{w: 'KING', from: 0, to: 30, key: true, line: 0, idx: 0}]}]});
  assert.ok(lyricsOutOfFrame(mk(false)).some((x) => x.why === 'covers her face'));
  assert.equal(lyricsOutOfFrame(mk(true)).length, 0);
});

test('face guard: a head sliced by the frame edge is refused, fully in frame passes', async () => {
  const o5 = out.replace('.mjs', '-c.mjs');
  await build({entryPoints: [path.join(here, '../src/film/check.ts')], bundle: true, format: 'esm', platform: 'node', outfile: o5, logLevel: 'error'});
  const {faceCrops} = await import(pathToFileURL(o5).href);
  const mk = (x) => ({width: 1920, height: 1080, fps: 30, durationInFrames: 6, hits: [], shots: [{id: 's', from: 0, to: 6,
    camera: [{f: 0, pos: [0, 1.3, 3], look: [0, 1.3, 0], fov: 35}], kick: 0,
    puppets: [{...key([], [x, 0, 0]), head: [0.3, 0.04, 0.7, 0.3]}]}]});
  assert.equal(faceCrops(mk(0)).length, 0);
  assert.ok(faceCrops(mk(1.75)).length > 0);
});

test('set text guard: a sign held half out of frame is refused, fully in passes; lens guard: no camera under the sand', async () => {
  const o6 = out.replace('.mjs', '-t.mjs');
  await build({entryPoints: [path.join(here, '../src/film/check.ts')], bundle: true, format: 'esm', platform: 'node', outfile: o6, logLevel: 'error'});
  const {setTextCuts, lensInside} = await import(pathToFileURL(o6).href);
  const mk = (x, camY = 1) => ({width: 1920, height: 1080, fps: 30, durationInFrames: 30, hits: [], shots: [{id: 's', from: 0, to: 30,
    camera: [{f: 0, pos: [0, camY, 6], look: [0, 1, 0], fov: 35}], kick: 0, puppets: [],
    texts: [{name: 'sign', center: [x, 1, 0], size: [1, 0.5], rot: 0}],
    noLens: [{name: 'under the sand', min: [-9, -9, -9], max: [9, 0, 9]}]}]});
  assert.equal(setTextCuts(mk(0)).length, 0);
  assert.ok(setTextCuts(mk(3.35)).length > 0);
  assert.equal(lensInside(mk(0)).length, 0);
  assert.ok(lensInside(mk(0, -0.5)).length > 0);
});

test('solid guard: the lens inside a prop and her face hidden behind one are refused', async () => {
  const o7 = out.replace('.mjs', '-s.mjs');
  await build({entryPoints: [path.join(here, '../src/film/check.ts')], bundle: true, format: 'esm', platform: 'node', outfile: o7, logLevel: 'error'});
  const {solidFaults} = await import(pathToFileURL(o7).href);
  const mk = (box, camZ = 6) => ({width: 1920, height: 1080, fps: 30, durationInFrames: 30, hits: [], shots: [{id: 's', from: 0, to: 30,
    camera: [{f: 0, pos: [0, 1.3, camZ], look: [0, 1.3, 0], fov: 35}], kick: 0,
    puppets: [{...key([], [0, 0, 0]), head: [0.3, 0.04, 0.7, 0.3]}], solids: [{name: 'rock', center: box, size: [1, 1, 1]}]}]});
  assert.equal(solidFaults(mk([3, 0.5, 0])).length, 0);
  assert.ok(solidFaults(mk([0, 1.4, 3])).length > 0);          // in front of her face
  assert.ok(solidFaults(mk([0, 1.3, 6])).length > 0);          // the lens inside it
});
