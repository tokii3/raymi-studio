// Shared by render.mjs and stills.mjs: build a minimal public dir (font + only the sprites + sound this job uses),
// run the pre-render guards, bundle the studio. Renders only ever run in the cloud (toki's PC stays free).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {bundle} from '@remotion/bundler';
import {build} from 'esbuild';

export const here = path.dirname(fileURLToPath(import.meta.url));
export const repo = path.resolve(here, '..');

export function loadJob(job) {
  const jobDir = fs.existsSync(job) ? path.resolve(job) : path.join(repo, 'jobs', job);
  const props = JSON.parse(fs.readFileSync(path.join(jobDir, 'out', 'props.json'), 'utf8'));
  return {jobDir, props, composition: props.composition || 'Short'};
}

export function buildPublic(jobDir, props) {
  const pub = path.join(here, 'public');
  fs.rmSync(pub, {recursive: true, force: true});
  fs.mkdirSync(path.join(pub, 'sprites'), {recursive: true});
  fs.mkdirSync(path.join(pub, 'fonts'), {recursive: true});
  fs.copyFileSync(path.join(repo, 'assets/fonts/Raymi-Regular.ttf'), path.join(pub, 'fonts/Raymi-Regular.ttf'));
  const sprites = props.sprites ?? props.beats.map((b) => b.sprite);
  for (const s of sprites) {
    const src = path.join(repo, 'assets', s);
    if (!fs.existsSync(src)) throw new Error(`sprite missing: ${src}`);
    fs.copyFileSync(src, path.join(pub, s));
  }
  if (props.audio) {          // a music video: the song (staged next to props on workers, else in its own job folder)
    const staged = path.join(jobDir, props.audio.file);
    const src = fs.existsSync(staged) ? staged : path.join(repo, props.audio.src);
    fs.copyFileSync(src, path.join(pub, props.audio.file));
  } else if (props.voice) {
    fs.copyFileSync(path.join(jobDir, props.voice), path.join(pub, props.voice));
  }
  return pub;
}

/** Hard rule 9 before a single frame is rendered: no cut sprite edge may ever be on screen (film/check.ts). */
export async function guardCutEdges(props, range) {
  if (!props.shots) return;
  const out = path.join(os.tmpdir(), `raymi-check-${process.pid}.mjs`);
  await build({entryPoints: [path.join(here, 'src/film/check.ts')], bundle: true, format: 'esm', platform: 'node',
    outfile: out, logLevel: 'error'});
  const {checkFilm, lyricsOutOfFrame} = await import(pathToFileURL(out).href);
  const faults = checkFilm(props, range);
  const text = lyricsOutOfFrame(props);
  fs.rmSync(out, {force: true});
  if (faults.length) {
    const first = faults.slice(0, 8).map((x) => `${x.shot} f${x.frame} ${x.side} (${x.sprite})`).join('; ');
    throw new Error(`REFUSED: a cut sprite edge would be on screen in ${faults.length} frame(s): ${first} - reframe (hard rule 9)`);
  }
  if (text.length) {
    const first = text.map((x) => `${x.shot} f${x.frame} "${x.text}"`).join('; ');
    throw new Error(`REFUSED: lyrics would leave the frame: ${first} - move the anchor / smaller size (PRINCIPLES C: text readable inside the frame)`);
  }
  console.log('guards: cut edges ok, lyrics inside the frame ok');
}

export async function bundleStudio(pub) {
  return bundle({entryPoint: path.join(here, 'src/index.ts'), publicDir: pub});
}
