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
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, (-p.rot * Math.PI) / 180, 'YXZ'));
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
export function wordBox(w: {w: string; key: boolean}, L: {size: number; width: number}): {width: number; height: number} {
  let size = L.size * (w.key ? 2.2 : 1);
  const hScale = 1.35 / 0.72;
  const aspect = ([...w.w].reduce((a, c) => a + em(c), 0) + 80 / 180) / 1.35;
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
    if (!s.lyrics || s.lyrics.kind === 'ticker' || s.lyrics.kind === 'float') continue;   // tickers scroll, bubbles rise out
    const lines = [...new Set(s.words.map((w) => w.line))];
    for (const line of lines) {
      const ws = s.words.filter((w) => w.line === line);
      const next = s.words.find((w) => w.line > line);
      const a = Math.max(...ws.map((w) => w.from)) + 6;
      const z = Math.min(s.to, next ? next.from : Math.max(...ws.map((w) => w.to)) + props.fps);
      const corners = lineCorners(s, line);
      for (let f = a; f < z; f += 3) {
        const cam = makeCamera(s, f, aspect, [], props.fps);
        const bad = corners.some((c) => { const n = c.clone().project(cam); return n.z >= 1 || Math.abs(n.x) > 0.985 || Math.abs(n.y) > 0.985; });
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
        }
      }
    }
  }
  return out;
}
