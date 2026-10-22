// node clip.mjs <job> (CLOUD ONLY - vrm-clip.yml)
// Render a short VRM motion study from jobs/<job>/clip.json and save its public review copy in that job's boards/.
// 2026-10-22: `lyrics.vocals` = the vocal stem -> her mouth opens with its loudness (lip sync v2); `variants` render
// the same clip with a few props changed (e.g. lip sync v1 vs v2), `compare` joins variants side by side.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {buildPublic, bundleStudio, repo} from './lib.mjs';

const job = process.argv[2];
if (!job || job.includes('..') || path.isAbsolute(job)) throw new Error('usage: node clip.mjs <job-folder-name>');
const jobDir = path.join(repo, 'jobs', job);
const configPath = path.join(jobDir, 'clip.json');
const base = JSON.parse(fs.readFileSync(configPath, 'utf8'));
if (base.composition !== 'VrmClip') throw new Error(`${configPath} must use composition VrmClip`);
const inside = (p, root) => { const r = path.resolve(root, p); if (!r.startsWith(root + path.sep)) throw new Error(`${p} must stay inside ${root}`); return r; };

if (base.lyrics?.source) {
  const track = JSON.parse(fs.readFileSync(inside(base.lyrics.source, repo), 'utf8'));
  const start = base.lyrics.startSeconds ?? 0;
  const end = start + base.durationInFrames / base.fps;
  base.mouthWords = (track.lines ?? []).flatMap((line) => line.words ?? [])
    .filter((word) => word.t1 > start - 0.5 && word.t0 < end + 0.5)
    .map(({roma, w, t0, t1}) => ({roma, w, t0, t1}));
  if (base.lyrics.vocals) base.mouthEnv = vocalEnvelope(inside(base.lyrics.vocals, repo), start, base.durationInFrames, base.fps);
}

/** Loudness of the vocal stem per video frame, 0..1 (-42 dB .. the clip's 95th percentile). */
function vocalEnvelope(file, start, frames, fps) {
  const rate = 8000;
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-ss', String(start), '-t', String(frames / fps + 0.5), '-i', file,
    '-ac', '1', '-ar', String(rate), '-f', 'f32le', '-'], {maxBuffer: 1 << 28});
  const pcm = new Float32Array(raw.buffer, raw.byteOffset, Math.floor(raw.byteLength / 4));
  const per = rate / fps;
  const db = [];
  for (let f = 0; f < frames; f++) {
    let sum = 0, n = 0;
    for (let i = Math.floor(f * per); i < Math.floor((f + 1) * per) && i < pcm.length; i++) { sum += pcm[i] * pcm[i]; n++; }
    db.push(n ? 10 * Math.log10(sum / n + 1e-12) : -120);
  }
  const top = [...db].sort((a, b) => a - b)[Math.floor(db.length * 0.95)] ?? -10;
  return db.map((d) => Math.round(Math.max(0, Math.min(1, (d + 42) / Math.max(6, top + 42))) * 100) / 100);
}

const variants = base.variants?.length ? base.variants : [{name: 'main', output: base.output || 'boards/vrm-clip-test.mp4', props: {}}];
const pub = buildPublic(jobDir, base);
const serveUrl = await bundleStudio(pub);
const browserExecutable = process.env.RAYMI_CHROME || null;
const rendered = {};
for (const v of variants) {
  const props = {...base, ...(v.props ?? {})};
  delete props.variants; delete props.compare;
  const out = inside(v.output || `boards/${v.name}.mp4`, jobDir);
  fs.mkdirSync(path.dirname(out), {recursive: true});
  const composition = await selectComposition({serveUrl, id: props.composition, inputProps: props, browserExecutable});
  let last = -1;
  await renderMedia({serveUrl, composition, inputProps: props, codec: 'h264', outputLocation: out, crf: 18,
    imageFormat: 'jpeg', jpegQuality: 92, browserExecutable, chromiumOptions: {gl: 'swangle'},
    timeoutInMilliseconds: 120000,
    onProgress: ({progress}) => { const pc = Math.round(progress * 10) * 10; if (pc !== last) { last = pc; console.log(`${v.name} ${pc}%`); } },
  });
  rendered[v.name] = out;
  console.log(`rendered ${props.durationInFrames} frames -> ${path.relative(repo, out)}`);
}
for (const c of base.compare ?? []) {
  // side by side, the first variant's sound (they share the clip's audio)
  const ins = c.of.map((n) => { if (!rendered[n]) throw new Error(`compare: unknown variant ${n}`); return rendered[n]; });
  const out = inside(c.output, jobDir);
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...ins.flatMap((i) => ['-i', i]),
    '-filter_complex', `${ins.map((_, i) => `[${i}:v]`).join('')}hstack=inputs=${ins.length}[v]`,
    '-map', '[v]', '-map', '0:a?', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', out]);
  console.log(`compare -> ${path.relative(repo, out)}`);
}
