// node guard.mjs <job> [--report]  - the pre-render guards alone (pure math, no browser, safe on any PC);
// --place <shot#> <frame> <x> <y> <dist> gives the world point at that screen spot;
// --report prints where her head / feet and the lyric anchor land in the frame per shot (start, middle, end).
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {guardCutEdges, here, loadJob} from './lib.mjs';

const {props} = loadJob(process.argv[2]);
await guardCutEdges(props, null);
const pi = process.argv.indexOf('--place');      // --place <shot#> <frame> <x> <y> <dist>
if (process.argv.includes('--report') || pi > 0) {
  const out = path.join(os.tmpdir(), `raymi-report-${process.pid}.mjs`);
  await build({entryPoints: [path.join(here, 'src/film/check.ts')], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'error'});
  const {framingReport, placeAt} = await import(pathToFileURL(out).href);
  if (pi > 0) {
    const [s, f, x, y, d] = process.argv.slice(pi + 1, pi + 6).map(Number);
    console.log(JSON.stringify(placeAt(props, s, f, x, y, d)));
  } else for (const l of framingReport(props)) console.log(l);
}
