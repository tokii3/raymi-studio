// node guard.mjs <job> [--report]  - the pre-render guards alone (pure math, no browser, safe on any PC);
// --place <shot#> <frame> <x> <y> <dist> gives the world point at that screen spot;
// --report prints where her head / feet and the lyric anchor land in the frame per shot (start, middle, end);
// --summary lists every guard fault per shot (cut edges by sprite:side in frames, sliced-face, lyric faults);
// --fit [shot#...] proposes the smallest camera change (tighter fov, aim toward her head) that passes every guard;
// --fit-lens [shot#...] proposes the smallest move of the whole camera path that passes every guard (JSON keys);
// --hero-boxes <f,f,...|every:N> prints the main element's screen box per frame (JSON, for raymi/hero.py);
// --fill-all: every shot whose lyrics fail a lyric guard gets fillLyrics, written into shots.json lyrics_fit.<format>
//   (compile again afterwards: raymi timeline <job> <format>) - no shot needs a hand patch (toki 2026-10-20);
// --fill-frame: every shot that is not meant wide (its shots.json size) gets frame_dolly so she fills >= 60 % of the
//   frame height, her head kept in (toki 2026-10-25: "raymi weit weg");
// --place-creatures: every shot whose Salmon is out of the picture gets a spot beside her (check.ts placeCreature),
//   written into shots.json salmon.pos (compile again afterwards);
// --fit-lyrics [shot#...] proposes the nearest lyric anchor (+ size) inside the frame and off her face (JSON per shot).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {guardCutEdges, here, loadJob} from './lib.mjs';

const {props, jobDir} = loadJob(process.argv[2]);
const flag = (n) => process.argv.indexOf(n);
const aid = ['--fill-frame', '--place-creatures', '--report', '--place', '--summary', '--fit', '--fit-lyrics', '--fill', '--fill-all', '--fit-lens', '--hero-boxes'].some((n) => flag(n) > 0);
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
  const {framingReport, placeAt, shotSummary, fitShot, fitLyrics, fillLyrics, lyricsOutOfFrame, fitLens, heroBoxes, heroFaults, creatureFaults, placeCreature, fillFrame} = await import(pathToFileURL(out).href);
  const pi = flag('--place');
  if (pi > 0) {
    const [s, f, x, y, d] = process.argv.slice(pi + 1, pi + 6).map(Number);
    console.log(JSON.stringify(placeAt(props, s, f, x, y, d)));
  } else if (flag('--hero-boxes') > 0) {
    const arg = process.argv[flag('--hero-boxes') + 1] ?? 'every:15';
    const frames = arg.startsWith('every:') ? Array.from({length: Math.ceil(props.durationInFrames / Number(arg.slice(6)))}, (_, i) => i * Number(arg.slice(6))) : arg.split(',').map(Number);
    console.log(JSON.stringify({width: props.width, height: props.height, fps: props.fps, boxes: heroBoxes(props, frames)}));
  } else if (flag('--summary') > 0) {
    for (const h of heroFaults(props)) console.log(`HERO ${h.shot} f${h.frame}: ${h.why}`);
    let bad = 0;
    for (const s of shotSummary(props)) {
      const cut = Object.entries(s.cut);
      if (!cut.length && !s.face && !s.lyrics.length && !s.extra.length) continue;
      bad++;
      console.log(`#${s.index} ${s.shot} (${s.frames} f)  ${cut.map(([k, n]) => `${k} ${n}f`).join(', ')}${s.face ? '  FACE sliced' : ''}${s.extra.length ? `  SET ${s.extra.join(' | ')}` : ''}${s.lyrics.length ? `  LYRICS ${s.lyrics.join(' | ')}` : ''}`);
    }
    console.log(`${bad} of ${props.shots.length} shots fail a guard`);
  } else if (flag('--fit-lens') > 0) {
    const want = process.argv.slice(flag('--fit-lens') + 1).filter((x) => /^\d+$/.test(x)).map(Number);
    const out = {};
    for (const i of want) { const c = fitLens(props, i); out[i] = c ? c.map(({f, pos, look, fov, roll, ease}) => ({f, pos, look, fov, roll, ease})) : null; }
    console.log(JSON.stringify(out));
  } else if (flag('--fill-frame') > 0) {
    const file = path.join(jobDir, 'shots.json');
    const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
    const WIDE = /wide|\bWS\b|\bLS\b|top|bird|tableau|macro|POV|plaque|sign|billboard|road|crane|overload/i;
    const moved = [];
    props.shots.forEach((s, i) => {
      const row = spec.shots.find((r) => r.id === s.id);
      if (!row || WIDE.test(String(row.size ?? '')) || row.frame_dolly) return;
      const size = String(row.size ?? '');
      const maxH = /\b(E?CU|MCU|MS)\b/.test(size) ? 0.95 : /\bFS\b/.test(size) ? 1.8 : 1.25;   // toki 2026-10-25 (twice): still too much empty space
      const k = /\bE?CU\b/.test(size) ? null : fillFrame(props, i, maxH);
      if (k === null) return;
      row.frame_dolly = k;
      moved.push(`${s.id} x${k}`);
    });
    fs.writeFileSync(file, JSON.stringify(spec, null, 1) + '\n');
    console.log(`fill-frame: ${moved.length} shots closer (${moved.join(', ')})`);
  } else if (flag('--place-creatures') > 0) {
    const file = path.join(jobDir, 'shots.json');
    const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
    const bad = new Set(creatureFaults(props).map((x) => x.shot));
    const moved = [], stuck = [];
    props.shots.forEach((s, i) => {
      if (!bad.has(s.id)) return;
      const p = placeCreature(props, i);
      const row = spec.shots.find((r) => r.id === s.id);
      if (!p || !row?.opts?.salmon) { stuck.push(s.id); return; }
      if (props.width < props.height) row.opts.salmon.short_pos = p; else row.opts.salmon.pos = p;   // the Short frame keeps its own spot
      moved.push(`${s.id} ${JSON.stringify(p)}`);
    });
    fs.writeFileSync(file, JSON.stringify(spec, null, 1) + '\n');
    console.log(`place-creatures: ${moved.length} moved (${moved.join(', ')})${stuck.length ? `, NO SPOT: ${stuck.join(' ')}` : ''}`);
    if (stuck.length) process.exitCode = 1;
  } else if (flag('--fill-all') > 0) {
    const fmt = props.width < props.height ? 'short' : 'mv';
    const file = path.join(jobDir, 'shots.json');
    const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
    let moved = 0, stuck = [];
    props.shots.forEach((s, i) => {
      if (!s.lyrics || !s.words.length || s.lyrics.style !== 'v2' || s.lyrics.kind === 'ticker') return;
      const one = {...props, shots: [s]};
      if (lyricsOutOfFrame(one).length === 0 && !heroFaults(one).some((h) => (s.hero ?? []).some((x) => x.name === h.name && x.kind === 'word'))) return;
      const fit = fillLyrics(props, i);
      const row = spec.shots.find((r) => r.id === s.id);
      if (!fit || !row) { stuck.push(s.id); return; }
      row.lyrics_fit = {...(row.lyrics_fit ?? {}), [fmt]: fit};
      moved++;
    });
    fs.writeFileSync(file, JSON.stringify(spec, null, 1) + '\n');
    console.log(`fill-all (${fmt}): ${moved} lyric blocks moved into free space${stuck.length ? `, NOTHING fits: ${stuck.join(' ')}` : ''}`);
    if (stuck.length) process.exitCode = 1;
  } else if (flag('--fill') > 0) {
    // --fill [shot#...]: the biggest lyric block in the frame's empty space (check.ts fillLyrics), JSON per shot
    const want = process.argv.slice(flag('--fill') + 1).filter((x) => /^\d+$/.test(x)).map(Number);
    const out = {};
    for (const i of want) out[i] = fillLyrics(props, i);
    console.log(JSON.stringify(out));
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
