// node render.mjs <job> [--draft] [--frames a-b] [--muted] [--out file.mp4]      (CLOUD ONLY - render.yml)
// Renders the job's composition (props.composition: Short | MV | MVShort) from out/props.json.
// Parallel render: each worker renders one frame range --muted into its own file; `python -m raymi assemble`
// joins the parts and lays the audio under them once (no AAC seams between parts).
import path from 'node:path';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {buildPublic, bundleStudio, guardCutEdges, loadJob} from './lib.mjs';

const job = process.argv[2];
const draft = process.argv.includes('--draft');
const muted = process.argv.includes('--muted');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const frames = arg('--frames') || process.env.RAYMI_FRAMES || null;
if (!job) throw new Error('usage: node render.mjs <job> [--draft]');
const {jobDir, props, composition: id} = loadJob(job);
const range = frames ? frames.split('-').map(Number) : null;
await guardCutEdges(props, range);
const pub = buildPublic(jobDir, props);
const serveUrl = await bundleStudio(pub);
const browserExecutable = process.env.RAYMI_CHROME || null;
const composition = await selectComposition({serveUrl, id, inputProps: props, browserExecutable});
const t0 = Date.now();
const out = arg('--out') ? path.resolve(arg('--out')) : path.join(jobDir, 'out', 'raw.mp4');
await renderMedia({
  serveUrl, composition, inputProps: props, codec: 'h264', outputLocation: out, muted,
  crf: draft ? 26 : 16, imageFormat: 'jpeg', jpegQuality: draft ? 80 : 95,
  scale: draft ? 0.5 : 1,
  frameRange: range,
  concurrency: process.env.RAYMI_CONCURRENCY ? Number(process.env.RAYMI_CONCURRENCY) : null,
  browserExecutable,
  chromiumOptions: {gl: 'swangle'},
  timeoutInMilliseconds: 120000,
  onProgress: ({progress}) => { const pc = Math.round(progress * 100); if (pc % 10 === 0 && pc !== globalThis.lastPc) { globalThis.lastPc = pc; console.log(`${pc}%`); } },
});
console.log(`\nrendered ${id} in ${((Date.now() - t0) / 1000).toFixed(0)} s -> ${out}`);
