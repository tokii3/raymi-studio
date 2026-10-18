// Pre-render guard (hard rule 9): a sprite edge where the source image cut her figure must never be on screen.
// Uses the same camera + puppet math as the renderer. Runs before every render (render.mjs / stills.mjs) and fails
// loudly with the shot, frame and side. A point below the floor counts as hidden (sets have opaque floors).
import * as THREE from 'three';
import {cameraAt, fovFor, planeSize, puppetAt} from './motion';
import type {FilmProps, PuppetKey, Shot, V3} from './types';
import type {Pose} from './motion';

export function makeCamera(shot: Shot, f: number, aspect: number, hits: number[], fps: number): THREE.PerspectiveCamera {
  const c = cameraAt(shot.camera, f, hits, shot.kick, fps);
  const cam = new THREE.PerspectiveCamera(fovFor(c.fov, aspect), aspect, 0.05, 200);
  cam.position.set(...c.pos);
  cam.up.set(0, 1, 0);
  cam.lookAt(new THREE.Vector3(...c.look));
  if (c.roll) cam.rotateZ((c.roll * Math.PI) / 180);
  cam.updateMatrixWorld(true);
  cam.updateProjectionMatrix();
  return cam;
}

/** World matrix of her sprite plane (origin at the feet line, plane centred horizontally). */
export function puppetMatrix(p: Pose, camPos: V3): THREE.Matrix4 {
  const k = p.key;
  const yaw = Math.atan2(camPos[0] - p.pos[0], camPos[2] - p.pos[2]);   // faces the lens (cylindrical billboard)
  // a lens high above her (top-down) would see the plane edge-on: from 35 deg up the plane tilts back toward it
  const flat = Math.hypot(camPos[0] - p.pos[0], camPos[2] - p.pos[2]);
  const elev = Math.atan2(camPos[1] - (p.pos[1] + p.lift + 0.6), flat);
  const pitch = elev * Math.min(1, Math.max(0, (elev - 0.6) / 0.5));
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-pitch, yaw, (-p.rot * Math.PI) / 180, 'YXZ'));
  m.compose(new THREE.Vector3(p.pos[0], p.pos[1] + p.lift, p.pos[2]), q,
    new THREE.Vector3(p.sx * p.turn * (k.flip ? -1 : 1), p.sy, 1));
  return m;
}

/** Local corner coordinates of the plane: x in [-w/2, w/2], y from -(1-feet)h (bottom) to feet*h (top). */
export function planeEdges(k: PuppetKey): Record<string, [THREE.Vector3, THREE.Vector3]> {
  const {w, h} = planeSize(k);
  const top = k.feet * h, bot = -(1 - k.feet) * h, l = -w / 2, r = w / 2;
  const ix = w * 0.01, iy = h * 0.01;                       // 1 % inside: the last opaque pixels
  return {
    top: [new THREE.Vector3(l, top - iy, 0), new THREE.Vector3(r, top - iy, 0)],
    bottom: [new THREE.Vector3(l, bot + iy, 0), new THREE.Vector3(r, bot + iy, 0)],
    left: [new THREE.Vector3(l + ix, bot, 0), new THREE.Vector3(l + ix, top, 0)],
    right: [new THREE.Vector3(r - ix, bot, 0), new THREE.Vector3(r - ix, top, 0)],
  };
}

export type EdgeFault = {shot: string; frame: number; side: string; sprite: string};

export function visibleCutEdges(shot: Shot, f: number, aspect: number, hits: number[], fps: number): EdgeFault[] {
  const p = puppetAt(shot.puppets, f, fps);
  if (!p || !p.key.cuts.length) return [];
  const cam = makeCamera(shot, f, aspect, hits, fps);
  const m = puppetMatrix(p, [cam.position.x, cam.position.y, cam.position.z]);
  const edges = planeEdges(p.key);
  const out: EdgeFault[] = [];
  for (const side of p.key.cuts) {
    const [a, b] = edges[side];
    for (let i = 0; i <= 12; i++) {
      const w = a.clone().lerp(b, i / 12).applyMatrix4(m);
      if (w.y < -0.01 && cam.position.y > 0) continue;      // under the floor
      const n = w.clone().project(cam);
      if (n.z > -1 && n.z < 1 && Math.abs(n.x) < 0.995 && Math.abs(n.y) < 0.995) {
        out.push({shot: shot.id, frame: f, side, sprite: p.key.sprite});
        break;
      }
    }
  }
  return out;
}

/** All frames of the film; returns the faults (empty = safe to render). */
export function checkFilm(props: FilmProps, frames?: [number, number]): EdgeFault[] {
  const aspect = props.width / props.height;
  const [a, b] = frames ?? [0, props.durationInFrames - 1];
  const faults: EdgeFault[] = [];
  for (const s of props.shots) {
    for (let f = Math.max(a, s.from); f <= Math.min(b, s.to - 1); f++) {
      faults.push(...visibleCutEdges(s, f, aspect, props.hits, props.fps));
    }
  }
  return faults;
}

/** Where things land in the frame (x, y in 0..1 from top-left; null = behind the lens) - authoring aid, no render. */
export function framingReport(props: FilmProps): string[] {
  const aspect = props.width / props.height;
  const out: string[] = [];
  const at = (cam: THREE.PerspectiveCamera, v: THREE.Vector3) => {
    const n = v.clone().project(cam);
    if (n.z >= 1 || n.z <= -1) return 'behind';
    const x = (n.x + 1) / 2, y = (1 - n.y) / 2;
    const tag = x < 0 || x > 1 || y < 0 || y > 1 ? ' OUT' : '';
    return `(${x.toFixed(2)}, ${y.toFixed(2)})${tag}`;
  };
  for (const s of props.shots) {
    for (const f of [s.from, Math.round((s.from + s.to) / 2), s.to - 1]) {
      const cam = makeCamera(s, f, aspect, [], props.fps);
      const parts = [`${s.id} f${f}`];
      const p = puppetAt(s.puppets, f, props.fps);
      if (p) {
        const m = puppetMatrix(p, [cam.position.x, cam.position.y, cam.position.z]);
        const {h} = planeSize(p.key);
        parts.push(`head ${at(cam, new THREE.Vector3(0, (p.key.feet - p.key.top - 0.08) * h, 0).applyMatrix4(m))}`);
        parts.push(`feet ${at(cam, new THREE.Vector3(0, 0, 0).applyMatrix4(m))}`);
      }
      if (s.lyrics) parts.push(`lyrics ${at(cam, new THREE.Vector3(...s.lyrics.anchor))}`);
      for (const t of s.texts ?? []) {
        const [w, h] = t.size;
        parts.push(`${t.name} ${at(cam, new THREE.Vector3(t.center[0] - w / 2, t.center[1] + h / 2, t.center[2]))}..${at(cam, new THREE.Vector3(t.center[0] + w / 2, t.center[1] - h / 2, t.center[2]))}`);
      }
      out.push(parts.join('  '));
    }
  }
  return out;
}

/** The world point that appears at screen (sx, sy in 0..1 from top-left) at `dist` metres from the lens in a shot's
 *  frame f - for placing lyric anchors and props where the picture needs them (authoring aid). */
export function placeAt(props: FilmProps, shot: number, f: number, sx: number, sy: number, dist: number): V3 {
  const s = props.shots[shot];
  const cam = makeCamera(s, f, props.width / props.height, [], props.fps);
  const v = new THREE.Vector3(sx * 2 - 1, 1 - sy * 2, 0.5).unproject(cam).sub(cam.position).normalize();
  const p = cam.position.clone().addScaledVector(v, dist);
  return [Number(p.x.toFixed(2)), Number(p.y.toFixed(2)), Number(p.z.toFixed(2))];
}

// ---------------------------------------------------------------- lyrics stay readable inside the frame
// The renderer measures words with the real font; here (node, no font) a word's width is estimated from its characters:
// kana / kanji ~1 em, Latin ~0.62 em, plus the texture padding. Slightly generous, so a pass here is a real pass.
const em = (ch: string) => (/[　-鿿＀-￯]/.test(ch) ? 1.18 : ch === ' ' ? 0.35 : 0.7);   // her marker font is wide
export function wordBox(w: {w: string; key: boolean; em?: number | null}, L: {size: number; width: number; kind?: string; material?: string | null}): {width: number; height: number} {
  let size = L.size * (w.key ? 2.2 : 1);
  const screen = L.material === 'screen', card = L.kind === 'card';      // Words3D pads a UI bar / a card face
  const pad = card ? 140 : screen ? 180 : 80, extra = card ? 80 / 180 : screen ? 60 / 180 : 0;
  const hScale = (1.35 + extra) / 0.72;
  // the word's real advance in her font (timeline.py measures it) + 4 % - the estimate only for old props
  const text = w.em != null ? w.em * 1.04 : [...w.w].reduce((a, c) => a + em(c), 0);
  const aspect = (text + pad / 180) / (1.35 + extra);
  let width = size * hScale * aspect;
  if (width > L.width) { size *= L.width / width; width = L.width; }
  return {width, height: size * hScale};
}

/** Settled corners of a lyric line block (same wrapping as Words3D.layout), in world space. */
export function lineCorners(s: Shot, line: number): THREE.Vector3[] {
  const L = s.lyrics!;
  const ws = s.words.filter((w) => w.line === line);
  const gap = L.size * 0.35;
  const rows: {w: number; h: number}[] = [{w: 0, h: 0}];
  for (const w of ws) {
    const b = wordBox(w, L);
    const r = rows[rows.length - 1];
    if (r.w > 0 && r.w + gap + b.width > L.width) rows.push({w: 0, h: 0});
    const rr = rows[rows.length - 1];
    rr.w += (rr.w ? gap : 0) + b.width;
    rr.h = Math.max(rr.h, b.height * 0.68);           // ~ visible glyph height inside the padded texture
  }
  // conservative: the real font may be narrower than the estimate and fit ONE row up to the wrap width
  const single = ws.reduce((a, w) => a + wordBox(w, L).width, 0) + gap * (ws.length - 1);
  const W = Math.max(Math.max(...rows.map((r) => r.w)), Math.min(L.width, single)), H = rows.reduce((a, r) => a + r.h, 0);
  const rot = new THREE.Matrix4().makeRotationY((L.rotY * Math.PI) / 180);
  const o = new THREE.Vector3(...L.anchor);
  return [[-W / 2, H / 2], [W / 2, H / 2], [-W / 2, -H / 2], [W / 2, -H / 2]].map(([x, y]) =>
    new THREE.Vector3(x, y, 0).applyMatrix4(rot).add(o));
}

export type TextFault = {shot: string; frame: number; line: number; text: string; why?: string};

/** Every frame a lyric line is fully shown (from its last word on, settled), all of it must be inside the frame. */
export function lyricsOutOfFrame(props: FilmProps): TextFault[] {
  const aspect = props.width / props.height;
  const out: TextFault[] = [];
  for (const s of props.shots) {
    if (!s.lyrics || s.lyrics.kind === 'ticker') continue;   // tickers scroll through the frame on purpose
    const float = s.lyrics.kind === 'float';                  // bubbles rise out - but must be read whole first (pilot 1)
    const lines = [...new Set(s.words.map((w) => w.line))];
    for (const line of lines) {
      const ws = s.words.filter((w) => w.line === line);
      const next = s.words.find((w) => w.line > line);
      const z = Math.min(s.to, next ? next.from : Math.max(...ws.map((w) => w.to)) + props.fps);
      // settled 6 frames after the last word - but a word landing at the very end of a shot is still checked (KING
      // on the LED in king-again was never tested because its last word fell inside the shot's final 6 frames)
      const last = Math.max(...ws.map((w) => w.from));
      const a = Math.max(Math.min(...ws.map((w) => w.from)), Math.min(last + 6, z - 1));
      const zz = float ? Math.min(z, a + 18) : z;
      const corners0 = lineCorners(s, line);
      // every frame, with the real camera kick on the music hits (pilot 1: a stamp clipped by the punch on a hit)
      for (let f = a; f < zz; f++) {
        const rise = float ? ((f - last) / props.fps) * 0.12 + 0.04 : 0;     // Words3D float: rises 0.12 m/s
        const corners = rise ? corners0.map((c) => c.clone().add(new THREE.Vector3(0, rise, 0))) : corners0;
        const cam = makeCamera(s, f, aspect, props.hits, props.fps);
        // inside the typographic safe area (4 % margin): a word touching the frame edge reads as clipped (pilot 1)
        const bad = corners.some((c) => { const n = c.clone().project(cam); return n.z >= 1 || Math.abs(n.x) > 0.92 || Math.abs(n.y) > 0.92; });
        if (bad) { out.push({shot: s.id, frame: f, line, text: ws.map((w) => w.w).join(' '), why: 'leaves the frame'}); break; }
        // text on her face hides the one thing the viewer looks at (blind viewer, style test 2) - unless the script wants it
        const p = s.lyrics.over ? null : puppetAt(s.puppets, f, props.fps);
        if (p && p.key.head) {
          const m = puppetMatrix(p, [cam.position.x, cam.position.y, cam.position.z]);
          const {w, h} = planeSize(p.key);
          const [x0, y0, x1, y1] = p.key.head;
          const hp = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([u, v]) =>
            new THREE.Vector3((u - 0.5) * w, (p.key.feet - v) * h, 0).applyMatrix4(m).project(cam));
          const tp = corners.map((c) => c.clone().project(cam));
          const box = (ps: THREE.Vector3[]) => [Math.min(...ps.map((q) => q.x)), Math.min(...ps.map((q) => q.y)), Math.max(...ps.map((q) => q.x)), Math.max(...ps.map((q) => q.y))];
          const [a0, b0, a1, b1] = box(hp), [c0, d0, c1, d1] = box(tp);
          const inter = Math.max(0, Math.min(a1, c1) - Math.max(a0, c0)) * Math.max(0, Math.min(b1, d1) - Math.max(b0, d0));
          if (inter > 0.15 * (a1 - a0) * (b1 - b0)) { out.push({shot: s.id, frame: f, line, text: ws.map((x) => x.w).join(' '), why: 'covers her face'}); break; }
          // the hero hidden behind her own text (pilot 2: a huge stamp over a tiny Raymi in a wide)
          const fp = [[0, p.key.top], [1, p.key.top], [0, p.key.feet], [1, p.key.feet]].map(([u, v]) =>
            new THREE.Vector3((u - 0.5) * w, (p.key.feet - v) * h, 0).applyMatrix4(m).project(cam));
          const [e0, g0, e1, g1] = box(fp);
          const fig = Math.max(0, Math.min(e1, c1) - Math.max(e0, c0)) * Math.max(0, Math.min(g1, d1) - Math.max(g0, d0));
          if (fig > 0.15 * (e1 - e0) * (g1 - g0)) {   // 0.33 let a caption bar cover her torso (grade stills 2026-10-18)
             out.push({shot: s.id, frame: f, line, text: ws.map((x) => x.w).join(' '), why: 'covers her figure'}); break; }
        }
      }
    }
  }
  return out;
}

/** Her face half cut by the frame edge (blind viewer, style test 2 + 3): the head box must be fully inside the frame
 *  or fully outside it - never sliced. Sampled every 3 frames (pure math, before any render). */
export function faceCrops(props: FilmProps): {shot: string; frame: number}[] {
  const aspect = props.width / props.height;
  const out: {shot: string; frame: number}[] = [];
  for (const s of props.shots) {
    for (let f = s.from; f < s.to; f += 3) {
      const p = puppetAt(s.puppets, f, props.fps);
      if (!p || !p.key.head || p.lift < -0.3) continue;
      const cam = makeCamera(s, f, aspect, props.hits, props.fps);
      const m = puppetMatrix(p, [cam.position.x, cam.position.y, cam.position.z]);
      const {w, h} = planeSize(p.key);
      const [x0, y0, x1, y1] = p.key.head;
      const pts = [[x0, y0], [x1, y0], [x0, y1], [x1, y1], [(x0 + x1) / 2, (y0 + y1) / 2]].map(([u, v]) =>
        new THREE.Vector3((u - 0.5) * w, (p.key.feet - v) * h, 0).applyMatrix4(m));
      const inside = pts.map((q) => {
        if (q.y < -0.01 && cam.position.y > 0) return false;         // half buried in sand reads as sliced too (style test 4)
        const n = q.clone().project(cam);
        return n.z < 1 && Math.abs(n.x) <= 1 && Math.abs(n.y) <= 1;
      }).filter((x) => x !== null);
      if (inside.length && inside.some((x) => x) && inside.some((x) => !x)) { out.push({shot: s.id, frame: f}); break; }
    }
  }
  return out;
}

// ---------------------------------------------------------------- authoring aids: per-shot summary + camera fit
export type ShotSummary = {shot: string; index: number; frames: number; cut: Record<string, number>; face: number; extra: string[]; lyrics: string[]};

/** Every guard per shot, counted (not just the first fault): what an author needs to reframe a whole film. */
export function shotSummary(props: FilmProps): ShotSummary[] {
  const aspect = props.width / props.height;
  const text = lyricsOutOfFrame(props);
  return props.shots.map((s, index) => {
    const cut: Record<string, number> = {};
    for (let f = s.from; f < s.to; f++) {
      for (const x of visibleCutEdges(s, f, aspect, props.hits, props.fps)) {
        const k = `${x.sprite.replace('sprites/', '').replace('.png', '')}:${x.side}`;
        cut[k] = (cut[k] ?? 0) + 1;
      }
    }
    const face = faceCrops({...props, shots: [s]}).length;
    const extra = [...setTextCuts({...props, shots: [s]}).map((x) => `"${x.text}" cut by the frame edge f${x.frame}`),
      ...solidFaults({...props, shots: [s]}).map((x) => `${x.why} f${x.frame}`),
      ...lensInside({...props, shots: [s]}).map((x) => `lens ${x.where} f${x.frame}`)];
    return {shot: s.id, index, frames: s.to - s.from, cut, face, extra, lyrics: text.filter((t) => t.shot === s.id).map((t) => {
      const cam = makeCamera(s, t.frame, aspect, [], props.fps);
      const xy = lineCorners(s, t.line).map((v) => { const n = v.clone().project(cam); return n.z >= 1 ? 'behind' : `${((n.x + 1) / 2).toFixed(2)},${((1 - n.y) / 2).toFixed(2)}`; });
      return `"${t.text}" ${t.why} f${t.frame} corners ${xy.join(' ')}`;
    })};
  });
}

function shotPasses(props: FilmProps, s: Shot): boolean {
  const aspect = props.width / props.height;
  for (let f = s.from; f < s.to; f++) if (visibleCutEdges(s, f, aspect, props.hits, props.fps).length) return false;
  const one = {...props, shots: [s]};
  return faceCrops(one).length === 0 && lyricsOutOfFrame(one).length === 0 && setTextCuts(one).length === 0 && lensInside(one).length === 0 && solidFaults(one).length === 0;
}

/** The smallest change to a shot's camera that passes every guard: the lens is kept, the frame tightens (fov) and the
 *  aim drifts toward her head until no cut edge, no sliced face and no lost lyric remains. null = no zoom fixes it
 *  (choose a clean sprite or move her). Returns the new camera keys + the fov factor used (1 = unchanged). */
export function fitShot(props: FilmProps, index: number): {factor: number; aim: number; camera: Shot['camera']} | null {
  const s = props.shots[index];
  if (shotPasses(props, s)) return {factor: 1, aim: 0, camera: s.camera};
  const mid = Math.round((s.from + s.to) / 2);
  const p = puppetAt(s.puppets, mid, props.fps);
  let head: V3 | null = null;
  if (p) {
    const cam = makeCamera(s, mid, props.width / props.height, [], props.fps);
    const m = puppetMatrix(p, [cam.position.x, cam.position.y, cam.position.z]);
    const {h} = planeSize(p.key);
    const v = new THREE.Vector3(0, (p.key.feet - p.key.top - 0.12) * h, 0).applyMatrix4(m);
    head = [v.x, v.y, v.z];
  }
  for (let factor = 0.97; factor >= 0.25; factor -= 0.03) {
    for (const aim of head ? [0, 0.25, 0.5, 0.75] : [0]) {
      const camera = s.camera.map((k) => ({...k, fov: Number((k.fov * factor).toFixed(2)),
        look: (head ? k.look.map((x, i) => Number((x + (head![i] - x) * aim).toFixed(3))) : k.look) as V3}));
      if (shotPasses(props, {...s, camera})) return {factor: Number(factor.toFixed(2)), aim, camera};
    }
  }
  return null;
}

/** A lyric anchor (and size) that keeps every line inside the frame and off her face: the line keeps its distance
 *  from the lens and slides across the screen, nearest to where the script put it first, shrinking only if no spot
 *  fits. null = the shot has no lyrics or nothing fits (rethink the surface). */
export function fitLyrics(props: FilmProps, index: number): {anchor: V3; size: number; width: number} | null {
  const s = props.shots[index];
  if (!s.lyrics) return null;
  const one = (L: Shot['lyrics']) => lyricsOutOfFrame({...props, shots: [{...s, lyrics: L}]}).length === 0;
  if (one(s.lyrics)) return {anchor: s.lyrics.anchor, size: s.lyrics.size, width: s.lyrics.width};
  const firstWord = s.words.length ? Math.min(...s.words.map((w) => w.from)) : s.from;
  const f = Math.max(s.from, Math.min(s.to - 1, firstWord));
  const cam = makeCamera(s, f, props.width / props.height, [], props.fps);
  const a = new THREE.Vector3(...s.lyrics.anchor);
  const n = a.clone().project(cam);
  const dist = Math.max(0.6, a.distanceTo(cam.position));
  const ox = n.z < 1 ? (n.x + 1) / 2 : 0.5, oy = n.z < 1 ? (1 - n.y) / 2 : 0.5;
  const spots: [number, number][] = [];
  for (let y = 0.12; y <= 0.881; y += 0.04) for (let x = 0.2; x <= 0.801; x += 0.05) spots.push([x, y]);
  spots.sort((p, q) => Math.hypot(p[0] - ox, p[1] - oy) - Math.hypot(q[0] - ox, q[1] - oy));
  for (const k of [1, 0.8, 0.65, 0.5, 0.4]) {
    for (const [x, y] of spots) {
      // the words stay on their own surface (the plane through the scripted anchor, facing rotY): slide, never float off
      const ray = new THREE.Vector3(x * 2 - 1, 1 - y * 2, 0.5).unproject(cam).sub(cam.position).normalize();
      const nrm = new THREE.Vector3(Math.sin((s.lyrics.rotY * Math.PI) / 180), 0, Math.cos((s.lyrics.rotY * Math.PI) / 180));
      const den = ray.dot(nrm);
      if (Math.abs(den) < 1e-3) continue;
      const tt = a.clone().sub(cam.position).dot(nrm) / den;
      if (tt < 0.3 || tt > dist * 4) continue;
      const pt = cam.position.clone().addScaledVector(ray, tt);
      const anchor: V3 = [Number(pt.x.toFixed(2)), Number(pt.y.toFixed(2)), Number(pt.z.toFixed(2))];
      const L = {...s.lyrics, anchor, size: Number((s.lyrics.size * k).toFixed(3)), width: Number((s.lyrics.width * k).toFixed(2))};
      if (one(L)) return {anchor, size: L.size, width: L.width};
    }
  }
  return null;
}

// ---------------------------------------------------------------- the set's own text and the lens's place (pilot 2)
/** A readable set prop (a sign, the LED board, a plate) half cut by the frame edge reads as a fault: fully in or out. */
export function setTextCuts(props: FilmProps): {shot: string; frame: number; text: string}[] {
  const aspect = props.width / props.height;
  const out: {shot: string; frame: number; text: string}[] = [];
  for (const s of props.shots) {
    for (const t of s.texts ?? []) {
      const r = new THREE.Matrix4().makeRotationY((t.rot * Math.PI) / 180);
      const [w, h] = t.size;
      const pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [-w / 2, h / 2], [w / 2, h / 2], [0, 0]].map(([x, y]) =>
        new THREE.Vector3(x, y, 0).applyMatrix4(r).add(new THREE.Vector3(...t.center)));
      // passing the edge during a camera move is fine; a sign that STAYS cut for 0.4 s reads as a fault
      let run = 0;
      for (let f = s.from; f < s.to; f++) {
        const cam = makeCamera(s, f, aspect, props.hits, props.fps);
        const inside = pts.map((q) => { const n = q.clone().project(cam); return n.z < 1 && n.z > -1 && Math.abs(n.x) <= 1 && Math.abs(n.y) <= 1; });
        run = inside.some((x) => x) && inside.some((x) => !x) ? run + 1 : 0;
        if (run >= Math.round(props.fps * 0.4) || (run > 0 && f === s.to - 1 && run === s.to - s.from)) { out.push({shot: s.id, frame: f - run + 1, text: t.name}); break; }
      }
    }
  }
  return out;
}

/** The lens inside a place no camera can be (above the water surface, under the sand) - the picture turns to glitch. */
export function lensInside(props: FilmProps): {shot: string; frame: number; where: string}[] {
  const aspect = props.width / props.height;
  const out: {shot: string; frame: number; where: string}[] = [];
  for (const s of props.shots) {
    for (let f = s.from; f < s.to; f += 2) {
      const p = makeCamera(s, f, aspect, props.hits, props.fps).position;
      const box = (s.noLens ?? []).find((b) => p.x > b.min[0] && p.x < b.max[0] && p.y > b.min[1] && p.y < b.max[1] && p.z > b.min[2] && p.z < b.max[2]);
      if (box) { out.push({shot: s.id, frame: f, where: box.name}); break; }
    }
  }
  return out;
}

/** Where the Short's hook / CTA sit (share of the height, below the UI band). */
export const OVERLAY = {hookTop: 0.075, hookH: 0.14, ctaTop: 0.09, ctaH: 0.12};

/** The Short's hook and CTA may never sit on her face (S0 draft: they covered it). */
export function overlayOnFace(props: FilmProps): {shot: string; frame: number; what: string}[] {
  const o = props.overlay;
  if (!o) return [];
  const aspect = props.width / props.height;
  const out: {shot: string; frame: number; what: string}[] = [];
  const spans: [string, number, number, number, number][] = [['hook', o.hook.from, o.hook.to, OVERLAY.hookTop, OVERLAY.hookH]];
  if (o.cta) spans.push(['CTA', o.cta.from, props.durationInFrames, OVERLAY.ctaTop, OVERLAY.ctaH]);
  for (const [what, a, b, top, h] of spans) {
    for (let f = a; f < b; f += 2) {
      const s = props.shots.find((x) => f >= x.from && f < x.to);
      const p = s ? puppetAt(s.puppets, f, props.fps) : null;
      if (!s || !p || !p.key.head) continue;
      const cam = makeCamera(s, f, aspect, props.hits, props.fps);
      const m = puppetMatrix(p, [cam.position.x, cam.position.y, cam.position.z]);
      const {w, h: ph} = planeSize(p.key);
      const ys = [p.key.head[1], p.key.head[3]].map((v) => (1 - new THREE.Vector3(0, (p.key.feet - v) * ph, 0).applyMatrix4(m).project(cam).y) / 2);
      const y0 = Math.min(...ys), y1 = Math.max(...ys);
      if (y1 > top && y0 < top + h) { out.push({shot: s.id, frame: f, what}); break; }
    }
  }
  return out;
}

/** Solid props: the lens is never inside one (or within 0.2 m of it), and her face never hides behind one for 0.4 s
 *  (stills run 19: the lens inside a coin tower; the shell throne between the lens and her). */
export function solidFaults(props: FilmProps): {shot: string; frame: number; why: string}[] {
  const aspect = props.width / props.height;
  const out: {shot: string; frame: number; why: string}[] = [];
  for (const s of props.shots) {
    const boxes = (s.solids ?? []).map((b) => ({name: b.name, box: new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(...b.center), new THREE.Vector3(...b.size))}));
    if (!boxes.length) continue;
    let run = 0, bad: string | null = null;
    for (let f = s.from; f < s.to; f++) {
      const cam = makeCamera(s, f, aspect, props.hits, props.fps);
      const inside = boxes.find((b) => b.box.clone().expandByScalar(0.2).containsPoint(cam.position));
      if (inside) { out.push({shot: s.id, frame: f, why: `lens inside the ${inside.name}`}); bad = 'x'; break; }
      const p = puppetAt(s.puppets, f, props.fps);
      let hidden: string | null = null;
      if (p && p.key.head) {
        const m = puppetMatrix(p, [cam.position.x, cam.position.y, cam.position.z]);
        const {w, h} = planeSize(p.key);
        const [x0, y0, x1, y1] = p.key.head;
        const face = new THREE.Vector3(((x0 + x1) / 2 - 0.5) * w, (p.key.feet - (y0 + y1) / 2) * h, 0).applyMatrix4(m);
        const n = face.clone().project(cam);
        if (n.z < 1 && Math.abs(n.x) < 1 && Math.abs(n.y) < 1) {
          const dir = face.clone().sub(cam.position), dist = dir.length();
          const ray = new THREE.Ray(cam.position.clone(), dir.normalize());
          for (const b of boxes) {
            const hit = ray.intersectBox(b.box, new THREE.Vector3());
            if (hit && hit.distanceTo(cam.position) < dist - 0.15 && !b.box.containsPoint(face)) { hidden = b.name; break; }
          }
        }
      }
      run = hidden ? run + 1 : 0;
      if (run >= Math.round(props.fps * 0.4)) { out.push({shot: s.id, frame: f - run + 1, why: `her face hidden behind the ${hidden}`}); break; }
    }
  }
  return out;
}
