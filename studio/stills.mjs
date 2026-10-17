// node stills.mjs <job> <frame,frame,...>  -> out/still_<frame>.jpg (fast layout check without a full render)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const here = path.dirname(fileURLToPath(import.meta.url));
const [job, frames] = process.argv.slice(2);
const jobDir = path.join(here, '..', 'jobs', job);
const props = JSON.parse(fs.readFileSync(path.join(jobDir, 'out', 'props.json'), 'utf8'));
const pub = path.join(here, 'public');
if (!fs.existsSync(pub)) throw new Error('run render.mjs once first (it builds public/)');
const serveUrl = await bundle({entryPoint: path.join(here, 'src/index.ts'), publicDir: pub});
const browserExecutable = process.env.RAYMI_CHROME || null;
const composition = await selectComposition({serveUrl, id: 'Short', inputProps: props, browserExecutable});
for (const f of frames.split(',').map(Number)) {
  await renderStill({serveUrl, composition, inputProps: props, frame: f, scale: 0.4, imageFormat: 'jpeg',
    output: path.join(jobDir, 'out', `still_${String(f).padStart(4, '0')}.jpg`), browserExecutable});
}
console.log('stills done');
