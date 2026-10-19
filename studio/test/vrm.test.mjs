// The 3D Raymi (VrmPuppet) without a browser and without rendering: pure rig math on her real model.
// node --test test/vrm.test.mjs   (safe on toki's PC: nothing is drawn, the textures are stubbed)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {build} from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));
const VRM = path.join(here, '..', '..', 'assets', 'vrm', 'raymi3.vrm');

globalThis.self = globalThis;
globalThis.createImageBitmap = async () => ({width: 1, height: 1, close() {}});
const realFetch = globalThis.fetch;
globalThis.fetch = async (u, o) => (String(u).startsWith('blob:') ? new Response(new Uint8Array([0])) : realFetch(u, o));

const out = path.join(os.tmpdir(), `raymi-vrm-${process.pid}.mjs`);
await build({entryPoints: [path.join(here, '..', 'src', 'three', 'VrmPuppet.tsx')], bundle: true, format: 'esm',
  platform: 'node', outfile: out, logLevel: 'error', jsx: 'automatic'});
const V = await import(pathToFileURL(out).href);
fs.rmSync(out, {force: true});
const POSES = ['stand', 'point', 'crouch', 'arms_up'];
const buf = fs.readFileSync(VRM);
await V.preloadVrm('raymi', buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const cam = [0.5, 1.15, 4.2];
const keys = (pose, extra = {}) => [{f: 0, pose, pos: [0.2, 0, -0.2], rotY: 'lens', expr: 'joy', ...extra}];

function snapshot(rig) {
  const q = [];
  rig.root.traverse((o) => { if (o.isBone) q.push(...o.quaternion.toArray().map((x) => x.toFixed(6))); });
  return q.join(',');
}

test('her height and feet: every pose stands on the floor at the asked height', () => {
  for (const pose of POSES) {
    const rig = V.poseVrm('raymi', keys(pose), 0, 30, 0, cam, 0.6);
    const a = V.vrmAnatomy('raymi');
    const foot = Math.min(a.leftFoot.y, a.rightFoot.y);
    assert.ok(foot > 0.02 && foot < 0.2, `${pose}: ankle ${foot.toFixed(3)} m above the floor`);
    if (pose !== 'crouch') assert.ok(a.head.y > 1.1 && a.head.y < 1.5, `${pose}: head at ${a.head.y.toFixed(2)} m`);
    else assert.ok(a.head.y < 1.15, `crouch: head still at ${a.head.y.toFixed(2)} m`);
    assert.ok(Math.abs(rig.root.scale.x * rig.natural - 1.55) < 1e-6);
  }
});

test('spring bones are deterministic: the same frame gives the same rig in any render order', () => {
  const k = [{f: 0, pose: 'stand', pos: [0.2, 0, -0.2], rotY: 0}, {f: 40, pose: 'arms_up', pos: [0.6, 0, -0.2], rotY: 30, blend: 10}];
  const a = snapshot(V.poseVrm('raymi', k, 55, 30, 0, cam, 0.6));
  V.poseVrm('raymi', k, 12, 30, 0, cam, 0.6);
  V.poseVrm('raymi', k, 140, 30, 0, cam, 0.6);
  const b = snapshot(V.poseVrm('raymi', k, 55, 30, 0, cam, 0.6));
  assert.equal(a, b);
});

test('the pose blend moves her: arms up raises the hands above the head', () => {
  V.poseVrm('raymi', keys('arms_up'), 0, 30, 0, cam, 0.6);
  const a = V.vrmAnatomy('raymi');
  assert.ok(a.leftHand.y > a.head.y && a.rightHand.y > a.head.y, `hands ${a.leftHand.y.toFixed(2)} / ${a.rightHand.y.toFixed(2)} head ${a.head.y.toFixed(2)}`);
  V.poseVrm('raymi', keys('stand'), 0, 30, 0, cam, 0.6);
  const s = V.vrmAnatomy('raymi');
  assert.ok(s.leftHand.y < s.hips.y + 0.1, `stand: hands hang (${s.leftHand.y.toFixed(2)} vs hips ${s.hips.y.toFixed(2)})`);
});
