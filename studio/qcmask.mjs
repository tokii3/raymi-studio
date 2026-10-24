// node qcmask.mjs <job> [--every 2] [--scale 0.25] [--range a-b] [--out dir]     (CLOUD ONLY - qc.yml)
// The QC mask pass (film/QcMask.tsx) over a whole film: every N-th frame drawn three times as flat ID colours -
// all (what the viewer sees), her (only her), text (only the lyrics) - small PNGs that raymi/qcv2.py compares:
// something sticking out through her, a lyric across her face or hidden behind her / a prop, her face cut by the frame,
// her figure popping. toki 2026-10-24: "das Endergebnis zählt, egal wie der Code aussieht".
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {renderFrames, selectComposition} from '@remotion/renderer';
import {buildPublic, bundleStudio, loadJob} from './lib.mjs';

const job = process.argv[2];
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const every = Number(arg('--every') || 2);
const scale = Number(arg('--scale') || 0.25);
const {jobDir, props, composition: id} = loadJob(job);
// --range a-b: one worker's frames (qc.yml splits a film over parallel workers); a starts on the probe step
const range = arg('--range') ? arg('--range').split('-').map(Number) : null;
const frameRange = range ? [range[0], Math.min(range[1], props.durationInFrames - 1)] : null;
const fmt = props.width > props.height ? 'mv' : 'short';
const out = path.resolve(arg('--out') || path.join(jobDir, 'out', `qc_${fmt}`));
const pub = buildPublic(jobDir, props);
const serveUrl = await bundleStudio(pub);
const browserExecutable = process.env.RAYMI_CHROME || null;
const t0 = Date.now();
for (const mode of ['all', 'her', 'text']) {
  const inputProps = {...props, qcMask: mode};
  const composition = await selectComposition({serveUrl, id, inputProps, browserExecutable});
  const dir = path.join(out, mode);
  fs.mkdirSync(dir, {recursive: true});
  await renderFrames({serveUrl, composition, inputProps, imageFormat: 'png', everyNthFrame: every, ...(frameRange ? {frameRange} : {}), scale, browserExecutable,
    outputDir: dir, concurrency: 2,   // 4 tabs on a 4-core runner starved one past the timeout (qc run 1) chromiumOptions: {gl: 'swangle'},
    timeoutInMilliseconds: 240000, onStart: () => {}, onFrameUpdate: () => {}});
  // name every file by its film frame (renderFrames' own numbering is not promised across ranges / steps)
  const start = frameRange ? frameRange[0] : 0;
  const files = fs.readdirSync(dir).filter((x) => /^element-\d+\.png$/.test(x)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
  files.forEach((x, i) => fs.renameSync(path.join(dir, x), path.join(dir, `f${String(start + i * every).padStart(5, '0')}.png`)));
  console.log(`qc mask ${mode}: ${files.length} frames`);
}
fs.writeFileSync(path.join(out, 'qc.json'), JSON.stringify({job, fmt, every, scale, fps: props.fps,
  frames: props.durationInFrames, shots: props.shots.map((s) => ({id: s.id, from: s.from}))}) + '\n');
console.log(`qc mask: ${((Date.now() - t0) / 1000).toFixed(0)} s -> ${out}`);
