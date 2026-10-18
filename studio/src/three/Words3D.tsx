// Lyrics as objects of the world (PRINCIPLES 11): every word appears with the voice (one frame before its syllable,
// timed from the vocal stem), the key word is big and in the accent colour, and the words live ON something in the
// set - a sign, an air bubble, a stamp, the aquarium glass, a playing card, a ticker. Only Raymi-Regular.ttf: the
// timeline compiler refuses words with glyphs the font lacks (raymi/timeline.py), never a fallback font.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {canvasTexture, rnd, toonRamp} from './look';
import {ease} from '../film/motion';
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

export const Words3D: React.FC<{L: Lyrics; words: Word3[]; f: number; fps: number}> = ({L, words, f, fps}) => {
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
