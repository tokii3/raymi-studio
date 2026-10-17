// node stills.mjs <job> <frame,frame,...> [--scale 0.5] [--out dir] [--names a,b,c]     (CLOUD ONLY - stills.yml)
// Single frames of a job's composition as JPGs (look development, idea boards, catalog). Never run on toki's PC.
import fs from 'node:fs';
import path from 'node:path';
import {renderStill, selectComposition} from '@remotion/renderer';
import {buildPublic, bundleStudio, guardCutEdges, loadJob} from './lib.mjs';

const [job, frameList] = process.argv.slice(2);
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const {jobDir, props, composition: id} = loadJob(job);
const frames = frameList.split(',').map(Number);
for (const f of frames) await guardCutEdges(props, [f, f]);
const pub = buildPublic(jobDir, props);
const serveUrl = await bundleStudio(pub);
const browserExecutable = process.env.RAYMI_CHROME || null;
const composition = await selectComposition({serveUrl, id, inputProps: props, browserExecutable});
const outDir = path.resolve(arg('--out') || path.join(jobDir, 'out', 'stills'));
fs.mkdirSync(outDir, {recursive: true});
const names = arg('--names') ? arg('--names').split(',') : null;
for (const [k, f] of frames.entries()) {
  const name = names ? names[k] : `${id}_${String(f).padStart(4, '0')}`;
  const t0 = Date.now();
  await renderStill({serveUrl, composition, inputProps: props, frame: f, scale: Number(arg('--scale') || 1),
    imageFormat: 'jpeg', jpegQuality: 92, output: path.join(outDir, `${name}.jpg`), browserExecutable,
    chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 120000});
  console.log(`${name}.jpg (frame ${f}) ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
