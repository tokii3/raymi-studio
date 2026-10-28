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
    // the way her FEET imply (take 13 + this measurement: nearly every clip is exported in place, so the hips never
    // travel): a foot that stands on the floor in an in-place clip slides backwards at exactly the speed she should go
    // forwards. Over one loop, every frame a foot is planted (within 3 cm of the loop's lowest foot) its horizontal
    // velocity is summed; implied = minus its mean (m/s, her frame), planted = share of frames with a planted foot.
    const step = 2, feet = [];
    for (let fr = 0; fr <= n; fr += step) {
      V.poseVrm('r', keys, fr, 30, 0, cam, 0.6);
      const a = V.vrmAnatomy('r');
      feet.push({l: a.leftFoot.clone(), r: a.rightFoot.clone()});
    }
    const low = Math.min(...feet.map((q) => Math.min(q.l.y, q.r.y)));
    let sx = 0, sz = 0, cnt = 0, planted = 0;
    for (let i = 1; i < feet.length; i++) {
      let any = false;
      for (const side of ['l', 'r']) {
        const a0 = feet[i - 1][side], a1 = feet[i][side];
        if (a0.y - low < 0.03 && a1.y - low < 0.03) { sx += (a1.x - a0.x) / (step / 30); sz += (a1.z - a0.z) / (step / 30); cnt++; any = true; }
      }
      planted += any ? 1 : 0;
    }
    const implied = cnt ? [-sx / cnt, 0, -sz / cnt].map((x) => +x.toFixed(3)) : [0, 0, 0];
    out.clips[id] = {dur: +(n / 30).toFixed(2), loop: d, v: d.map((x) => +(x / (n / 30)).toFixed(3)),
      even: whole > 0.05 ? +(half / whole).toFixed(2) : null, implied, planted: +(planted / Math.max(1, feet.length - 1)).toFixed(2)};
  } catch (e) {
    out.clips[id] = {error: String(e).slice(0, 120)};
  }
}
fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
const moving = Object.entries(out.clips).filter(([, c]) => c.implied && Math.hypot(c.implied[0], c.implied[2]) > 0.15);
console.log(`root travel: ${files.length} clips, ${moving.length} imply > 0.15 m/s from their planted feet`);
for (const [id, c] of moving.slice(0, 40)) console.log(id, JSON.stringify(c));
