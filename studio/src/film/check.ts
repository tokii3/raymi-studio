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
