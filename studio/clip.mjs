// node clip.mjs <job> (CLOUD ONLY - vrm-clip.yml)
// Render a short VRM motion study from jobs/<job>/clip.json and save its public review copy in that job's boards/.
import fs from 'node:fs';
import path from 'node:path';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {buildPublic, bundleStudio, here, repo} from './lib.mjs';

const job = process.argv[2];
if (!job || job.includes('..') || path.isAbsolute(job)) throw new Error('usage: node clip.mjs <job-folder-name>');
const jobDir = path.join(repo, 'jobs', job);
const configPath = path.join(jobDir, 'clip.json');
const props = JSON.parse(fs.readFileSync(configPath, 'utf8'));
if (props.composition !== 'VrmClip') throw new Error(`${configPath} must use composition VrmClip`);
if (props.lyrics?.source) {
  const lyricPath = path.resolve(repo, props.lyrics.source);
  if (!lyricPath.startsWith(repo + path.sep)) throw new Error('lyric source must stay inside the repository');
  const track = JSON.parse(fs.readFileSync(lyricPath, 'utf8'));
  const start = props.lyrics.startSeconds ?? 0;
  const end = start + props.durationInFrames / props.fps;
  props.mouthWords = (track.lines ?? []).flatMap((line) => line.words ?? [])
    .filter((word) => word.t1 > start && word.t0 < end)
    .map(({roma, w, t0, t1}) => ({roma, w, t0, t1}));
}
const out = path.resolve(jobDir, props.output || 'boards/vrm-clip-test.mp4');
if (!out.startsWith(jobDir + path.sep)) throw new Error('clip output must stay inside its job folder');
fs.mkdirSync(path.dirname(out), {recursive: true});
const pub = buildPublic(jobDir, props);
const serveUrl = await bundleStudio(pub);
const browserExecutable = process.env.RAYMI_CHROME || null;
const composition = await selectComposition({serveUrl, id: props.composition, inputProps: props, browserExecutable});
await renderMedia({serveUrl, composition, inputProps: props, codec: 'h264', outputLocation: out, crf: 18,
  imageFormat: 'jpeg', jpegQuality: 92, browserExecutable, chromiumOptions: {gl: 'swangle'},
  timeoutInMilliseconds: 120000,
  onProgress: ({progress}) => { const pc = Math.round(progress * 100); if (pc % 10 === 0 && pc !== globalThis.lastPc) {
    globalThis.lastPc = pc; console.log(`${pc}%`);
  } },
});
console.log(`rendered ${props.durationInFrames} frames -> ${path.relative(repo, out)}`);
