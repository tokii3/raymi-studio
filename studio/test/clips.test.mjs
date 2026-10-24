// Her Mixamo clips on the real rig (toki 2026-10-23 "Raymi ist steif und bewegt sich nicht"): pure rig math, nothing
// is drawn. The clips are licensed and live only in the private assets repo - point RAYMI_MOTIONS at a folder with them
// (the cloud stages them in studio/.motions); without them the test is skipped.
// node --test test/clips.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {build} from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));
const DIR = process.env.RAYMI_MOTIONS ?? path.join(here, '..', '.motions');
const have = (c) => fs.existsSync(path.join(DIR, `${c}.fbx`));

globalThis.self = globalThis;
globalThis.createImageBitmap = async () => ({width: 1, height: 1, close() {}});
const realFetch = globalThis.fetch;
globalThis.fetch = async (u, o) => (String(u).startsWith('blob:') ? new Response(new Uint8Array([0])) : realFetch(u, o));

const out = path.join(os.tmpdir(), `raymi-clips-${process.pid}.mjs`);
await build({entryPoints: [path.join(here, '..', 'src', 'three', 'VrmPuppet.tsx')], bundle: true, format: 'esm',
  platform: 'node', outfile: out, logLevel: 'error', jsx: 'automatic', mainFields: ['module', 'main']});
const V = await import(pathToFileURL(out).href);
fs.rmSync(out, {force: true});
const vrm = fs.readFileSync(path.join(here, '..', '..', 'assets', 'vrm', 'raymi5.vrm'));
await V.preloadVrm('r5', vrm.buffer.slice(vrm.byteOffset, vrm.byteOffset + vrm.byteLength));
const cam = [0, 1.2, 3];
const load = (c) => { const b = fs.readFileSync(path.join(DIR, `${c}.fbx`)); V.preloadMotionData(c, b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); };
const at = (keys, f) => { V.poseVrm('r5', keys, f, 30, 0, cam, 0.6); return V.vrmAnatomy('r5'); };

test('a clip drives her: typing sits her down, a dance moves her hands over time', {skip: !have('typing') && 'no clips'}, () => {
  load('typing'); load('silly-dancing');
  const stand = at([{f: 0, pose: 'stand', pos: [0, 0, 0], rotY: 0}], 0);
  const typing = at([{f: 0, pose: 'stand', pos: [0, 0, 0], rotY: 0, motion: 'typing'}], 20);
  assert.ok(typing.hips.y < stand.hips.y - 0.2, `typing: hips ${typing.hips.y.toFixed(2)} vs standing ${stand.hips.y.toFixed(2)}`);
  const d = [0, 10, 20, 30].map((f) => at([{f: 0, pose: 'stand', pos: [0, 0, 0], rotY: 0, motion: 'silly-dancing'}], f).leftHand.y);
  assert.ok(Math.max(...d) - Math.min(...d) > 0.08, `dance: left hand ${d.map((x) => x.toFixed(2)).join(' ')}`);
});

test('a clip starts on its key: the same clip time at the same distance from its key', {skip: !have('waking') && 'no clips'}, () => {
  load('waking');
  const k = (f0) => [{f: 0, pose: 'stand', pos: [0, 0, 0], rotY: 0}, {f: f0, pose: 'stand', pos: [0, 0, 0], rotY: 0, motion: 'waking', once: true, blend: 0}];
  const a = at(k(10), 25), b = at(k(40), 55);
  assert.ok(Math.abs(a.head.y - b.head.y) < 1e-3, `head ${a.head.y.toFixed(3)} vs ${b.head.y.toFixed(3)}`);
});

// 2026-10-24 (Watch Me boards: she stood in every board): three's mixer writes a bone only when the clip value changed,
// so a held frame (speed 0), a one-frame Mixamo pose and the first frame of every shot fell back to the key pose
test('a held clip frame and a one-frame pose really pose her, also on the key frame itself', {skip: !have('silly-dancing') && 'no clips'}, () => {
  load('silly-dancing');
  const stand = at([{f: 0, pose: 'stand', pos: [0, 0, 0], rotY: 0}], 0).leftHand.y;
  const k = (from, speed) => [{f: 0, pose: 'stand', pos: [0, 0, 0], rotY: 0, motion: 'silly-dancing', clipFrom: from, speed}];
  const held = at(k(0.6, 0), 20).leftHand.y, first = at(k(0.6, 1), 0).leftHand.y, played = at(k(0, 1), 18).leftHand.y;
  assert.ok(Math.abs(held - stand) > 0.1, `held ${held.toFixed(2)} vs stand ${stand.toFixed(2)}`);
  assert.ok(Math.abs(first - played) < 0.02, `first frame ${first.toFixed(2)} vs the same clip time played ${played.toFixed(2)}`);
  if (have('female-dance-pose-1')) {
    load('female-dance-pose-1');
    const p = at([{f: 0, pose: 'stand', pos: [0, 0, 0], rotY: 0, motion: 'female-dance-pose-1'}], 0).leftHand;
    assert.ok(Math.abs(p.y - stand) > 0.1, `one-frame pose: left hand ${p.y.toFixed(2)} vs stand ${stand.toFixed(2)}`);
  }
});
