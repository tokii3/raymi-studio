// Where every Mixamo clip carries HER on the real rig, measured with the puppet itself (VrmPuppet rootAt) - not guessed,
// not Blender's raw armature (take 12 QC v2: Blender said 2 m/s forward for the swim, the rig went 0.3 m/s backward
// with the old root code). toki 2026-10-28: "raymi wirkt wie angewurzelt ... klettert in die falsche richtung".
// She stands at the origin facing +z (rotY 0); one loop of the clip is played; her hips' way is written in HER frame:
// x = to her right, y = up, z = forward (m per loop and m/s), plus the share of the loop that already moved (smooth or
// a lurch). Out: studio/catalog/root_travel.json. Cloud only (the clips are licensed): .github/workflows/root-travel.yml
// node root_travel.mjs <motions dir> <vrm file> <out json>
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {build} from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));
const [dir, vrmFile, outFile] = process.argv.slice(2);
globalThis.self = globalThis;
globalThis.createImageBitmap = async () => ({width: 1, height: 1, close() {}});
const realFetch = globalThis.fetch;
globalThis.fetch = async (u, o) => (String(u).startsWith('blob:') ? new Response(new Uint8Array([0])) : realFetch(u, o));

const tmp = path.join(os.tmpdir(), `raymi-root-${process.pid}.mjs`);
await build({entryPoints: [path.join(here, 'src', 'three', 'VrmPuppet.tsx')], bundle: true, format: 'esm',
  platform: 'node', outfile: tmp, logLevel: 'error', jsx: 'automatic', mainFields: ['module', 'main']});
const V = await import(pathToFileURL(tmp).href);
fs.rmSync(tmp, {force: true});
const vb = fs.readFileSync(vrmFile);
await V.preloadVrm('r', vb.buffer.slice(vb.byteOffset, vb.byteOffset + vb.byteLength));
const cam = [0, 1.2, 4];
const out = {_why: 'her way per clip on the real rig (studio/root_travel.mjs): x right, y up, z forward, she faces +z', clips: {}};
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.fbx')).sort();
for (const f of files) {
  const id = f.replace(/\.fbx$/, '');
  try {
    const b = fs.readFileSync(path.join(dir, f));
    V.preloadMotionData(id, b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
    const dur = V.vrmClipDuration ? V.vrmClipDuration('r', id) : null;
    const keys = [{f: 0, pose: 'stand', pos: [0, 0, 0], rotY: 0, motion: id, motionMix: 1, blend: 0, ground: false}];
    const hips = (fr) => { V.poseVrm('r', keys, fr, 30, 0, cam, 0.6); return V.vrmAnatomy('r').hips.clone(); };
    const n = Math.max(2, Math.round((dur ?? 2) * 30));
    const p0 = hips(0), pm = hips(Math.round(n / 2)), p1 = hips(n);
    const d = [p1.x - p0.x, p1.y - p0.y, p1.z - p0.z].map((x) => +x.toFixed(3));
    const half = Math.hypot(pm.x - p0.x, pm.z - p0.z), whole = Math.hypot(d[0], d[2]);
    out.clips[id] = {dur: +(n / 30).toFixed(2), loop: d, v: d.map((x) => +(x / (n / 30)).toFixed(3)),
      even: whole > 0.05 ? +(half / whole).toFixed(2) : null};
  } catch (e) {
    out.clips[id] = {error: String(e).slice(0, 120)};
  }
}
fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
const moving = Object.entries(out.clips).filter(([, c]) => c.loop && Math.hypot(c.loop[0], c.loop[2]) > 0.3);
console.log(`root travel: ${files.length} clips, ${moving.length} move > 0.3 m per loop`);
for (const [id, c] of moving.slice(0, 40)) console.log(id, JSON.stringify(c));
