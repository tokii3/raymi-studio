// node probe.mjs <job> [--every 2] [--range a-b] [--out file.json]   (CLOUD ONLY - qc.yml / stills.yml "probe")
// The scene probe over a whole film (film/Probe.tsx): every N-th frame is evaluated in the browser without drawing a
// picture, the probe logs her limbs inside furniture, things inside things / in the air and where her feet are against
// the support below her; this writes them as one JSON report (raymi/probe.py reads it into fault classes).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {renderFrames, selectComposition} from '@remotion/renderer';
import {buildPublic, bundleStudio, loadJob} from './lib.mjs';

const job = process.argv[2];
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
// v2 default every 2nd frame (v1 ran every 15th on Beach: 335 of ~5000 frames - a fall at a shot start or a hand in the
// table for half a second slipped through; toki 2026-10-24 "es müssen mehr frames geprüft werden")
const every = Number(arg('--every') || 2);
const {jobDir, props, composition: id} = loadJob(job);
// --range a-b: one worker's frames (qc.yml splits a film over parallel workers); a starts on the probe step
const range = arg('--range') ? arg('--range').split('-').map(Number) : null;
const frameRange = range ? [range[0], Math.min(range[1], props.durationInFrames - 1)] : null;
const inputProps = {...props, probe: true};
const pub = buildPublic(jobDir, props);
const serveUrl = await bundleStudio(pub);
const browserExecutable = process.env.RAYMI_CHROME || null;
const composition = await selectComposition({serveUrl, id, inputProps, browserExecutable});
const rows = [];
const t0 = Date.now();
await renderFrames({serveUrl, composition, inputProps, imageFormat: 'none', everyNthFrame: every, ...(frameRange ? {frameRange} : {}), browserExecutable,
  outputDir: fs.mkdtempSync(path.join(os.tmpdir(), 'probe-')), concurrency: 2,   // 4 tabs on a 4-core runner starved one past the timeout (qc run 1) chromiumOptions: {gl: 'swangle'},
  timeoutInMilliseconds: 240000, onStart: () => {}, onFrameUpdate: () => {},
  onBrowserLog: (l) => { const m = /^PROBE (.*)$/.exec(l.text ?? ''); if (m) rows.push(JSON.parse(m[1])); }});
rows.sort((a, b) => a.f - b.f);
const out = path.resolve(arg('--out') || path.join(jobDir, 'out', `probe_${props.width > props.height ? 'mv' : 'short'}.json`));
fs.mkdirSync(path.dirname(out), {recursive: true});
fs.writeFileSync(out, JSON.stringify({job, every, fps: props.fps, frames: rows.length, rows}) + '\n');
console.log(`probe: ${rows.length} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s -> ${out}`);
