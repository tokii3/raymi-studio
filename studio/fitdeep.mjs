// node fitdeep.mjs <job> <shot#> ...  - a wider lyric search than guard.mjs --fit-lyrics (pure math, no render):
// screen spots x depth along the ray x size x wrap width x facing the lens or not, checked against EVERY lyric guard
// of that shot (frame, size, face, props in front). Prints {index: {anchor, size, width, tilt, rotY} | null} as JSON.
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import * as THREE from 'three';
import {here, loadJob} from './lib.mjs';

const {props} = loadJob(process.argv[2]);
const out = path.join(os.tmpdir(), `raymi-fitdeep-${process.pid}.mjs`);
await build({entryPoints: [path.join(here, 'src/film/check.ts')], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error'});
const {lyricsOutOfFrame, solidFaults, makeCamera} = await import(pathToFileURL(out).href);
const res = {};
for (const i of process.argv.slice(3).map(Number)) {
  const s = props.shots[i];
  const one = (L) => { const p = {...props, shots: [{...s, lyrics: L}]}; return lyricsOutOfFrame(p).length === 0 && solidFaults(p).length === 0; };
  const f = Math.max(s.from, Math.min(s.to - 1, Math.min(...s.words.map((w) => w.from))));
  const cam = makeCamera(s, f, props.width / props.height, [], props.fps);
  const yaw = (p) => (Math.atan2(cam.position.x - p.x, cam.position.z - p.z) * 180) / Math.PI;   // face the lens
  const base = new THREE.Vector3(...s.lyrics.anchor).distanceTo(cam.position);
  let found = null;
  outer: for (const df of (process.env.WIDE ? [0.5, 0.35, 0.7, 0.25, 0.15, 1.0] : [0.5, 0.35, 0.7, 0.25, 1.0]))
    for (const [x, y] of [[0.5, 0.3], [0.5, 0.7], [0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7], [0.5, 0.5], [0.3, 0.5], [0.7, 0.5]])
      for (const sz of (process.env.WIDE ? [1, 1.3, 1.6, 2.0, 2.5, 0.8, 0.65] : [1, 1.3, 0.8, 1.6, 0.65]))
        for (const wf of (process.env.WIDE ? [1, 0.7, 0.5, 0.35] : [1, 0.7, 0.5])) {
          const ray = new THREE.Vector3(x * 2 - 1, 1 - y * 2, 0.5).unproject(cam).sub(cam.position).normalize();
          const pt = cam.position.clone().addScaledVector(ray, Math.max(0.8, base * df));
          const tilt = -Math.asin(Math.max(-1, Math.min(1, -new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion).y))) * 180 / Math.PI;
          const L = {...s.lyrics, anchor: [pt.x, pt.y, pt.z].map((v) => Number(v.toFixed(2))), rotY: Number(yaw(pt).toFixed(1)),
            tilt: Number(tilt.toFixed(1)), roll: 0, size: Number((s.lyrics.size * sz * df).toFixed(3)), width: Number((s.lyrics.width * sz * df * wf).toFixed(2))};
          if (one(L)) { found = {anchor: L.anchor, size: L.size, width: L.width, tilt: L.tilt, rot: L.rotY}; break outer; }
        }
  res[i] = found;
}
console.log(JSON.stringify(res));
