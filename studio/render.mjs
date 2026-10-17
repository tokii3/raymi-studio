// node render.mjs <job> [--draft]
// Builds a minimal public dir (font + only the sprites this job uses + its voice) and renders out/raw.mp4.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const job = process.argv[2];
const draft = process.argv.includes('--draft');
if (!job) throw new Error('usage: node render.mjs <job> [--draft]');
const jobDir = fs.existsSync(job) ? path.resolve(job) : path.join(repo, 'jobs', job);
const props = JSON.parse(fs.readFileSync(path.join(jobDir, 'out', 'props.json'), 'utf8'));

const pub = path.join(here, 'public');
fs.rmSync(pub, {recursive: true, force: true});
fs.mkdirSync(path.join(pub, 'sprites'), {recursive: true});
fs.mkdirSync(path.join(pub, 'fonts'), {recursive: true});
fs.copyFileSync(path.join(repo, 'assets/fonts/Raymi-Regular.ttf'), path.join(pub, 'fonts/Raymi-Regular.ttf'));
for (const b of props.beats) {
  const src = path.join(repo, 'assets', b.sprite);
  if (!fs.existsSync(src)) throw new Error(`sprite missing: ${src}`);
  fs.copyFileSync(src, path.join(pub, b.sprite));
}
fs.copyFileSync(path.join(jobDir, props.voice), path.join(pub, props.voice));

const serveUrl = await bundle({entryPoint: path.join(here, 'src/index.ts'), publicDir: pub});
const composition = await selectComposition({serveUrl, id: 'Short', inputProps: props,
  browserExecutable: process.env.RAYMI_CHROME || null});
const t0 = Date.now();
await renderMedia({
  serveUrl, composition, inputProps: props, codec: 'h264',
  outputLocation: path.join(jobDir, 'out', 'raw.mp4'),
  crf: draft ? 26 : 16, imageFormat: 'jpeg', jpegQuality: draft ? 80 : 95,
  scale: draft ? 0.5 : 1,
  frameRange: process.env.RAYMI_FRAMES ? process.env.RAYMI_FRAMES.split('-').map(Number) : null,
  concurrency: process.env.RAYMI_CONCURRENCY ? Number(process.env.RAYMI_CONCURRENCY) : null,
  browserExecutable: process.env.RAYMI_CHROME || null,
  chromiumOptions: {gl: 'swangle'},
  onProgress: ({progress}) => { const pc = Math.round(progress * 100); if (pc % 10 === 0 && pc !== globalThis.lastPc) { globalThis.lastPc = pc; console.log(`${pc}%`); } },
});
console.log(`\nrendered in ${((Date.now() - t0) / 1000).toFixed(0)} s -> ${path.join(jobDir, 'out', 'raw.mp4')}`);
