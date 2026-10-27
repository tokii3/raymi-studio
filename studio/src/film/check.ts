// Pre-render guard (hard rule 9): a sprite edge where the source image cut her figure must never be on screen.
// Uses the same camera + puppet math as the renderer. Runs before every render (render.mjs / stills.mjs) and fails
// loudly with the shot, frame and side. A point below the floor counts as hidden (sets have opaque floors).
import * as THREE from 'three';
import {cameraAt, fovFor, planeSize, puppetAt} from './motion';
import type {FilmProps, PuppetKey, Shot, V3} from './types';
import type {Pose} from './motion';
import {SUB, blockLayout, blockRotation, lensPlace, subOf} from './lyricLayout';

export function makeCamera(shot: Shot, f: number, aspect: number, hits: number[], fps: number): THREE.PerspectiveCamera {
  const c = cameraAt(shot.camera, f, hits, shot.kick, fps);
  // a snap on a sung word (timeline swing_words; K/DA FIRESTARTER study: "a new angle on each hit"): the lens whips
  // round her to a NEW angle in 6 frames and stays there - the burst of the reference as camera moves, not cuts
  let snap = 0, lift = 0;
  (shot.swing ?? []).forEach(([f0, dir], i) => {
    const d = f - f0;
    if (d < 0) return;
    const e = d >= 6 ? 1 : 0.5 - 0.5 * Math.cos((Math.PI * d) / 6);
    snap += dir * 0.45 * e;
    lift += (i % 2 ? -0.22 : 0.22) * e;
  });
  if (snap || lift) {
    const vx = c.pos[0] - c.look[0], vz = c.pos[2] - c.look[2];
    const cs = Math.cos(snap), sn = Math.sin(snap);
    c.pos = [c.look[0] + vx * cs + vz * sn, c.pos[1] + lift, c.look[2] - vx * sn + vz * cs];
    c.roll += snap * 8;
  }
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

/** Lyrics v2: the block's items (main line + romaji + English) with the exact widths timeline.py measured. */
export function v2Items(s: Shot, line: number) {
  const L = s.lyrics!;
  const ws = s.words.filter((w) => w.line === line);
  const sub = subOf(L, line);
  const est = (t: string) => [...t].reduce((a, c) => a + em(c), 0);
  return blockLayout(ws, sub, L, (t, kind, idx) => (kind === 'main' ? ws.find((w) => w.idx === idx)?.em
    : kind === 'roma' ? sub?.romaEm?.[idx] : sub?.enEm?.[idx]) ?? est(t));
}

/** Settled corners of a lyric line block (same wrapping as Words3D), in world space. */
export function lineCorners(s: Shot, line: number, f?: number): THREE.Vector3[] {
  const L = s.lyrics!;
  if (L.style === 'v2') {
    // f given: only the words already out at frame f (+ the romaji / English rows, they come with the first word)
    const it = v2Items(s, line).filter((i) => f === undefined || i.kind !== 'main' || (s.words.find((w) => w.line === line && w.idx === i.idx)?.from ?? 0) <= f);
    const x0 = Math.min(...it.map((i) => i.x - i.w / 2)), x1 = Math.max(...it.map((i) => i.x + i.w / 2));
    const y0 = Math.min(...it.map((i) => i.y - i.h / 2)), y1 = Math.max(...it.map((i) => i.y + i.h / 2));
    const m = 1.06;                                   // a sung word swells up to 12 % around its own centre
    const rot = new THREE.Matrix4().makeRotationFromEuler(blockRotation(L));
    const o = new THREE.Vector3(...L.anchor);
    return [[x0, y1], [x1, y1], [x0, y0], [x1, y0]].map(([x, y]) => new THREE.Vector3(x * m, y * m, 0).applyMatrix4(rot).add(o));
  }
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

// lyrics over Raymi (toki 2026-10-19): a word may cross her; only a stay is a fault
const FACE_HOLD = 0.6;   // s of text continuously on her face
const FIG_HOLD = 1.0;    // s of a settled line hiding > 60 % of her figure, for its whole hold

/** Lyrics v2 readable at phone size, measured on the CAP height: a normal word >= 5.4 % of the frame height (~ the
 *  10 % texture box), romaji / English >= 4 % (toki 2026-10-19 "zu klein, zu duenn"; FIRESTARTER pilots 1-3). */
export const CAP_MIN = 0.054, SUB_CAP_MIN = 0.04;
/** The Short is watched full-screen in portrait: caption guidance there is 55-85 px cap on a 1920 frame (3-4.5 %);
 *  the 16:9 numbers above assume the MV small in the phone's inline player. Portrait: 4 % / 3 % (Watch Me build: the
 *  landscape minimum stacked a long line one word per row in the Short). */
export const capMin = (props: {width: number; height: number}) => (props.width < props.height ? 0.04 : CAP_MIN);
export const subCapMin = (props: {width: number; height: number}) => (props.width < props.height ? 0.03 : SUB_CAP_MIN);

/** Every frame a lyric line is fully shown (from its last word on, settled), all of it must be inside the frame. */
const L0 = (s: Shot) => s.lyrics!;
/** The lens turning faster than WHIP_DEG per frame is a whip: the picture smears, nothing is read at the frame edge
 *  then (FIRESTARTER s71: a 38 degree snap in 8 frames under "relax" - no place in the world stays in both views). */
const WHIP_DEG = 3;
function whipping(s: Shot, f: number, aspect: number, props: FilmProps): boolean {
  if ((s.bridge ?? 0) > 0 && f >= s.from && f <= s.from + (s.bridge ?? 0)) return true;   // a bridged cut: the lens rushes in, smeared
  if (f <= s.from || f >= s.to - 1) return false;
  const dir = (k: number) => new THREE.Vector3(0, 0, -1).applyQuaternion(makeCamera(s, k, aspect, props.hits, props.fps).quaternion);
  return (dir(f - 1).angleTo(dir(f + 1)) * 180) / Math.PI / 2 > WHIP_DEG;
}
/** The safe area for lyrics in NDC: 8 % of each side stays free (toki 2026-10-20). */
export const SAFE = 0.84;
const lt0 = (ps: THREE.Vector3[], cam: THREE.Camera) => { const q = ps.map((p) => p.clone().project(cam)); return [Math.min(...q.map((v) => v.x)), Math.min(...q.map((v) => v.y)), Math.max(...q.map((v) => v.x)), Math.max(...q.map((v) => v.y))]; };
const area = (b: number[]) => (b[2] - b[0]) * (b[3] - b[1]);
/** A line sits on an occluder when > 10 % of the smaller of the two is shared (a big block over a small Raymi counts). */
export const sitsOn = (o: {boxes: number[][]}, lb: number[]) =>
  o.boxes.reduce((t, bx) => t + boxOverlap(bx, lb), 0) > 0.1 * Math.min(area(lb), o.boxes.reduce((t, bx) => t + area(bx), 0));
const boxOverlap = (a: number[], b: number[]) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));

/** What a settled lyric line must not sit on (screen boxes 0..1, y down): her silhouette (coarse cells of her sprite,
 *  timeline.py mask - the trimmed sprite box is mostly air around spread arms) and every solid prop / creature that
 *  stands IN FRONT of the words (nearer the lens than `depth`): words drawn over a prop in front read as cut into it;
 *  a far wall / chimney behind the words is their background. */
export function occluders(props: FilmProps, s: Shot, f: number, cam: THREE.Camera, depth = Infinity): {name: string; boxes: [number, number, number, number][]}[] {
  const out: {name: string; boxes: [number, number, number, number][]}[] = [];
  const toBox = (pts: THREE.Vector3[]): [number, number, number, number] | null => {
    const q = pts.map((p) => p.clone().project(cam));
    if (q.some((p) => p.z >= 1 || p.z <= -1)) return null;
    const bx: [number, number, number, number] = [Math.max(0, Math.min(...q.map((p) => (p.x + 1) / 2))), Math.max(0, Math.min(...q.map((p) => (1 - p.y) / 2))),
      Math.min(1, Math.max(...q.map((p) => (p.x + 1) / 2))), Math.min(1, Math.max(...q.map((p) => (1 - p.y) / 2)))];
    return bx[2] > bx[0] && bx[3] > bx[1] ? bx : null;
  };
  const p = puppetAt(s.puppets, f, props.fps);
  if (p) {
    const m = puppetMatrix(p, [cam.position.x, (cam.position as THREE.Vector3).y, cam.position.z]);
    const {w, h} = planeSize(p.key);
    const mask = p.key.mask ?? ['1'];
    const ny = mask.length, nx = mask[0].length;
    const cells: [number, number, number, number][] = [];
    mask.forEach((row, j) => [...row].forEach((c, i) => {
      if (c !== '1') return;
      const pts = [[i / nx, j / ny], [(i + 1) / nx, j / ny], [i / nx, (j + 1) / ny], [(i + 1) / nx, (j + 1) / ny]].map(([u, v]) =>
        new THREE.Vector3((u - 0.5) * w, (p.key.feet - v) * h, 0).applyMatrix4(m));
      const bx = toBox(pts);
      if (bx) cells.push(bx);
    }));
    if (cells.length) out.push({name: 'her figure', boxes: cells});
  }
  // lyrics.cross (a close shot, toki 2026-10-19: lyrics may cover her for a while): only her head is kept free
  const ac = actorCells(s, f, cam);
  // an opaque card never crosses her (look-critic stills 4: a pink card over her torso read as a censor bar)
  const crossOk = Boolean(s.lyrics?.cross) && s.lyrics?.kind !== 'card';
  if (ac.length) out.push(crossOk ? {name: 'her face', boxes: actorCells(s, f, cam, true)} : {name: 'her figure', boxes: ac});
  for (const b of s.solids ?? []) {
    const box = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(...b.center), new THREE.Vector3(...b.size));
    if (box.distanceToPoint(cam.position) >= depth) continue;
    const pts: THREE.Vector3[] = [];
    for (const i of [0, 1]) for (const j of [0, 1]) for (const k of [0, 1])
      pts.push(new THREE.Vector3(i ? box.max.x : box.min.x, j ? box.max.y : box.min.y, k ? box.max.z : box.min.z));
    const bx = toBox(pts);                              // reaching behind the lens: the lens guard owns that
    if (bx) out.push({name: `the ${b.name}`, boxes: [bx]});
  }
  return out;
}

// 3D Raymi (2026-10-23): the lyric guards knew only the sprite's silhouette, so words sat on the VRM body (Beach stills
// 19b / 23). Her body from her rig key: a column of cells from the feet along her (rolled) body axis - legs, hips,
// chest, head - in metres scaled by her height, projected to screen boxes like the sprite mask cells.
const BODY: [number, number, number][] = [[0, 0.28, 0.16], [0.28, 0.5, 0.21], [0.5, 0.62, 0.25], [0.62, 0.8, 0.27], [0.8, 1.04, 0.23]];   // her long hair widens head + back   // [t0, t1, half width] / 1.55 m
// her FACE alone (chin to brow, cheek to cheek - not the hair round it): what lyrics.cross keeps free and the face hero
const FACE: [number, number, number][] = [[0.835, 0.975, 0.1]];
export function actorCells(s: Shot, f: number, cam: THREE.Camera, headOnly = false): [number, number, number, number][] {
  const keys = s.actor;
  if (!keys?.length || f < keys[0].f) return [];
  let i = 0;
  for (let k = 0; k < keys.length; k++) if (keys[k].f <= f) i = k;
  const k = keys[i], nx = keys[i + 1];
  let pos = new THREE.Vector3(...k.pos);
  if (nx && nx.move && f >= nx.f - nx.move) pos = pos.lerp(new THREE.Vector3(...nx.pos), Math.min(1, (f - (nx.f - nx.move)) / nx.move));
  const h = k.height ?? 1.55, sc = h / 1.55;
  const yaw = k.rotY === 'away' ? Math.atan2(cam.position.x - pos.x, cam.position.z - pos.z) + Math.PI
    : k.rotY === 'lens' || k.rotY === undefined ? Math.atan2(cam.position.x - pos.x, cam.position.z - pos.z) : (k.rotY * Math.PI) / 180;
  const r = k.rollZ ?? 0;
  const axis = new THREE.Vector3(-Math.sin(r) * Math.cos(yaw), Math.cos(r), Math.sin(r) * Math.sin(yaw));
  const side = new THREE.Vector3(Math.cos(r) * Math.cos(yaw), Math.sin(r), -Math.cos(r) * Math.sin(yaw));
  const out: [number, number, number, number][] = [];
  for (const [t0, t1, hw] of headOnly ? FACE : BODY) {
    const pts = [t0, t1].flatMap((t) => [-1, 1].map((sd) => pos.clone().addScaledVector(axis, t * h).addScaledVector(side, sd * hw * sc)));
    const q = pts.map((p) => p.clone().project(cam));
    if (q.some((p) => p.z >= 1 || p.z <= -1)) continue;
    const bx: [number, number, number, number] = [Math.max(0, Math.min(...q.map((p) => (p.x + 1) / 2))), Math.max(0, Math.min(...q.map((p) => (1 - p.y) / 2))),
      Math.min(1, Math.max(...q.map((p) => (p.x + 1) / 2))), Math.min(1, Math.max(...q.map((p) => (1 - p.y) / 2)))];
    if (bx[2] > bx[0] && bx[3] > bx[1]) out.push(bx);
  }
  return out;
}

export function lyricsOutOfFrame(props: FilmProps): TextFault[] {
  const aspect = props.width / props.height;
  const out: TextFault[] = [];
  for (const s of props.shots) {
    if (!s.lyrics || s.lyrics.kind === 'ticker') continue;   // tickers scroll through the frame on purpose
    if (s.lyrics.lens) { out.push(...lensLyricFaults(props, s)); continue; }
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
      // readable at phone size (a principle with a default, PRINCIPLES 11): v1 a normal word >= 4.4 % of the frame height;
      // v2 (toki 2026-10-19 "oft zu klein") >= 7 % and its romaji / English >= 5 %. lyrics.small = a written reason
      // to go smaller on purpose (a whisper, a detail in a wide) - then the guard trusts the script.
      if (!L0(s).small) {
        const cam0 = makeCamera(s, a, aspect, props.hits, props.fps);
        const anc = new THREE.Vector3(...L0(s).anchor);
        const v2 = L0(s).style === 'v2';
        const up = v2 ? new THREE.Vector3(0, 1, 0).applyEuler(blockRotation(L0(s))) : new THREE.Vector3(0, 1, 0).applyQuaternion(cam0.quaternion);
        const px = (size: number) => {
          // v2: the CAP height itself (FIRESTARTER pilots 1-3: the texture box passed 7 % while the letters were tiny)
          const tex = v2 ? size : size * (1.35 / 0.72);
          const p0 = anc.clone().addScaledVector(up, -tex / 2).project(cam0), p1 = anc.clone().addScaledVector(up, tex / 2).project(cam0);
          if (p0.z >= 1 || p1.z >= 1) return Infinity;
          return v2 ? Math.hypot(((p1.x - p0.x) / 2) * props.width, ((p1.y - p0.y) / 2) * props.height) : (Math.abs(p1.y - p0.y) / 2) * props.height;
        };
        const base = L0(s).size * (ws.every((w) => w.key) ? (v2 ? (L0(s).keyScale ?? 2.8) : 2.2) : 1);
        const main = px(base);
        if (main < (v2 ? capMin(props) : 0.044) * props.height) { out.push({shot: s.id, frame: a, line, text: ws.map((w) => w.w).join(' '), why: `too small to read (${Math.round(main)} px)`}); continue; }
        if (v2 && subOf(L0(s), line)) {
          const sp = px(L0(s).size * SUB);
          if (sp < subCapMin(props) * props.height) { out.push({shot: s.id, frame: a, line, text: ws.map((w) => w.w).join(' '), why: `romaji / English too small to read (${Math.round(sp)} px)`}); continue; }
        }
      }
      // a stamp slams in bigger than it lands: 2 frames after the last word it is still ~1.2x (final Short 1: clipped)
      if ((s.lyrics.kind === 'stamp' || s.lyrics.kind === 'sign') && s.lyrics.reveal !== 'burn') {   // a burned word never pops (Words3D)
        const k = s.lyrics.kind === 'stamp' ? 1.2 : 1.05, fe = Math.min(last + 2, z - 1);
        const camE = makeCamera(s, fe, aspect, props.hits, props.fps);
        const an = new THREE.Vector3(...s.lyrics.anchor);
        const big = corners0.map((cc) => cc.clone().sub(an).multiplyScalar(k).add(an));
        if (big.some((cc) => { const n = cc.clone().project(camE); return n.z >= 1 || Math.abs(n.x) > 0.97 || Math.abs(n.y) > 0.97; })) {
          out.push({shot: s.id, frame: fe, line, text: ws.map((w) => w.w).join(' '), why: 'slams in past the frame edge'}); continue;
        }
      }
      // every frame, with the real camera kick on the music hits (pilot 1: a stamp clipped by the punch on a hit)
      let faceRun = 0, figRun = 0, sitRun = 0;
      // v2: the frame edge counts from the line's FIRST word on - the lens still moves while the words come in
      // (FIRESTARTER Short run 32: "Imma burn" off the right edge before the line had settled)
      if (s.lyrics.style === 'v2') {
        const f0 = Math.max(s.from, Math.min(...ws.map((w) => w.from)));
        const early = Array.from({length: Math.max(0, a - f0)}, (_, k) => f0 + k).find((f) => {
          if (whipping(s, f, aspect, props)) return false;
          const cam = makeCamera(s, f, aspect, props.hits, props.fps);
          return lineCorners(s, line, f).some((c) => { const n = c.clone().project(cam); return n.z >= 1 || Math.abs(n.x) > SAFE || Math.abs(n.y) > SAFE; });
        });
        if (early !== undefined) { out.push({shot: s.id, frame: early, line, text: ws.map((w) => w.w).join(' '), why: 'leaves the frame while it comes in'}); continue; }
      }
      for (let f = a; f < zz; f++) {
        const rise = float ? ((f - last) / props.fps) * 0.12 + 0.04 : 0;     // Words3D float: rises 0.12 m/s
        const corners = rise ? corners0.map((c) => c.clone().add(new THREE.Vector3(0, rise, 0))) : corners0;
        const cam = makeCamera(s, f, aspect, props.hits, props.fps);
        // inside the typographic safe area: a word near the frame edge reads as clipped (pilot 1: 4 %; FIRESTARTER final
        // Short, toki 2026-10-20 "abgeschnitten": its glow still touched the edge -> 8 % of each side)
        const bad = (s.lyrics.style !== 'v2' || !whipping(s, f, aspect, props)) && corners.some((c) => { const n = c.clone().project(cam); return n.z >= 1 || Math.abs(n.x) > SAFE || Math.abs(n.y) > SAFE; });
        if (bad) { out.push({shot: s.id, frame: f, line, text: ws.map((w) => w.w).join(' '), why: 'leaves the frame'}); break; }
        // seen from behind (Beach stills 2026-10-23: an orbit round her read "oj gm"): the line's start must stay left of its end
        // (the winding of start -> end -> below, so a rolled camera or a block lying on the floor is not a fault)
        const [c0, c1, c2] = [0, 1, 2].map((k) => corners[k].clone().project(cam));
        const wind = (c1.x - c0.x) * (c2.y - c0.y) - (c1.y - c0.y) * (c2.x - c0.x);
        if (c0.z < 1 && c1.z < 1 && c2.z < 1 && wind > 1e-4) { out.push({shot: s.id, frame: f, line, text: ws.map((w) => w.w).join(' '), why: 'is seen from behind (mirrored)'}); break; }
        // upside down (Beach stills round 3, shot 50: an orbit read "me to" as "oj gm"): its lower edge above its top edge
        if (c0.z < 1 && c2.z < 1 && c2.y > c0.y + 0.01) { out.push({shot: s.id, frame: f, line, text: ws.map((w) => w.w).join(' '), why: 'stands upside down'}); break; }
        // v2 (toki 2026-10-20 "hinter raymi / assets oder clippen in assets"): a settled line sits in free space - not on
        // her figure, not on a prop / solid / creature (more than 10 % of the block for 6 frames in a row)
        if (s.lyrics.style === 'v2' && !s.lyrics.over) {
          const lb: [number, number, number, number] = [(lt0(corners, cam)[0] + 1) / 2, (1 - lt0(corners, cam)[3]) / 2, (lt0(corners, cam)[2] + 1) / 2, (1 - lt0(corners, cam)[1]) / 2];
          const depth = cam.position.distanceTo(new THREE.Vector3(...s.lyrics.anchor));
          const hit = occluders(props, s, f, cam, depth).find((o) => sitsOn(o, lb));
          sitRun = hit ? sitRun + 1 : 0;
          if (hit && sitRun >= Math.min(6, zz - a)) { out.push({shot: s.id, frame: f - 5, line, text: ws.map((x) => x.w).join(' '), why: `sits on ${hit.name}`}); break; }
        }
        // text on text: a lyric over a readable set prop (the sign, the LED) makes both unreadable (final 1: ワーニング on the sign)
        const tbox = (ps: THREE.Vector3[]) => [Math.min(...ps.map((q) => q.x)), Math.min(...ps.map((q) => q.y)), Math.max(...ps.map((q) => q.x)), Math.max(...ps.map((q) => q.y))];
        const lt = tbox(corners.map((c) => c.clone().project(cam)));
        const onSign = (s.texts ?? []).find((t) => {
          const r = new THREE.Matrix4().makeRotationY((t.rot * Math.PI) / 180);
          const [tw, th] = t.size;
          const sp = [[-tw / 2, -th / 2], [tw / 2, -th / 2], [-tw / 2, th / 2], [tw / 2, th / 2]].map(([x, yy]) =>
            new THREE.Vector3(x, yy, 0).applyMatrix4(r).add(new THREE.Vector3(...t.center)).project(cam));
          if (sp.some((q) => q.z >= 1 || q.z <= -1)) return false;                // behind the lens: not on screen
          const st = tbox(sp);
          const ov = Math.max(0, Math.min(lt[2], st[2]) - Math.max(lt[0], st[0])) * Math.max(0, Math.min(lt[3], st[3]) - Math.max(lt[1], st[1]));
          return ov > 0.2 * Math.min((lt[2] - lt[0]) * (lt[3] - lt[1]), (st[2] - st[0]) * (st[3] - st[1]));
        });
        if (onSign && !s.lyrics.over) { out.push({shot: s.id, frame: f, line, text: ws.map((x) => x.w).join(' '), why: `covers the ${onSign.name}`}); break; }
        // text that PARKS on her face hides the one thing the viewer looks at (blind viewer, style test 2) - but lyrics may
        // fly over her, pass her, cover her for a moment (toki 2026-10-19: "raymi muss nicht immer ins bild forciert
        // werden ... auch wenn lyrics sie mal überdecken ... solange raymi nicht dauerhaft abgeschnitten wird"). So only
        // a continuous stay counts: on her face >= FACE_HOLD, or over most of her figure for the line's whole hold.
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
          faceRun = inter > 0.15 * (a1 - a0) * (b1 - b0) ? faceRun + 1 : 0;
          if (faceRun >= Math.round(FACE_HOLD * props.fps)) {
            out.push({shot: s.id, frame: f - faceRun + 1, line, text: ws.map((x) => x.w).join(' '), why: 'parks on her face'}); break;
          }
          // the hero buried under her own text (pilot 2: a huge stamp over a tiny Raymi in a wide): most of her figure
          // hidden for the line's WHOLE hold - a pass-over, a word flying through her, a moment of cover is fine
          const fp = [[0, p.key.top], [1, p.key.top], [0, p.key.feet], [1, p.key.feet]].map(([u, v]) =>
            new THREE.Vector3((u - 0.5) * w, (p.key.feet - v) * h, 0).applyMatrix4(m).project(cam));
          const [e0, g0, e1, g1] = box(fp);
          const fig = Math.max(0, Math.min(e1, c1) - Math.max(e0, c0)) * Math.max(0, Math.min(g1, d1) - Math.max(g0, d0));
          if (fig > 0.6 * (e1 - e0) * (g1 - g0)) figRun++;
        } else faceRun = 0;
        if (f === zz - 1 && figRun >= zz - a && zz - a >= Math.round(FIG_HOLD * props.fps)) {
          out.push({shot: s.id, frame: a, line, text: ws.map((x) => x.w).join(' '), why: 'buries her figure the whole line'}); break;
        }
      }
    }
  }
  return out;
}

/** A block riding the lens (lyrics.lens): every frame from its first word to the line's end it is placed for that
 *  frame's camera (lensPlace, as Words3D draws it) - inside the safe area, readable, never parked on her face / a prop
 *  in front (the same sitsOn rule as world blocks, 6 frames in a row). */
function lensLyricFaults(props: FilmProps, s: Shot): TextFault[] {
  const aspect = props.width / props.height, out: TextFault[] = [];
  for (const line of [...new Set(s.words.map((w) => w.line))]) {
    const ws = s.words.filter((w) => w.line === line), text = ws.map((w) => w.w).join(' ');
    const next = s.words.find((w) => w.line > line);
    const z = Math.min(s.to, next ? next.from : Math.max(...ws.map((w) => w.to)) + props.fps);
    const f0 = Math.max(s.from, Math.min(...ws.map((w) => w.from)));
    let sitRun = 0;
    for (let f = f0; f < z; f++) {
      const cam = makeCamera(s, f, aspect, props.hits, props.fps);
      const L = lensPlace(s.lyrics!, cam), sh = {...s, lyrics: L};
      const q = lineCorners(sh, line, f).map((c) => c.clone().project(cam));
      if (!whipping(s, f, aspect, props) && q.some((n) => n.z >= 1 || Math.abs(n.x) > SAFE || Math.abs(n.y) > SAFE)) { out.push({shot: s.id, frame: f, line, text, why: 'leaves the frame'}); break; }
      if (f === f0 && !L.small) {
        const anc = new THREE.Vector3(...L.anchor), up = new THREE.Vector3(0, 1, 0).applyEuler(blockRotation(L));
        const base = L.size * (ws.every((w) => w.key) ? (L.keyScale ?? 2.8) : 1);
        const p0 = anc.clone().addScaledVector(up, -base / 2).project(cam), p1 = anc.clone().addScaledVector(up, base / 2).project(cam);
        const px = Math.hypot(((p1.x - p0.x) / 2) * props.width, ((p1.y - p0.y) / 2) * props.height);
        if (px < capMin(props) * props.height) { out.push({shot: s.id, frame: f, line, text, why: `too small to read (${Math.round(px)} px)`}); break; }
      }
      const lb: [number, number, number, number] = [(Math.min(...q.map((v) => v.x)) + 1) / 2, (1 - Math.max(...q.map((v) => v.y))) / 2, (Math.max(...q.map((v) => v.x)) + 1) / 2, (1 - Math.min(...q.map((v) => v.y))) / 2];
      const hit = L.over ? undefined : occluders(props, sh, f, cam, cam.position.distanceTo(new THREE.Vector3(...L.anchor))).find((o) => sitsOn(o, lb));
      sitRun = hit ? sitRun + 1 : 0;
      if (hit && sitRun >= 6) { out.push({shot: s.id, frame: f - 5, line, text, why: `sits on ${hit.name}`}); break; }
      // text on text: a readable set prop / a staging cover's type under the block (stills 1: the line over the cover)
      const on = L.over ? undefined : (s.texts ?? []).find((tx) => {
        const r = new THREE.Matrix4().makeRotationY((tx.rot * Math.PI) / 180);
        const sp = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => new THREE.Vector3((a * tx.size[0]) / 2, (b * tx.size[1]) / 2, 0).applyMatrix4(r).add(new THREE.Vector3(...tx.center)).project(cam));
        if (sp.some((v) => v.z >= 1 || v.z <= -1)) return false;
        const tb = [(Math.min(...sp.map((v) => v.x)) + 1) / 2, (1 - Math.max(...sp.map((v) => v.y))) / 2, (Math.max(...sp.map((v) => v.x)) + 1) / 2, (1 - Math.min(...sp.map((v) => v.y))) / 2];
        return boxOverlap(lb, tb) > 0.2 * Math.min(area(lb), area(tb));
      });
      if (on) { out.push({shot: s.id, frame: f, line, text, why: `covers the ${on.name}`}); break; }
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
  for (const k of [1, 1.25, 1.5, 1.8, 2.2, 0.8, 0.65, 0.5, 0.4]) {   // grow first: too small reads as clipped too
    for (const wf of [1, 0.75, 0.55]) for (const [x, y] of spots) {      // a narrower block wraps into rows (FIRESTARTER)
      // the words stay on their own surface (the plane through the scripted anchor, facing rotY): slide, never float off
      const ray = new THREE.Vector3(x * 2 - 1, 1 - y * 2, 0.5).unproject(cam).sub(cam.position).normalize();
      const nrm = new THREE.Vector3(Math.sin((s.lyrics.rotY * Math.PI) / 180), 0, Math.cos((s.lyrics.rotY * Math.PI) / 180));
      const den = ray.dot(nrm);
      if (Math.abs(den) < 1e-3) continue;
      const tt = a.clone().sub(cam.position).dot(nrm) / den;
      if (tt < 0.3 || tt > dist * 4) continue;
      const pt = cam.position.clone().addScaledVector(ray, tt);
      const anchor: V3 = [Number(pt.x.toFixed(2)), Number(pt.y.toFixed(2)), Number(pt.z.toFixed(2))];
      const L = {...s.lyrics, anchor, size: Number((s.lyrics.size * k).toFixed(3)), width: Number((s.lyrics.width * k * wf).toFixed(2))};
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
      if (t.cut_ok) continue;                             // a staging cover the lens pushes into: only text-on-text counts
      const r = new THREE.Matrix4().makeRotationY((t.rot * Math.PI) / 180);
      const [w, h] = t.size;
      const pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [-w / 2, h / 2], [w / 2, h / 2], [0, 0]].map(([x, y]) =>
        new THREE.Vector3(x, y, 0).applyMatrix4(r).add(new THREE.Vector3(...t.center)));
      // passing the edge during a camera move is fine; a sign that STAYS cut for 0.4 s reads as a fault
      let run = 0;
      for (let f = s.from; f < s.to; f++) {
        const cam = makeCamera(s, f, aspect, props.hits, props.fps);
        // whole means inside the 4 % safe area; any part between that and the edge reads as clipped (final 1: STAR EXHIBIT)
        const ns = pts.map((q) => q.clone().project(cam));
        const vis = ns.map((n) => n.z < 1 && n.z > -1 && Math.abs(n.x) <= 1 && Math.abs(n.y) <= 1);
        const safe = ns.map((n) => n.z < 1 && n.z > -1 && Math.abs(n.x) <= 0.92 && Math.abs(n.y) <= 0.92);
        run = vis.some((x) => x) && safe.some((x) => !x) ? run + 1 : 0;
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

/** Share of the frame (0..1) covered by the part of a box within 0.6 m in front of the lens: a 6x6x6 grid of points on
 *  the box, those near and in front projected, their bounding rect clipped to the frame. */
function nearCover(box: THREE.Box3, cam: THREE.PerspectiveCamera): number {
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
  let x0 = 1, y0 = 1, x1 = -1, y1 = -1, any = false;
  const p = new THREE.Vector3(), d = new THREE.Vector3();
  for (let i = 0; i <= 5; i++) for (let j = 0; j <= 5; j++) for (let k = 0; k <= 5; k++) {
    p.set(box.min.x + (box.max.x - box.min.x) * i / 5, box.min.y + (box.max.y - box.min.y) * j / 5, box.min.z + (box.max.z - box.min.z) * k / 5);
    d.copy(p).sub(cam.position);
    if (d.length() >= 0.6 || d.dot(fwd) <= 0.05) continue;
    const n = p.clone().project(cam);
    x0 = Math.min(x0, Math.max(-1, n.x)); x1 = Math.max(x1, Math.min(1, n.x));
    y0 = Math.min(y0, Math.max(-1, n.y)); y1 = Math.max(y1, Math.min(1, n.y));
    any = true;
  }
  return any && x1 > x0 && y1 > y0 ? ((x1 - x0) * (y1 - y0)) / 4 : 0;
}

/** Solid props: the lens is never inside one (or within 0.2 m of it), and her face never hides behind one for 0.4 s
 *  (stills run 19: the lens inside a coin tower; the shell throne between the lens and her). */
export function solidFaults(props: FilmProps): {shot: string; frame: number; why: string}[] {
  const aspect = props.width / props.height;
  const out: {shot: string; frame: number; why: string}[] = [];
  for (const s of props.shots) {
    const boxes = (s.solids ?? []).map((b) => ({name: b.name, box: new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(...b.center), new THREE.Vector3(...b.size))}));
    if (!boxes.length) continue;
    let run = 0, close = 0, bad: string | null = null;
    for (let f = s.from; f < s.to; f++) {
      const cam = makeCamera(s, f, aspect, props.hits, props.fps);
      const inside = boxes.find((b) => b.box.clone().expandByScalar(0.2).containsPoint(cam.position));
      if (inside) { out.push({shot: s.id, frame: f, why: `lens inside the ${inside.name}`}); bad = 'x'; break; }
      // a prop right at the lens fills the frame as a flat mass (final 1: a coin tower for 1.5 s)
      // (2026-10-24: only what is IN the picture counts - a lens at her eye line 0.4 m above a desk that lies outside the
      // frame is fine; the part of the box within 0.6 m must cover >= 20 % of the frame)
      const near = boxes.find((b) => b.box.distanceToPoint(cam.position) < 0.6 && nearCover(b.box, cam) >= 0.2);
      close = near ? close + 1 : 0;
      if (close >= Math.round(props.fps * 0.4)) { out.push({shot: s.id, frame: f - close + 1, why: `the ${near!.name} fills the lens`}); bad = 'x'; break; }
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
      // the 3D Raymi (actor keys): her head and chest height on her spot - both behind a solid = she is hidden
      // (motion reel 2026-10-23: a crash zoom flew through her monitor's back, one dark mass on screen)
      if (!p && s.actor?.length) {
        const k = s.actor.reduce((q, x) => (x.f <= f ? x : q), s.actor[0]);
        const hh = k.height ?? 1.55;
        // seated her head is ~1.05 m, standing ~1.40 m (measured on the POV stills, 2026-10-24)
        const rows = /^(sit|slump)/.test(k.pose) ? [0.5, 0.68] : [0.66, 0.88];
        const blocked = rows.map((r) => {
          const pt = new THREE.Vector3(k.pos[0], k.pos[1] + r * hh, k.pos[2]);
          const n = pt.clone().project(cam);
          if (!(n.z < 1 && Math.abs(n.x) < 1 && Math.abs(n.y) < 1)) return null;
          const dir = pt.clone().sub(cam.position), dist = dir.length();
          const ray = new THREE.Ray(cam.position.clone(), dir.normalize());
          return boxes.find((b) => { const hit = ray.intersectBox(b.box, new THREE.Vector3()); return hit && hit.distanceTo(cam.position) < dist - 0.15 && !b.box.containsPoint(pt); })?.name ?? null;
        });
        if (blocked[0] && blocked[1]) hidden = blocked[1];
      }
      run = hidden ? run + 1 : 0;
      if (run >= Math.round(props.fps * 0.4)) { out.push({shot: s.id, frame: f - run + 1, why: `her face hidden behind the ${hidden}`}); break; }
    }
    // a lyric line behind a prop reads as a cut word (lyrics v2 style frames 1: a studio camera over パッパッパ):
    // its centre and corners (pulled 15 % in) must be seen by the lens on the line's settled frame - unless lyrics.over
    // (lyrics v2 draw on top of everything since FIRESTARTER final - toki 2026-10-20 - so only v1 words can hide)
    if (s.lyrics && !s.lyrics.over && !bad && s.lyrics.style !== 'v2') {
      for (const line of [...new Set(s.words.map((w) => w.line))]) {
        const ws = s.words.filter((w) => w.line === line);
        const f = Math.min(s.to - 1, Math.max(...ws.map((w) => w.from)) + 6);
        const cam = makeCamera(s, f, aspect, props.hits, props.fps);
        const cs = lineCorners(s, line);
        const c = cs.reduce((a, b) => a.clone().add(b), new THREE.Vector3()).multiplyScalar(1 / cs.length);
        const pts = [c, ...cs.map((q) => q.clone().lerp(c, 0.15))];
        const blocked = pts.map((q) => {
          const dir = q.clone().sub(cam.position), dist = dir.length();
          const ray = new THREE.Ray(cam.position.clone(), dir.normalize());
          return boxes.find((b) => { const hit = ray.intersectBox(b.box, new THREE.Vector3()); return hit && hit.distanceTo(cam.position) < dist - 0.1 && !b.box.containsPoint(q); });
        }).filter(Boolean);
        if (blocked.length) { out.push({shot: s.id, frame: f, why: `lyrics hidden behind the ${blocked[0]!.name}`}); break; }
      }
    }
  }
  return out;
}

/** The smallest move of the whole camera path (same move on every key: pos, and look by half) that passes every
 *  guard - for occlusion / prop / sign faults that a zoom cannot fix. null = no move within 1.6 m works. */
export function fitLens(props: FilmProps, index: number): Shot['camera'] | null {
  const s = props.shots[index];
  if (shotPasses(props, s)) return s.camera;
  const steps: V3[] = [];
  for (const dx of [-1.6, -1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2, 1.6]) for (const dz of [-1.6, -1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2, 1.6])
    for (const dy of [0, 0.3, -0.3, 0.6]) steps.push([dx, dy, dz]);
  steps.sort((p, q) => Math.hypot(...p) - Math.hypot(...q));
  for (const [dx, dy, dz] of steps) {
    const camera = s.camera.map((k) => ({...k, pos: [k.pos[0] + dx, k.pos[1] + dy, k.pos[2] + dz] as V3,
      look: [k.look[0] + dx / 2, k.look[1] + dy / 2, k.look[2] + dz / 2] as V3}));
    if (shotPasses(props, {...s, camera})) return camera;
  }
  return null;
}

// ---------------------------------------------------------------- the hero element (toki 2026-10-19)
// "fehler wie schlecht erkennbare krone müssen selber erkannt werden, das ist das main element". The treatment names
// the video's main element(s) (shots.json "heroes"), every shot marks the ones it must show ("hero"). Here: its box on
// screen, frame by frame, and whether it is big enough at phone size. A principle with a default (min share of the
// frame height), broken only with a written reason (hero "why_small"). Its VALUE contrast needs the real pixels: the
// boxes go to raymi/hero.py after a render / stills run (--hero-boxes).
export type HeroBox = {shot: string; frame: number; name: string; box: [number, number, number, number] | null};   // x0,y0,x1,y1 in 0..1, y down

function screenBox(pts: THREE.Vector3[], cam: THREE.Camera): [number, number, number, number] | null {
  const q = pts.map((p) => p.clone().project(cam));
  if (q.some((p) => p.z >= 1 || p.z <= -1)) return null;
  const xs = q.map((p) => (p.x + 1) / 2), ys = q.map((p) => (1 - p.y) / 2);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

export function heroBox(props: FilmProps, s: Shot, f: number, h: NonNullable<Shot['hero']>[number]): [number, number, number, number] | null {
  const aspect = props.width / props.height;
  const cam = makeCamera(s, f, aspect, props.hits, props.fps);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), up = new THREE.Vector3(0, 1, 0);
  const quad = (c: THREE.Vector3, w: number, hh: number) => [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) =>
    c.clone().addScaledVector(right, (a * w) / 2).addScaledVector(up, (b * hh) / 2));
  if (h.kind === 'face' && s.actor?.length) {           // 3D Raymi: her head cell from the rig key (actorCells) - the
    const hc = actorCells(s, f, cam, true)[0];            // sprite-only version read 0 % on every VRM shot (Watch Me build)
    return hc ?? null;
  }
  if (h.kind === 'worn' || h.kind === 'face') {          // something she wears on her head / her face itself
    const p = puppetAt(s.puppets, f, props.fps);
    if (!p || !p.key.head) return null;
    const m = puppetMatrix(p, [cam.position.x, cam.position.y, cam.position.z]);
    const {w, h: ph} = planeSize(p.key);
    const [x0, y0, x1, y1] = p.key.head;
    if (h.kind === 'face') {
      const pts = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([u, v]) => new THREE.Vector3((u - 0.5) * w, (p.key.feet - v) * ph, 0).applyMatrix4(m));
      return screenBox(pts, cam);
    }
    const top = new THREE.Vector3(((x0 + x1) / 2 - 0.5) * w, (p.key.feet - y0) * ph, 0).applyMatrix4(m);
    const [bw, bh] = h.size ?? [0.13, 0.07];
    return screenBox(quad(top.add(new THREE.Vector3(0, bh / 2, 0)), bw, bh), cam);
  }
  if (h.kind === 'prop' && h.uv) {                       // a prop she holds: it moves with her sprite
    const p = puppetAt(s.puppets, f, props.fps);
    if (!p) return null;
    const m = puppetMatrix(p, [cam.position.x, cam.position.y, cam.position.z]);
    const {w, h: ph} = planeSize(p.key);
    const c = new THREE.Vector3((h.uv[0] - 0.5) * w, (p.key.feet - h.uv[1]) * ph, 0).applyMatrix4(m);
    const [bw, bh] = h.size ?? [0.2, 0.3];
    return screenBox(quad(c.add(new THREE.Vector3(0, bh * 0.35, 0)), bw, bh), cam);
  }
  if (h.kind === 'prop' && h.center) {
    const [bw, bh] = h.size ?? [0.3, 0.3];
    return screenBox(quad(new THREE.Vector3(...h.center), bw, bh), cam);
  }
  if (h.kind === 'prop') {                                // a staging piece (three/staging.tsx: the gold frame, the cover)
    const st = (Array.isArray(s.opts.stage) ? s.opts.stage : []) as {kind?: string; pos?: V3; h?: number; at?: number; out?: number}[];
    const g = st.find((x) => (x.kind === h.name || (h.name === 'frame' && (x.kind === 'frame' || x.kind === 'cover'))) && Array.isArray(x.pos)
      && (x.at === undefined || f >= x.at) && (x.out === undefined || f < x.out));
    if (!g) return null;
    const gh = g.h ?? (h.size ? h.size[1] : 2), gw = h.size ? (h.size[0] * gh) / h.size[1] : gh * 0.78;
    return screenBox(quad(new THREE.Vector3(g.pos![0], g.pos![1] + gh / 2, g.pos![2]), gw, gh), cam);
  }
  if (h.kind === 'word' && s.lyrics) {                    // a key lyric word: its glyph height at the block's anchor
    const w = s.words.find((x) => x.w.toLowerCase() === (h.word ?? h.name).toLowerCase());
    if (!w || f < w.from) return null;
    const L = s.lyrics;
    const size = L.size * (w.key ? (L.style === 'v2' ? (L.keyScale ?? 2.8) : 2.2) : 1);
    const upL = L.style === 'v2' ? new THREE.Vector3(0, 1, 0).applyEuler(blockRotation(L)) : up;
    const a = new THREE.Vector3(...L.anchor);
    const ww = size * Math.max(1, (w.em ?? w.w.length * 0.7));
    const rt = L.style === 'v2' ? new THREE.Vector3(1, 0, 0).applyEuler(blockRotation(L)) : right;
    const pts = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, y]) => a.clone().addScaledVector(rt, (x * ww) / 2).addScaledVector(upL, (y * size) / 2));
    return screenBox(pts, cam);
  }
  return null;
}

/** A hero marked for a shot must be on screen and at least `min` of the frame height tall in most of the shot
 *  (>= 60 % of its sampled frames - a transition or a fast move may hide it briefly). */
export function heroFaults(props: FilmProps): {shot: string; frame: number; name: string; why: string}[] {
  const out: {shot: string; frame: number; name: string; why: string}[] = [];
  for (const s of props.shots) {
    for (const h of s.hero ?? []) {
      if (h.why_small) continue;                           // the script wrote why it is small here
      let ok = 0, n = 0, worst = Infinity, wf = s.from;
      for (let f = s.from; f < s.to; f += 3) {
        const b = heroBox(props, s, f, h);
        if (h.kind === 'word' && b === null && !s.words.some((x) => x.w.toLowerCase() === (h.word ?? h.name).toLowerCase() && x.from <= f)) continue;   // not sung yet
        n++;
        // a staging piece that SURROUNDS her (the gold frame, the cover) or a sign the lens fills the frame with reads
        // while it holds the screen centre - fully inside only for a thing she holds
        const around = h.kind === 'prop' && !h.uv && b && b[0] < 0.5 && b[2] > 0.5 && b[1] < 0.5 && b[3] > 0.5;
        const inside = b && ((b[0] >= 0 && b[2] <= 1 && b[1] >= 0 && b[3] <= 1) || around);
        const share = b ? b[3] - b[1] : 0;
        if (inside && share >= h.min) ok++;
        if (share < worst) { worst = share; wf = f; }
      }
      if (n && ok / n < 0.6) out.push({shot: s.id, frame: wf, name: h.name,
        why: `${h.name} readable in ${Math.round((100 * ok) / n)} % of the shot (smallest ${(100 * Math.max(0, worst)).toFixed(1)} % of the frame height, wants ${(100 * h.min).toFixed(0)} %)`});
    }
  }
  return out;
}

/** Boxes of every hero at given frames (for the value-contrast check on the real pixels, raymi/hero.py). */
export function heroBoxes(props: FilmProps, frames: number[]): HeroBox[] {
  const out: HeroBox[] = [];
  for (const f of frames) {
    const s = props.shots.find((x) => f >= x.from && f < x.to);
    if (!s) continue;
    for (const h of s.hero ?? []) out.push({shot: s.id, frame: f, name: h.name, box: heroBox(props, s, f, h)});
  }
  return out;
}

// ---------------------------------------------------------------- lyrics into the frame's empty space (toki 2026-10-20)
/** Her figure's screen box (0..1, y down) at frame f, or null. */
function figureBox(props: FilmProps, s: Shot, f: number, cam: THREE.Camera): [number, number, number, number] | null {
  const ac = actorCells(s, f, cam);
  if (ac.length) return [Math.min(...ac.map((b) => b[0])), Math.min(...ac.map((b) => b[1])), Math.max(...ac.map((b) => b[2])), Math.max(...ac.map((b) => b[3]))];
  const p = puppetAt(s.puppets, f, props.fps);
  if (!p) return null;
  const m = puppetMatrix(p, [cam.position.x, cam.position.y, cam.position.z]);
  const {w, h} = planeSize(p.key);
  const pts = [[0, p.key.top], [1, p.key.top], [0, p.key.feet], [1, p.key.feet]].map(([u, v]) =>
    new THREE.Vector3((u - 0.5) * w, (p.key.feet - v) * h, 0).applyMatrix4(m).project(cam));
  if (pts.some((q) => q.z >= 1)) return null;
  return [Math.min(...pts.map((q) => (q.x + 1) / 2)), Math.min(...pts.map((q) => (1 - q.y) / 2)), Math.max(...pts.map((q) => (q.x + 1) / 2)), Math.max(...pts.map((q) => (1 - q.y) / 2))];
}

/** FIRESTARTER final (toki: "leere Fläche effektiv nutzen"): the BIGGEST lyric block that passes every lyric guard,
 *  placed in the empty part of the frame (away from her figure and the shot's hero), facing the lens. The words draw on
 *  top of the set (Words3D depthTest off), so only the frame, her and the hero decide. null = nothing fits. */
type Fill = {anchor: V3; size: number; width: number; tilt: number; roll: number; rot: number; key_scale: number; small?: string};
export function fillLyrics(props: FilmProps, index: number): Fill | null {
  const s = props.shots[index];
  if (!s.lyrics || !s.words.length) return null;
  // the camera where the (last) line has settled - the guard reads size and frame there; a lens that moves fast while the
  // words come in is tried at the first word and halfway too (FIRESTARTER: cranes / whips under a line)
  const fs = Math.max(s.from, Math.min(s.to - 1, Math.max(...s.words.map((w) => w.from)) + 6));
  const f0 = Math.max(s.from, Math.min(...s.words.map((w) => w.from)));
  for (const f of [...new Set([fs, f0, ...[0.5, 0.25, 0.75].map((t) => Math.round(f0 + (fs - f0) * t)), Math.min(s.to - 1, fs + 12)])]) {
    const r = fillAt(props, s, f);
    if (r) return r;
  }
  return null;
}

function fillAt(props: FilmProps, s: Shot, f: number): Fill | null {
  if (!s.lyrics) return null;
  const aspect = props.width / props.height;
  const cam = makeCamera(s, f, aspect, [], props.fps);
  const heroes = (s.hero ?? []).filter((h) => h.kind !== 'word').map((h) => heroBox(props, s, f, h)).filter(Boolean) as [number, number, number, number][];
  // the Short's hook and comment question sit in the top band (OVERLAY): lyrics stay out of it
  const bands: [number, number, number, number][] = aspect < 1 ? [[0, OVERLAY.hookTop, 1, OVERLAY.hookTop + OVERLAY.hookH], [0, OVERLAY.ctaTop, 1, OVERLAY.ctaTop + OVERLAY.ctaH]] : [];
  const p = puppetAt(s.puppets, f, props.fps);
  const her = p ? new THREE.Vector3(...p.pos) : new THREE.Vector3(...s.lyrics.anchor);
  const d0 = Math.max(1.2, Math.min(9, her.distanceTo(cam.position) * 0.9));
  // at her depth first; then nearer the lens, so a prop that stood in front of the words becomes their background
  // a line leaning back on the floor (tilt <= -45: burned into it) first tries lying flat on the floor - moved along it,
  // so a crane up keeps it in the picture (FIRESTARTER s19: 'fire' burned into the vent floor)
  const floorY = (s.lyrics.tilt ?? 0) <= -45 ? 0.03 : null;
  for (const surf of floorY !== null ? [true, false] : [false]) for (const d of surf ? [d0] : [d0, Math.max(0.8, d0 * 0.55), 14, 24]) {   // far: a travelling lens barely moves it
  const occ = occluders(props, s, f, cam, d);                 // her silhouette cells + props in front of the words
  const avoid = [...occ.flatMap((o) => o.boxes), ...heroes, ...bands];
  const H = 2 * d * Math.tan(((cam as THREE.PerspectiveCamera).fov * Math.PI) / 360), Wd = H * aspect;
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
  const tilt = Number(((Math.asin(Math.max(-1, Math.min(1, fwd.y))) * 180) / Math.PI).toFixed(1));
  const ov = (a: number[], b: number[]) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  const emptiness = (x: number, y: number) => Math.min(1, ...avoid.map((b) => {
    const dx = Math.max(b[0] - x, 0, x - b[2]), dy = Math.max(b[1] - y, 0, y - b[3]);
    return Math.hypot(dx * aspect, dy);
  }));
  const spots: [number, number][] = [];
  for (let y = 0.16; y <= 0.841; y += 0.06) for (let x = 0.16; x <= 0.841; x += 0.06) spots.push([x, y]);
  spots.sort((a, b) => emptiness(b[0], b[1]) - emptiness(a[0], a[1]) || Math.abs(a[1] - 0.45) - Math.abs(b[1] - 0.45));
  // off her and every prop (<= 10 % of the block on them - the guard holds the same line), biggest first; in a tight
  // frame the key word gives up its emphasis before the line gives up its place (FIRESTARTER Short: I'm a fire starter)
  const allow = 0.1;
  // last resort: a frame whose free space is too small for the readable default takes the line smaller (>= 3.6 % cap
  // height, still readable on a phone) - written as lyrics.small, never onto her or a prop
  const tiers: [number, number[], string | undefined][] = [
    ...[...new Set([Math.min(s.lyrics.keyScale ?? 2.8, 1.8), 1.3, 1])].map((k) => [k, [0.12, 0.1, 0.085, 0.072, 0.062, 0.056], undefined] as [number, number[], undefined]),
    [1, [0.05, 0.044, 0.04, 0.036], 'fitter: the free space beside her is small in this frame']];
  for (const [ks, fracs, small] of tiers) for (const frac of fracs) {
    for (const wf of [0.85, 0.65, 0.45, 0.3]) for (const [x, y] of spots) {
      const ray = new THREE.Vector3(x * 2 - 1, 1 - y * 2, 0.5).unproject(cam).sub(cam.position).normalize();
      if (surf && ray.y > -0.05) continue;
      const pt = surf ? cam.position.clone().addScaledVector(ray, (floorY! - cam.position.y) / ray.y)
        : cam.position.clone().addScaledVector(ray, d / Math.max(0.3, ray.dot(fwd)));
      const dd = surf ? pt.distanceTo(cam.position) : d;
      const Hs = 2 * dd * Math.tan(((cam as THREE.PerspectiveCamera).fov * Math.PI) / 360);
      const anchor: V3 = [Number(pt.x.toFixed(2)), Number(pt.y.toFixed(2)), Number(pt.z.toFixed(2))];
      const rot = surf ? s.lyrics.rotY : Number(((Math.atan2(cam.position.x - pt.x, cam.position.z - pt.z) * 180) / Math.PI).toFixed(1));
      const tl = surf ? -90 : tilt;
      const L = {...s.lyrics, anchor, rotY: rot, tilt: tl, roll: 0, keyScale: ks, small,
        size: Number((frac * (surf ? Hs * 1.4 : H)).toFixed(3)), width: Number((wf * (surf ? Hs * 1.4 * aspect : Wd)).toFixed(2))};
      const sh = {...s, lyrics: L};
      const clear = [...new Set(s.words.map((w) => w.line))].every((line) => {
        const q = lineCorners(sh, line).map((c) => c.clone().project(cam));
        const b = [Math.min(...q.map((v) => (v.x + 1) / 2)), Math.min(...q.map((v) => (1 - v.y) / 2)), Math.max(...q.map((v) => (v.x + 1) / 2)), Math.max(...q.map((v) => (1 - v.y) / 2))];
        const area = (b[2] - b[0]) * (b[3] - b[1]);
        return occ.every((o) => !sitsOn(o, b)) && [...heroes, ...bands].every((a) => ov(a, b) <= allow * area);
      });
      if (!clear) continue;
      const pr = {...props, shots: [sh]};
      // a key word that IS the shot's main element keeps its readable size (heroFaults)
      if (lyricsOutOfFrame(pr).length === 0 && heroFaults(pr).length === 0)
        return {anchor, size: L.size, width: L.width, tilt: tl, roll: 0, rot, key_scale: ks, ...(small ? {small} : {})};
    }
  }
  }
  // last tier: a close shot whose camera crashes / orbits through the line - the block rides the lens beside her face
  // (lyricLayout lensPlace), off her face, still drawn in the space; nearer than her so it never sinks into her
  if (s.lyrics.cross) {
    // nearer than her on EVERY frame of the shot (a crash ends much closer than it starts)
    let near = Infinity;
    for (let k = s.from; k < s.to; k += 3) near = Math.min(near, her.distanceTo(makeCamera(s, k, aspect, props.hits, props.fps).position));
    const dl = Math.max(0.3, Math.min(1.2, near * 0.6));
    const Hl = 2 * dl * Math.tan(((cam as THREE.PerspectiveCamera).fov * Math.PI) / 360);
    const lspots: [number, number][] = [];
    for (const y of [0.8, 0.72, 0.22, 0.3, 0.64, 0.4, 0.5, 0.84]) for (const x of [0.5, 0.32, 0.68, 0.24, 0.76]) lspots.push([x, y]);
    // a long line in a tight (portrait) frame may go down to ~60 px cap - inside the Shorts caption range - as lyrics.small
    const ltiers: [number[], string | undefined][] = [[[0.1, 0.085, 0.072, 0.062, 0.056, 0.048, 0.042], undefined], [[0.036, 0.032], 'fitter: a long line in a tight frame (>= 60 px cap)']];
    for (const [fracs, small] of ltiers) for (const ks of [Math.min(s.lyrics.keyScale ?? 2.8, 1.8), 1.3, 1]) for (const frac of fracs) for (const wf of [0.74, 0.6, 0.45]) for (const [x, y] of lspots) {   // 0.74: a sung word swells 6 %, the safe area is 0.84
      const L = {...s.lyrics, lens: [x, y, dl] as [number, number, number], keyScale: ks, small, size: Number((frac * Hl).toFixed(4)), width: Number((wf * Hl * aspect).toFixed(3))};
      const pr = {...props, shots: [{...s, lyrics: L}]};
      if (lyricsOutOfFrame(pr).length === 0 && heroFaults(pr).length === 0)
        return {anchor: s.lyrics.anchor, size: L.size, width: L.width, tilt: 0, roll: 0, rot: 0, key_scale: ks, lens: L.lens, ...(small ? {small} : {})} as unknown as Fill;
    }
  }
  return null;
}


// ---------------------------------------------------------------- the creatures of the script (Watch Me stills 1)
/** Salmon (her photographer, the guard) was off screen in 14 of 15 shots that script him: his spot was typed blind.
 *  A scripted creature must be in the picture for most of its shot (>= 50 % of the sampled frames, its centre inside
 *  the frame) - `salmon.off: "<why>"` when he is meant to be out of view. */
const salmonOf = (s: Shot) => (s.opts.salmon && typeof s.opts.salmon === 'object' ? s.opts.salmon as {pos?: V3; off?: string; scale?: number; hold?: string} : null);
export function creatureFaults(props: FilmProps): {shot: string; frame: number; why: string}[] {
  const out: {shot: string; frame: number; why: string}[] = [];
  const aspect = props.width / props.height;
  for (const s of props.shots) {
    const sal = salmonOf(s);
    if (!sal?.pos || sal.off) continue;
    let ok = 0, n = 0, bad = s.from, front = 0, frontAt = s.from;
    const herP = new THREE.Vector3(...((s.actor?.[0]?.pos as V3 | undefined) ?? [0, 0, 0]));
    for (let f = s.from; f < s.to; f += 4) {
      const cam = makeCamera(s, f, aspect, [], props.fps);
      const n3 = new THREE.Vector3(...sal.pos).project(cam);
      n++;
      if (n3.z < 1 && Math.abs(n3.x) < 0.85 && Math.abs(n3.y) < 0.85) ok++; else bad = f;
      // in FRONT of her (nearer the lens and over her figure): the big guard hid her (Watch Me 2:16, MV run 63)
      const sx = (n3.x + 1) / 2, sy = (1 - n3.y) / 2, r = (sal.scale ?? (sal.hold === 'flashlight' ? 1.8 : 1)) * 0.2 / Math.max(0.3, cam.position.distanceTo(new THREE.Vector3(...sal.pos)));
      const nearer = cam.position.distanceTo(new THREE.Vector3(...sal.pos)) < cam.position.distanceTo(herP) - 0.2;
      if (nearer && n3.z < 1 && actorCells(s, f, cam).some((b) => sx + r > b[0] && sx - r < b[2] && sy + r > b[1] && sy - r < b[3])) { front++; frontAt = f; }
    }
    if (n && ok / n < 0.5) out.push({shot: s.id, frame: bad, why: `Salmon on screen in ${Math.round((100 * ok) / n)} % of the shot`});
    else if (n && front / n > 0.25) out.push({shot: s.id, frame: frontAt, why: `Salmon stands in front of her in ${Math.round((100 * front) / n)} % of the shot`});
  }
  return out;
}

/** A spot for Salmon inside the picture for the whole shot: beside her (not on her figure, not on her lyric block), at
 *  about her depth, 0.45-1.7 m above her floor - the free side of the frame first. null = no spot (reframe). */
export function placeCreature(props: FilmProps, index: number): V3 | null {
  const s = props.shots[index];
  const sal = salmonOf(s);
  if (!sal) return null;
  const aspect = props.width / props.height;
  const her = new THREE.Vector3(...((s.actor?.[0]?.pos as V3 | undefined) ?? [0, 0, 0]));
  const floor = her.y > 0.3 ? 0 : her.y;                       // on the plinth: the hall floor
  const fm = Math.round((s.from + s.to) / 2);
  const camM = makeCamera(s, fm, aspect, [], props.fps);
  const dHer = her.distanceTo(camM.position);
  const fr = [s.from, Math.round(s.from + (s.to - s.from) * 0.25), fm, Math.round(s.from + (s.to - s.from) * 0.75), s.to - 1];
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camM.quaternion);
  for (const k of [1, 0.75, 1.25, 0.55]) for (const y of [0.62, 0.55, 0.7, 0.45]) for (const x of [0.22, 0.78, 0.3, 0.7, 0.16, 0.84]) {
    const ray = new THREE.Vector3(x * 2 - 1, 1 - y * 2, 0.5).unproject(camM).sub(camM.position).normalize();
    const pt = camM.position.clone().addScaledVector(ray, (dHer * k) / Math.max(0.3, ray.dot(fwd)));
    if (pt.y < floor + 0.45 || pt.y > floor + 1.7 || pt.distanceTo(her) < 0.55) continue;
    const okAll = fr.filter((f) => {
      const cam = makeCamera(s, f, aspect, [], props.fps);
      const n = pt.clone().project(cam);
      if (!(n.z < 1 && Math.abs(n.x) < 0.8 && Math.abs(n.y) < 0.8)) return false;
      const sx = (n.x + 1) / 2, sy = (1 - n.y) / 2;
      return actorCells(s, f, cam).every((b) => sx < b[0] - 0.08 || sx > b[2] + 0.08 || sy < b[1] - 0.08 || sy > b[3] + 0.08);
    }).length >= 4;                                             // a moving lens may lose him for a moment (guard: >= 50 %)
    if (okAll) return [Number(pt.x.toFixed(2)), Number(pt.y.toFixed(2)), Number(pt.z.toFixed(2))];
  }
  return null;
}


// ---------------------------------------------------------------- she fills the frame (toki 2026-10-25)
/** "raymi bzw der teil der von ihr gezeigt wird sollte größer im bild sein, zumindest wo nicht explizit ein wide angle
 *  gewollt ist - oft wirkt alles leer und raymi weit weg": how tall the visible part of her is on screen (share of the
 *  frame height, the smallest over the shot's start / middle / end). */
export function herFill(s: Shot, aspect: number, fps: number): number {
  let low = Infinity;
  for (const f of [s.from, Math.round((s.from + s.to) / 2), s.to - 1]) {
    const cells = actorCells(s, f, makeCamera(s, f, aspect, [], fps));
    if (!cells.length) return 0;
    const y0 = Math.max(0, Math.min(...cells.map((c) => c[1]))), y1 = Math.min(1, Math.max(...cells.map((c) => c[3])));
    low = Math.min(low, Math.max(0, y1 - y0));
  }
  return low;
}

/** The dolly factor (lens toward its look point) so the frame at her is at most `maxH` metres tall (her visible part
 *  big, not a small figure in a wide room), her head kept inside the frame; null = already that close or no factor fits. */
export function fillFrame(props: FilmProps, index: number, maxH = 1.5): number | null {
  const s = props.shots[index], aspect = props.width / props.height;
  if (!s.actor?.length) return null;
  const fm = Math.round((s.from + s.to) / 2);
  const cam = makeCamera(s, fm, aspect, [], props.fps) as THREE.PerspectiveCamera;
  const k0 = s.actor[0];
  const her = new THREE.Vector3(k0.pos[0], k0.pos[1] + (k0.height ?? 1.55) * 0.75, k0.pos[2]);
  const hNow = 2 * her.distanceTo(cam.position) * Math.tan((cam.fov * Math.PI) / 360);
  if (hNow <= maxH * 1.05) return null;
  const headIn = (k: number) => {
    const camera = s.camera.map((c) => ({...c, pos: c.pos.map((p, i) => c.look[i] + (p - c.look[i]) * k) as V3}));
    const s2 = {...s, camera};
    return [s2.from, fm, s2.to - 1].every((f) => {
      const h = actorCells(s2, f, makeCamera(s2, f, aspect, [], props.fps), true)[0];
      return h && h[1] > 0.04 && h[3] < 0.96 && h[0] > 0.03 && h[2] < 0.97;
    });
  };
  for (let k = Math.max(0.5, Math.min(0.95, maxH / hNow)); k <= 0.95; k += 0.05) if (headIn(k)) return Number(k.toFixed(2));
  return null;
}


/** She is the film (toki 2026-10-25: "es dreht sich alles um sie"): her chest inside the frame for at least half of
 *  every shot she plays in - Watch Me 51 framed the empty plinth while she stood behind the lens (MV run 63, 2:16).
 *  opts.her_off = "<why>" for a shot meant without her. */
export function herOffFaults(props: FilmProps): {shot: string; frame: number; why: string}[] {
  const out: {shot: string; frame: number; why: string}[] = [];
  const aspect = props.width / props.height;
  for (const s of props.shots) {
    // opts.detail = "<why>": the picture IS a part of her (a macro on her hand, her feet) - head and chest out on purpose
    if (!s.actor?.length || s.opts.her_off || s.opts.detail) continue;
    let ok = 0, n = 0, bad = s.from;
    for (let f = s.from; f < s.to; f += 4) {
      const k = s.actor.reduce((p, q) => (q.f <= f ? q : p), s.actor[0]);
      const cam = makeCamera(s, f, aspect, [], props.fps);
      // her head OR her chest in the frame (a face close-up leaves the chest out on purpose)
      // a prone clip (swimming, gliding, lying - Love is War 2026-10-27: the swim clip lies flat, head ~0.7 m AHEAD of her
      // root along her facing, clips_seen) puts head and chest along the body, not above the feet
      const H = k.height ?? 1.55;
      const prone = /swim|glide|lying|laying|crawl/.test(String(k.motion ?? '')) || k.pose === 'glide';
      const yaw = typeof k.rotY === 'number' ? (k.rotY * Math.PI) / 180 : Math.atan2(cam.position.x - k.pos[0], cam.position.z - k.pos[2]) + (k.rotY === 'away' ? Math.PI : 0);
      const at = (h: number) => prone
        ? new THREE.Vector3(k.pos[0] + Math.sin(yaw) * H * (h - 0.45), k.pos[1] + 0.1, k.pos[2] + Math.cos(yaw) * H * (h - 0.45))
        : new THREE.Vector3(k.pos[0], k.pos[1] + H * h, k.pos[2]);
      const inF = (h: number) => { const c = at(h).project(cam); return c.z < 1 && Math.abs(c.x) < 0.95 && Math.abs(c.y) < 0.95; };
      n++;
      if (inF(0.92) || inF(0.7)) ok++; else bad = f;
    }
    if (n && ok / n < 0.5) out.push({shot: s.id, frame: bad, why: `she is in the picture ${Math.round((100 * ok) / n)} % of the shot`});
  }
  return out;
}
