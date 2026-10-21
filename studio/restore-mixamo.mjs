// Reassemble protected Actions secret chunks into runner-local motion files.
// These files stay outside GitHub artifacts and source control.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';

const parts = [];
for (let i = 1; i <= 24; i++) {
  const name = `MIXAMO_BUNDLE_${String(i).padStart(2, '0')}`;
  const value = process.env[name];
  if (!value) break;
  parts.push(value.trim());
}
if (!parts.length || process.env.MIXAMO_BUNDLE_25) throw new Error('Mixamo secret bundle is missing or exceeds the supported chunk count.');
const data = Buffer.from(parts.join(''), 'base64');
const magic = Buffer.from('RAYMIX1\n');
if (!data.subarray(0, magic.length).equals(magic)) throw new Error('Mixamo secret bundle header is invalid.');
let offset = magic.length;
const readFile = () => {
  const length = data.readUInt32BE(offset); offset += 4;
  if (!length || offset + length > data.length) throw new Error('Mixamo secret bundle is truncated.');
  const result = gunzipSync(data.subarray(offset, offset + length)); offset += length;
  if (!result.subarray(0, 20).toString('ascii').startsWith('Kaydara FBX Binary')) throw new Error('Mixamo FBX signature is invalid.');
  return result;
};
const dance = readFile();
const idle = readFile();
if (offset !== data.length) throw new Error('Mixamo secret bundle contains unexpected trailing data.');
const target = path.join(path.dirname(fileURLToPath(import.meta.url)), '.motions');
fs.mkdirSync(target, {recursive: true});
fs.writeFileSync(path.join(target, 'dance.fbx'), dance, {mode: 0o600});
fs.writeFileSync(path.join(target, 'idle.fbx'), idle, {mode: 0o600});
console.log('Protected Mixamo dance and idle motions are ready on this runner.');
