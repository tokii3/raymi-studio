// node guard.mjs <job> [--report]  - the pre-render guards alone (pure math, no browser, safe on any PC);
// --place <shot#> <frame> <x> <y> <dist> gives the world point at that screen spot;
// --report prints where her head / feet and the lyric anchor land in the frame per shot (start, middle, end);
// --summary lists every guard fault per shot (cut edges by sprite:side in frames, sliced-face, lyric faults);
// --fit [shot#...] proposes the smallest camera change (tighter fov, aim toward her head) that passes every guard;
// --fit-lyrics [shot#...] proposes the nearest lyric anchor (+ size) inside the frame and off her face (JSON per shot).
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {guardCutEdges, here, loadJob} from './lib.mjs';

const {props} = loadJob(process.argv[2]);
const flag = (n) => process.argv.indexOf(n);
const aid = ['--report', '--place', '--summary', '--fit', '--fit-lyrics'].some((n) => flag(n) > 0);
if (!aid || process.argv.includes('--report')) {
  try {
    await guardCutEdges(props, null);
  } catch (e) {
    console.log(String(e.message));
    process.exitCode = 1;
  }
}
if (aid) {
  const out = path.join(os.tmpdir(), `raymi-report-${process.pid}.mjs`);
  await build({entryPoints: [path.join(here, 'src/film/check.ts')], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error'});
  const {framingReport, placeAt, shotSummary, fitShot, fitLyrics} = await import(pathToFileURL(out).href);
  const pi = flag('--place');
  if (pi > 0) {
    const [s, f, x, y, d] = process.argv.slice(pi + 1, pi + 6).map(Number);
    console.log(JSON.stringify(placeAt(props, s, f, x, y, d)));
  } else if (flag('--summary') > 0) {
    let bad = 0;
    for (const s of shotSummary(props)) {
      const cut = Object.entries(s.cut);
      if (!cut.length && !s.face && !s.lyrics.length && !s.extra.length) continue;
      bad++;
      console.log(`#${s.index} ${s.shot} (${s.frames} f)  ${cut.map(([k, n]) => `${k} ${n}f`).join(', ')}${s.face ? '  FACE sliced' : ''}${s.extra.length ? `  SET ${s.extra.join(' | ')}` : ''}${s.lyrics.length ? `  LYRICS ${s.lyrics.join(' | ')}` : ''}`);
    }
    console.log(`${bad} of ${props.shots.length} shots fail a guard`);
  } else if (flag('--fit-lyrics') > 0) {
    const want = process.argv.slice(flag('--fit-lyrics') + 1).filter((x) => /^\d+$/.test(x)).map(Number);
    const out = {};
    for (const i of want) out[i] = fitLyrics(props, i);
    console.log(JSON.stringify(out));
  } else if (flag('--fit') > 0) {
    const want = process.argv.slice(flag('--fit') + 1).filter((x) => /^\d+$/.test(x)).map(Number);
    const idx = want.length ? want : props.shots.map((_, i) => i);
    for (const i of idx) {
      const r = fitShot(props, i);
      const id = props.shots[i].id;
      if (!r) console.log(`#${i} ${id}: no zoom fixes it - choose a clean sprite or move her`);
      else if (r.factor < 1) console.log(`#${i} ${id}: fov x${r.factor} aim ${r.aim} -> ${JSON.stringify(r.camera.map(({f, pos, look, fov}) => ({f, pos, look, fov})))}`);
    }
  } else for (const l of framingReport(props)) console.log(l);
}
