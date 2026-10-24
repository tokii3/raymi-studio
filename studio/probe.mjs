// node probe.mjs <job> [--every 6] [--out file.json]     (CLOUD ONLY - stills.yml with "probe": N in stills.json)
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
const every = Number(arg('--every') || 6);
const {jobDir, props, composition: id} = loadJob(job);
const inputProps = {...props, probe: true};
const pub = buildPublic(jobDir, props);
const serveUrl = await bundleStudio(pub);
const browserExecutable = process.env.RAYMI_CHROME || null;
const composition = await selectComposition({serveUrl, id, inputProps, browserExecutable});
const rows = [];
const t0 = Date.now();
await renderFrames({serveUrl, composition, inputProps, imageFormat: 'none', everyNthFrame: every, browserExecutable,
  outputDir: fs.mkdtempSync(path.join(os.tmpdir(), 'probe-')), concurrency: 2, chromiumOptions: {gl: 'swangle'},
  timeoutInMilliseconds: 120000, onStart: () => {}, onFrameUpdate: () => {},
  onBrowserLog: (l) => { const m = /^PROBE (.*)$/.exec(l.text ?? ''); if (m) rows.push(JSON.parse(m[1])); }});
rows.sort((a, b) => a.f - b.f);
const out = path.resolve(arg('--out') || path.join(jobDir, 'out', `probe_${props.width > props.height ? 'mv' : 'short'}.json`));
fs.mkdirSync(path.dirname(out), {recursive: true});
fs.writeFileSync(out, JSON.stringify({job, every, fps: props.fps, frames: rows.length, rows}) + '\n');
console.log(`probe: ${rows.length} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s -> ${out}`);
