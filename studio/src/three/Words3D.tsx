// Lyrics as objects of the world (PRINCIPLES 11): every word appears with the voice (one frame before its syllable,
// timed from the vocal stem), the key word is big and in the accent colour, and the words live ON something in the
// set - a sign, an air bubble, a stamp, the aquarium glass, a playing card, a ticker. Only Raymi-Regular.ttf: the
// timeline compiler refuses words with glyphs the font lacks (raymi/timeline.py), never a fallback font.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {canvasTexture, rnd, toonRamp} from './look';
import {ease} from '../film/motion';
import {flare} from './events';
import {PAD_EM, TEX_EM, blockLayout, blockRotation, lensPlace, romaShown, subOf, type Item} from '../film/lyricLayout';
import type {LyricTone} from '../film/grade';
import type {LyricMaterial, Lyrics, Word3} from '../film/types';

const PX = 180;                    // font px on the texture
const CAP = 0.72;                  // cap height share of the font size (Raymi-Regular)

type Tex = {tex: THREE.CanvasTexture; aspect: number; hScale: number};

function wordTexture(w: string, color: string, outline: string, card: boolean, material?: LyricMaterial | null): Tex {
  const key = `w|${w}|${color}|${outline}|${card}|${material ?? ''}`;
  const meas = document.createElement('canvas').getContext('2d')!;
  meas.font = `${PX}px Raymi`;
  const tw = Math.ceil(meas.measureText(w).width);
  const screen = material === 'screen';
  const pad = card ? 70 : screen ? 90 : 40;
  const cw = tw + pad * 2, ch = Math.ceil(PX * 1.35) + (card ? 80 : screen ? 60 : 0);
  const tex = canvasTexture(key, cw, ch, (ctx, W, H) => {
    if (card) {                                   // a playing card's face: ivory, rounded, a thin inner line
      ctx.fillStyle = '#f4ecdc';
      ctx.beginPath(); ctx.roundRect(4, 4, W - 8, H - 8, 34); ctx.fill();
      ctx.strokeStyle = '#c9b78f'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.roundRect(18, 18, W - 36, H - 36, 24); ctx.stroke();
    }
    // screen: the caption bar is ONE panel behind the whole line (ScreenPanel) - per-word boxes overlapped (pilot 2)
    ctx.font = `${PX}px Raymi`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    const x = W / 2, y = H / 2 + PX * 0.04;
    switch (material) {
      case 'fog':                                 // a finger through breath on cold glass: soft, pale, no outline
        ctx.shadowColor = 'rgba(230,245,255,0.9)'; ctx.shadowBlur = 26;
        ctx.fillStyle = 'rgba(232,246,255,0.72)'; ctx.fillText(w, x, y);
        ctx.shadowBlur = 0; return;
      case 'engraved':                            // cut into brass / a coin: dark groove, light lip below
        ctx.fillStyle = 'rgba(255,240,190,0.75)'; ctx.fillText(w, x + 3, y + 5);
        ctx.fillStyle = '#3a2410'; ctx.fillText(w, x, y);
        ctx.fillStyle = color; ctx.globalAlpha = 0.35; ctx.fillText(w, x - 2, y - 2); ctx.globalAlpha = 1; return;
      case 'print':                               // a card's own printed ink: flat, no outline
      case 'felt':                                // the felt's gold print: flat, slightly worn
        ctx.fillStyle = color; ctx.globalAlpha = material === 'felt' ? 0.85 : 1; ctx.fillText(w, x, y); ctx.globalAlpha = 1; return;
      case 'light':                               // words drawn in light: a glow around a hot core
        ctx.shadowColor = color; ctx.shadowBlur = 40; ctx.fillStyle = color; ctx.fillText(w, x, y);
        ctx.shadowBlur = 10; ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.7; ctx.fillText(w, x, y);
        ctx.globalAlpha = 1; ctx.shadowBlur = 0; return;
      case 'screen':
        ctx.fillStyle = '#ffffff'; ctx.fillText(w, x, y + 6); return;
      default: break;
    }
    if (!card) { ctx.strokeStyle = outline; ctx.lineWidth = 22; ctx.strokeText(w, x, y); }
    ctx.fillStyle = color;
    ctx.fillText(w, x, y);
  });
  return {tex, aspect: cw / ch, hScale: ch / (PX * CAP)};
}

type Placed = {w: Word3; x: number; y: number; size: number; tex: Tex};
const layouts = new Map<string, Placed[]>();

/** Lay out a whole line once (words never jump when the next one appears); wraps at width, centred on the anchor. */
function layout(words: Word3[], L: Lyrics, card: boolean): Placed[] {
  const items = words.map((w) => {
    let size = L.size * (w.key ? 2.2 : 1);
    const tex = wordTexture(w.w, w.key ? L.accent : L.color, L.outline, card, L.material);
    let width = size * tex.hScale * tex.aspect;
    if (width > L.width) { size *= L.width / width; width = L.width; }   // a word never runs past its surface
    return {w, size, tex, width};
  });
  const gap = L.size * 0.35;
  const rows: typeof items[] = [[]];
  let rw = 0;
  for (const it of items) {
    if (rows[rows.length - 1].length && rw + gap + it.width > L.width) { rows.push([]); rw = 0; }
    rows[rows.length - 1].push(it);
    rw += (rw ? gap : 0) + it.width;
  }
  const out: Placed[] = [];
  const rowH = rows.map((r) => Math.max(...r.map((i) => i.size * 1.25)));
  let y = rowH.reduce((a, b) => a + b, 0) / 2;
  rows.forEach((r, ri) => {
    const total = r.reduce((a, i) => a + i.width, 0) + gap * (r.length - 1);
    let x = -total / 2;
    y -= rowH[ri] / 2;
    for (const i of r) {
      out.push({w: i.w, x: x + i.width / 2, y, size: i.size, tex: i.tex});
      x += i.width + gap;
    }
    y -= rowH[ri] / 2;
  });
  return out;
}

const WordMesh: React.FC<{p: Placed; L: Lyrics; f: number; fps: number; out: number; card: boolean}> = ({p, L, f, fps, out, card}) => {
  const d = f - p.w.from;                                   // frames since the syllable (word appears on its cut frame)
  const h = p.size * p.tex.hScale, w = h * p.tex.aspect;
  const painted = L.lit || card || L.material === 'engraved' || L.material === 'print' || L.material === 'felt';
  const mat = useMemo(() => (painted
    ? new THREE.MeshToonMaterial({map: p.tex.tex, gradientMap: toonRamp(), transparent: true, alphaTest: 0.05, side: THREE.DoubleSide, fog: false})
    : new THREE.MeshBasicMaterial({map: p.tex.tex, transparent: true, alphaTest: 0.02, toneMapped: false, side: THREE.DoubleSide, fog: false,
      blending: L.material === 'light' ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: L.material !== 'light' && L.material !== 'fog'})), [p.tex.tex, painted, L.material]);
  let x = p.x, y = p.y, z = 0, s = 1, rz = 0, sx = 1, op = 1;
  const seed = p.w.line * 31 + p.w.idx * 7;
  switch (L.kind) {
    case 'sign': { const e = ease('out', d / 5); s = 1.25 - 0.25 * e; op = d < 3 ? [0.4, 1, 0.6][d] ?? 1 : 1; break; }
    case 'float': {
      const e = ease('out', d / 8);
      s = 0.3 + 0.7 * e; y += (d / fps) * 0.12 + 0.04 * Math.sin(d / 9 + seed); x += 0.03 * Math.sin(d / 13 + seed);
      rz = 0.06 * Math.sin(d / 11 + seed); break;
    }
    case 'stamp': {
      const e = ease('snap', d / (p.w.key ? 6 : 4));
      s = p.w.key ? 2.6 - 1.6 * e : 1.4 - 0.4 * e; rz = (p.w.key ? -0.12 : -0.04) * (1 - e) + (rnd(seed) - 0.5) * 0.08; break;
    }
    case 'glass': {                                         // written on the glass, left to right, like a finger in fog
      const dur = Math.max(4, Math.min(10, p.w.to - p.w.from));
      sx = ease('out', d / dur); x = p.x - (w * (1 - sx)) / 2; op = 0.92; break;
    }
    case 'card': {                                          // dealt in from the side with a spin
      const e = ease('out', d / 9);
      x = p.x + (1 - e) * -3.2; y = p.y + (1 - e) * 1.6; z = (1 - e) * 1.2; rz = (1 - e) * 2.4 + (rnd(seed) - 0.5) * 0.12; break;
    }
    case 'ticker': { const e = ease('out', d / 4); y += (1 - e) * -p.size; op = e; break; }
    default: break;
  }
  op *= out;
  mat.opacity = op;
  return (
    <mesh position={[x, y, z]} rotation={[0, 0, rz]} scale={[w * s * sx, h * s, 1]} material={mat} renderOrder={6} castShadow={L.lit || card}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
};

export const Words3D: React.FC<{L: Lyrics; words: Word3[]; f: number; fps: number; tone?: LyricTone; beats?: number[]; cam?: [number, number, number]; lens?: THREE.Camera}> = ({L: L0, words, f, fps, tone, beats, cam, lens}) => {
  const L = L0.lens && lens ? lensPlace(L0, lens) : L0;     // a block riding the lens (lyricLayout lensPlace)
  if (L.style === 'v2' || L.kind === 'firework') return <WordsV2 L={L} words={words} f={f} fps={fps} tone={tone} beats={beats ?? []} cam={cam} />;
  const card = L.kind === 'card';
  const started = words.filter((w) => w.from <= f);
  if (!started.length) return null;
  const line = started[started.length - 1].line;
  const lineWords = words.filter((w) => w.line === line);
  const nextLine = words.find((w) => w.line > line);
  const lastEnd = Math.max(...lineWords.map((w) => w.to));
  // a line stays until the next line starts, or 1 s after its last word; then fades in 6 frames
  const until = nextLine ? nextLine.from : lastEnd + fps;
  const out = f < until ? 1 : Math.max(0, 1 - (f - until) / 6);
  const lk = `${JSON.stringify(L)}|${line}|${lineWords.map((w) => w.w + w.key).join(' ')}`;
  let placed = layouts.get(lk);
  if (!placed) { placed = layout(lineWords, L, card); layouts.set(lk, placed); }
  if (out <= 0) return null;
  let tickerX = 0;
  if (L.kind === 'ticker') tickerX = -((f - lineWords[0].from) / fps) * L.size * 0.9;
  let panel: React.ReactNode = null;
  if (L.material === 'screen') {                          // a phone's camera UI behind the line: dark bar, REC, corners
    const shown = placed.filter((p) => p.w.from <= f);
    const xs = shown.flatMap((p) => { const h = p.size * p.tex.hScale; return [p.x - (h * p.tex.aspect) / 2, p.x + (h * p.tex.aspect) / 2]; });
    const ys = shown.flatMap((p) => { const h = p.size * p.tex.hScale; return [p.y - h / 2, p.y + h / 2]; });
    const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
    panel = (
      <mesh position={[(Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2, -0.002]} scale={[w * 1.06, h * 1.1, 1]} renderOrder={5}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={screenPanel()} transparent opacity={out} depthWrite={false} toneMapped={false} />
      </mesh>
    );
  }
  return (
    <group position={[L.anchor[0], L.anchor[1], L.anchor[2]]} rotation={[0, (L.rotY * Math.PI) / 180, 0]}>
      {panel}
      <group position={[tickerX, 0, 0]}>
        {placed.filter((p) => p.w.from <= f).map((p) => (
          <WordMesh key={`${p.w.line}-${p.w.idx}`} p={p} L={L} f={f} fps={fps} out={out} card={card} />
        ))}
      </group>
    </group>
  );
};

function screenPanel(): THREE.CanvasTexture {
  return canvasTexture('screen_panel', 512, 192, (ctx, W, H) => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(8,6,18,0.8)';
    ctx.beginPath(); ctx.roundRect(2, 2, W - 4, H - 4, 22); ctx.fill();
    ctx.fillStyle = '#ff3b4e'; ctx.beginPath(); ctx.arc(26, 26, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 4;
    for (const [x, y, dx, dy] of [[12, 12, 1, 1], [W - 12, 12, -1, 1], [12, H - 12, 1, -1], [W - 12, H - 12, -1, -1]]) {
      ctx.beginPath(); ctx.moveTo(x, y + dy * 22); ctx.lineTo(x, y); ctx.lineTo(x + dx * 22, y); ctx.stroke();
    }
  });
}

// ================================================================ lyrics v2 (toki 2026-10-19)
// "zu klein, zu dünn, wirken aufgesetzt; romaji / englisch unten mit": her HEAVY weight, no outline ring - a soft
// shadow in the scene's own shadow colour instead; colours from the shot's grade (grade.ts LyricTone); painted words
// are LIT by the set (toon, with a floor so they never go dull) and cast a real shadow onto the set; the block lies on
// its surface in perspective (tilt / roll); words pop on their syllable and swell while they are sung; under a Japanese
// line its romaji (following the voice) and its English. Light words glow and light the set around them.
const PX2 = 160;

function v2Texture(text: string, color: string, shadow: string, material: LyricMaterial | null | undefined, accent: string): THREE.CanvasTexture {
  const W = Math.ceil((measureV2(text) + 2 * PAD_EM) * PX2), H = Math.ceil(TEX_EM * PX2);
  return canvasTexture(`v2|${text}|${color}|${shadow}|${material ?? ''}|${accent}`, W, H, (ctx) => {
    ctx.font = `${PX2}px RaymiHeavy`;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'center';
    const x = W / 2, y = PX2 * 1.02;
    switch (material) {
      case 'light':                               // drawn in light: a soft dark bed (contrast over flames / her dress),
        // a coloured glow, then a CRISP coloured core. Was additive with a white core: on bright parts it clipped to
        // white blobs ("fire" unreadable, Firestarter boards 2026-10-19)
        ctx.shadowColor = shadow; ctx.shadowBlur = PX2 * 0.16; ctx.fillStyle = shadow; ctx.globalAlpha = 0.85; ctx.fillText(text, x, y);
        // a dark halo ring: light words read on dark violet AND on bright glow (FIRESTARTER pilots: thin, low contrast)
        ctx.shadowBlur = 0; ctx.globalAlpha = 0.9; ctx.lineJoin = 'round'; ctx.lineWidth = PX2 * 0.12; ctx.strokeStyle = shadow; ctx.strokeText(text, x, y);
        ctx.globalAlpha = 1; ctx.shadowColor = accent; ctx.shadowBlur = PX2 * 0.22; ctx.fillStyle = color; ctx.fillText(text, x, y);
        ctx.shadowBlur = 0; ctx.fillText(text, x, y); return;
      case 'engraved':                            // cut into the surface: light lip below, dark groove
        ctx.fillStyle = 'rgba(255,240,200,0.7)'; ctx.fillText(text, x + 3, y + 5);
        ctx.fillStyle = shadow; ctx.fillText(text, x, y);
        ctx.fillStyle = color; ctx.globalAlpha = 0.4; ctx.fillText(text, x - 2, y - 2); ctx.globalAlpha = 1; return;
      case 'print': case 'felt':                  // printed ON the object: flat ink, it takes the object's light
        ctx.fillStyle = color; ctx.globalAlpha = material === 'felt' ? 0.9 : 1; ctx.fillText(text, x, y); ctx.globalAlpha = 1; return;
      case 'fog':                                 // a finger through breath on glass
        ctx.shadowColor = 'rgba(230,245,255,0.9)'; ctx.shadowBlur = 24; ctx.fillStyle = 'rgba(236,248,255,0.8)'; ctx.fillText(text, x, y); return;
      default:                                    // painted ink, a soft shadow in the scene's shadow colour (no ring)
        ctx.shadowColor = shadow; ctx.shadowBlur = PX2 * 0.1; ctx.shadowOffsetY = PX2 * 0.07; ctx.shadowOffsetX = PX2 * 0.03;
        ctx.fillStyle = color; ctx.fillText(text, x, y);
    }
  });
}

const emOf = new Map<string, number>();
function measureV2(t: string): number {
  let v = emOf.get(t);
  if (v === undefined) {
    const m = document.createElement('canvas').getContext('2d')!;
    m.font = `${PX2}px RaymiHeavy`;
    v = m.measureText(t).width / PX2;
    emOf.set(t, v);
  }
  return v;
}

const ItemMesh: React.FC<{it: Item; L: Lyrics; color: string; shadow: string; accent: string; s: number; dy: number; op: number; reveal?: number}> = ({it, L, color, shadow, accent, s, dy, op, reveal = 1}) => {
  const tex = v2Texture(it.text, color, shadow, L.material, accent);
  const glow = L.material === 'light';
  const lit = !glow && L.material !== 'fog' && L.material !== 'screen';
  const mat = useMemo(() => (lit
    // lit by the set; the emissive floor (65 % of its own colour) keeps it readable when the key light is behind it or the
    // set is dark (look-critic stills 3: lit lines went muddy brown in the museum)
    ? new THREE.MeshToonMaterial({map: tex, gradientMap: toonRamp(), transparent: true, alphaTest: 0.04, side: THREE.DoubleSide,
      emissive: new THREE.Color('#a6a6a6'), emissiveMap: tex, fog: false, depthTest: false, depthWrite: false})
    : new THREE.MeshBasicMaterial({map: tex, transparent: true, alphaTest: 0.02, toneMapped: false, side: THREE.DoubleSide, fog: false,
      blending: THREE.NormalBlending, depthTest: false, depthWrite: false})), [tex, lit, glow]);
  // toki 2026-10-20 (FIRESTARTER final): "oft abgeschnitten / hinter Assets" - a sung line is never hidden by the set,
  // a prop, a creature or her (depthTest off, drawn last) and never swallowed by the fog of a dark scene
  const depth = useMemo(() => new THREE.MeshDepthMaterial({depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5, side: THREE.DoubleSide}), [tex]);
  // reveal < 1: only the left part is burned in yet (a crack writing the word) - the plane and its UVs end at the front
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const r = Math.max(0.001, Math.min(1, reveal));
  const pos = geo.attributes.position as THREE.BufferAttribute, uv = geo.attributes.uv as THREE.BufferAttribute;
  for (const i of [1, 3]) { pos.setX(i, -0.5 + r); uv.setX(i, r); }
  pos.needsUpdate = true; uv.needsUpdate = true;
  mat.opacity = op;
  const w = it.w * s, h = it.h * s;
  return (
    <group position={[it.x - w / 2, it.y + dy, 0]}>
      <mesh geometry={geo} position={[w / 2, 0, 0]} scale={[w, h, 1]} material={mat} renderOrder={40}
        castShadow={lit && op > 0.5} customDepthMaterial={depth} />
      {r < 1 ? (
        <mesh position={[w * r, 0, 0.01]} scale={[h * 0.55, h * 0.8, 1]} renderOrder={41}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={blobTex('#fff1d6')} transparent opacity={0.95 * op} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ) : null}
    </group>
  );
};

function blobTex(c: string): THREE.CanvasTexture {
  return canvasTexture(`wblob${c}`, 64, 64, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
}

/** The glyph points of a word (where its ink is), in the word plane's units (-0.5..0.5), sampled once per text. */
const glyphPts = new Map<string, [number, number][]>();
function glyphPoints(text: string): [number, number][] {
  let pts = glyphPts.get(text);
  if (pts) return pts;
  const tex = v2Texture(text, '#ffffff', 'rgba(0,0,0,0)', null, '#ffffff');
  const cv = tex.image as HTMLCanvasElement;
  const ctx = cv.getContext('2d')!;
  const {width: W, height: H} = cv;
  const data = ctx.getImageData(0, 0, W, H).data;
  pts = [];
  const step = Math.max(3, Math.round(Math.sqrt((W * H) / 2600)));
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
    if (data[(y * W + x) * 4 + 3] > 140) pts.push([x / W - 0.5, 0.5 - y / H]);
  }
  glyphPts.set(text, pts);
  return pts;
}

/** Firework words (FIRESTARTER wow 5): a shell climbs to the word's spot in the 12 frames before its syllable, bursts on
 *  it, and the sparks fly OUT to the word's own letters - then twinkle and sink slowly. The readable letters in light
 *  glow up under the sparks; `mirror` (a water height) lays their reflection on the sea for the lens. */
const FireworkWord: React.FC<{it: Item; w: Word3; f: number; out: number; color: string; accent: string; shadow: string; L: Lyrics;
  world: THREE.Matrix4; cam?: [number, number, number]}> = ({it, w, f, out, color, accent, shadow, L, world, cam}) => {
  const d = f - w.from;
  const c = it.key ? accent : color;
  if (d < -12) return null;
  if (d < 0) {                                                         // the shell climbing to its spot
    const u = 1 + d / 12, y = it.y - (1 - u) * (1 - u) * 6;
    return (
      <group>
        <mesh position={[it.x, y, 0]} scale={0.06}><sphereGeometry args={[1, 8, 6]} /><meshBasicMaterial color="#fff2dc" toneMapped={false} /></mesh>
        <mesh position={[it.x, y - 0.4, 0]} scale={[0.02, 0.8, 0.02]}><boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={c} transparent opacity={0.6} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} /></mesh>
      </group>
    );
  }
  const pts = glyphPoints(it.text);
  const R = Math.min(1, d / 7);                                        // the burst reaches the letters in 7 frames
  const sink = Math.max(0, d - 20) * 0.0015 * it.h;
  const arr = new Float32Array(pts.length * 3);
  const e = ease('out', R);
  pts.forEach(([px, py], i) => {
    const tx = it.x + px * it.w, ty = it.y + py * it.h - sink * (0.5 + rnd(i) * 0.8);
    arr[i * 3] = it.x + (tx - it.x) * e + (rnd(i * 3) - 0.5) * 0.02 * it.h * Math.sin(f / 3 + i);
    arr[i * 3 + 1] = it.y + (ty - it.y) * e;
    arr[i * 3 + 2] = (rnd(i * 7) - 0.5) * 0.04 * it.h;
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const tw = 0.75 + 0.25 * Math.sin(f / 2.3 + w.idx);
  const size = Math.max(0.012, it.h * 0.07);
  const text = Math.min(1, Math.max(0, (d - 4) / 8)) * out;
  // the reflection of the letters on the water, as seen from the lens (a light above the sea mirrors below it)
  let mirror: React.ReactNode = null;
  if (typeof L.mirror === 'number' && cam && cam[1] > L.mirror + 0.05) {
    const C = new THREE.Vector3(...cam);
    const ref = new Float32Array(pts.length * 3);
    const inv = world.clone().invert();
    const loc = new THREE.Vector3();
    for (let i = 0; i < pts.length; i++) {
      loc.set(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]).applyMatrix4(world);
      const hh = loc.y - L.mirror;
      if (hh <= 0) continue;
      const m = new THREE.Vector3(loc.x, L.mirror - hh, loc.z);
      const t = (C.y - L.mirror) / (C.y - L.mirror + hh);
      const q = C.clone().lerp(m, t).setY(L.mirror + 0.02).applyMatrix4(inv);
      ref[i * 3] = q.x; ref[i * 3 + 1] = q.y; ref[i * 3 + 2] = q.z;
    }
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.BufferAttribute(ref, 3));
    mirror = (
      <points geometry={g2} renderOrder={6}>
        <pointsMaterial map={blobTex(c)} color={c} size={size * 1.4} transparent opacity={0.4 * out * tw} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </points>
    );
  }
  return (
    <group>
      {d < 5 ? (
        <mesh position={[it.x, it.y, 0]} scale={it.h * 2.5 * (1 + d * 0.4)} renderOrder={7}><sphereGeometry args={[0.5, 12, 8]} />
          <meshBasicMaterial map={blobTex(c)} transparent opacity={0.8 * (1 - d / 5)} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} side={THREE.BackSide} /></mesh>
      ) : null}
      {text > 0 ? <ItemMesh it={it} L={{...L, material: 'light'}} color={c} shadow={shadow} accent={accent} s={1} dy={-sink * 0.5} op={text} /> : null}
      <points geometry={geo} renderOrder={8}>
        <pointsMaterial map={blobTex('#fff4e0')} color={c} size={size} transparent opacity={out * tw} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </points>
      {mirror}
    </group>
  );
};

const v2layouts = new Map<string, Item[]>();

const WordsV2: React.FC<{L: Lyrics; words: Word3[]; f: number; fps: number; tone?: LyricTone; beats: number[]; cam?: [number, number, number]}> = ({L, words, f, fps, tone, beats, cam}) => {
  const fw = L.kind === 'firework';                                 // firework words: the shell climbs 12 frames early
  const started = words.filter((w) => w.from <= f + (fw ? 12 : 0));
  if (!started.length) return null;
  const line = started[started.length - 1].line;
  const lineWords = words.filter((w) => w.line === line);
  const nextLine = words.find((w) => w.line > line);
  const lastEnd = Math.max(...lineWords.map((w) => w.to));
  const until = nextLine ? nextLine.from - (fw ? 12 : 0) : lastEnd + fps;
  const out = f < until ? 1 : Math.max(0, 1 - (f - until) / 6);
  if (out <= 0) return null;
  const lk = `${JSON.stringify(L)}|${line}`;
  let items = v2layouts.get(lk);
  if (!items) { items = blockLayout(lineWords, subOf(L, line), L, (t) => measureV2(t)); v2layouts.set(lk, items); }
  const auto = L.auto !== false && tone;
  const col = auto ? tone.color : L.color, acc = auto ? tone.accent : L.accent, subC = auto ? tone.sub : L.color;
  const shadow = tone?.shadow ?? 'rgba(10,4,30,0.85)';
  const k = lineWords.filter((w) => w.from <= f).length;
  const romaN = items.filter((i) => i.kind === 'roma').length;
  const first = lineWords[0].from;
  const breath = (1 + 0.02 * flare(beats, f, 6)) * (0.94 + 0.06 * out);     // the block breathes on the beat
  const ys = items.map((i) => i.y);
  const world = new THREE.Matrix4().compose(new THREE.Vector3(...L.anchor), new THREE.Quaternion().setFromEuler(blockRotation(L)), new THREE.Vector3(breath, breath, 1));
  return (
    <group position={[L.anchor[0], L.anchor[1], L.anchor[2]]} rotation={blockRotation(L)} scale={[breath, breath, 1]}>
      {L.material === 'light' ? <pointLight position={[0, (Math.max(...ys) + Math.min(...ys)) / 2, 0.3]} color={acc} intensity={2.4 * out} distance={3.5} decay={1.6} /> : null}
      {items.map((it) => {
        let s = 1, dy = 0, op = out, reveal = 1;
        if (it.kind === 'main') {
          const w = lineWords.find((x) => x.idx === it.idx)!;
          if (fw) return <FireworkWord key={`fw${it.idx}`} it={it} w={w} f={f} out={out} color={col} accent={acc} shadow={shadow} L={L} world={world} cam={cam} />;
          const d = f - w.from;
          if (d < 0) return null;
          const e = ease('snap', d / 7);
          s = 0.6 + 0.4 * e;
          dy = -(1 - e) * 0.25 * it.size;
          const dur = Math.max(4, w.to - w.from);
          if (d <= dur) s *= 1 + (w.key ? 0.12 : 0.06) * (1 - d / dur);   // swells while it is sung
          op *= Math.min(1, 0.35 + d / 3);
          if (L.reveal === 'burn') {                                   // a crack writes the word: no pop, a burning front
            reveal = (d + 1) / Math.max(4, Math.min(14, dur));
            s = 1; dy = 0; op = out;
          }
        } else {
          if (it.kind === 'roma' && it.idx >= romaShown(k, lineWords.length, romaN)) return null;
          const d = f - first - (it.kind === 'en' ? 3 : 0);
          if (d < 0) return null;
          op *= Math.min(1, d / 6);
          dy = -(1 - ease('out', d / 6)) * 0.12 * it.size;
        }
        let c = it.kind === 'main' ? (it.key ? acc : col) : it.kind === 'roma' ? subC : col;
        if (it.kind === 'main' && !it.key && typeof L.dim === 'number') c = `#${new THREE.Color(c).multiplyScalar(L.dim).getHexString()}`;
        return <ItemMesh key={`${it.kind}${it.idx}`} it={it} L={L} color={c} shadow={shadow} accent={acc} s={s} dy={dy} op={op} reveal={reveal} />;
      })}
    </group>
  );
};
