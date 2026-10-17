// Playing cards as built props: ivory faces painted with the 2D canvas, her suit is the SPADE drawn as a stingray
// (a spade IS a ray's silhouette: diamond body + thin tail), backs in her ultraviolet with a ray pattern. A court card
// can print her painted sprite (cropped by the card's own frame, like a polaroid - the hero stays painted).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {staticFile} from 'remotion';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {canvasTexture, toon, useImageTexture} from './look';
import {drawText} from './parts';

type P3 = [number, number, number];
export const CARD_W = 1.2, CARD_H = 1.8;

/** The stingray spade: wings spread, a little head, a long thin tail with its barb. Centre (x, y), size s (px). */
export function raySpade(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -0.55 * s);
  ctx.bezierCurveTo(0.18 * s, -0.42 * s, 0.62 * s, -0.12 * s, 0.6 * s, 0.12 * s);
  ctx.bezierCurveTo(0.58 * s, 0.32 * s, 0.25 * s, 0.34 * s, 0.06 * s, 0.22 * s);
  ctx.lineTo(0.03 * s, 0.3 * s);
  ctx.lineTo(-0.03 * s, 0.3 * s);
  ctx.lineTo(-0.06 * s, 0.22 * s);
  ctx.bezierCurveTo(-0.25 * s, 0.34 * s, -0.58 * s, 0.32 * s, -0.6 * s, 0.12 * s);
  ctx.bezierCurveTo(-0.62 * s, -0.12 * s, -0.18 * s, -0.42 * s, 0, -0.55 * s);
  ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 0.035 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0.28 * s); ctx.quadraticCurveTo(0.08 * s, 0.6 * s, 0.02 * s, 0.85 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.05 * s, 0.8 * s); ctx.lineTo(0.02 * s, 0.92 * s); ctx.lineTo(0.08 * s, 0.79 * s); ctx.fill();
  ctx.restore();
}

function facePaint(rank: string, ink: string, court: boolean) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = '#f3ead6'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#c8b48a'; ctx.lineWidth = w * 0.012;
    ctx.strokeRect(w * 0.06, h * 0.045, w * 0.88, h * 0.91);
    for (const flip of [false, true]) {
      ctx.save();
      if (flip) { ctx.translate(w, h); ctx.rotate(Math.PI); }
      drawText(ctx, rank, w * 0.13, h * 0.085, w * 0.16, ink);
      raySpade(ctx, w * 0.13, h * 0.18, w * 0.12, ink);
      ctx.restore();
    }
    if (court) {                               // the court frame her portrait sits in (top + mirrored bottom)
      ctx.fillStyle = '#e6d6f2'; ctx.fillRect(w * 0.2, h * 0.12, w * 0.6, h * 0.76);
      ctx.strokeStyle = ink; ctx.lineWidth = w * 0.01; ctx.strokeRect(w * 0.2, h * 0.12, w * 0.6, h * 0.76);
      ctx.beginPath(); ctx.moveTo(w * 0.2, h * 0.5); ctx.lineTo(w * 0.8, h * 0.5); ctx.stroke();
    } else {
      raySpade(ctx, w / 2, h / 2, w * 0.42, ink);
    }
  };
}

function backPaint(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#f3ead6'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#4b1f7a'; ctx.fillRect(w * 0.06, h * 0.045, w * 0.88, h * 0.91);
  ctx.save();
  ctx.beginPath(); ctx.rect(w * 0.08, h * 0.06, w * 0.84, h * 0.88); ctx.clip();
  for (let r = 0; r < 12; r++) for (let c = 0; c < 8; c++) {
    raySpade(ctx, w * (0.1 + c * 0.12 + (r % 2) * 0.06), h * (0.08 + r * 0.08), w * 0.07, r % 2 ? '#6c3bb0' : '#7a49c4');
  }
  ctx.restore();
  ctx.strokeStyle = '#d9b75a'; ctx.lineWidth = w * 0.012; ctx.strokeRect(w * 0.1, h * 0.07, w * 0.8, h * 0.86);
}

const cardGeo = new Map<string, THREE.BufferGeometry>();
function geo(): THREE.BufferGeometry {
  let g = cardGeo.get('c');
  if (!g) { g = new RoundedBoxGeometry(CARD_W, CARD_H, 0.03, 2, 0.012); cardGeo.set('c', g); }
  return g;
}

/** Her portrait printed on a court card: the top half of a sprite, mirrored below (a double-headed king). */
const Portrait: React.FC<{sprite: string; crop: [number, number]}> = ({sprite, crop}) => {
  const base = useImageTexture(staticFile(sprite));
  const [top, bottom] = useMemo(() => [0, 1].map(() => {
    const t = base.clone();
    t.repeat.set(1, crop[1] - crop[0]);
    t.offset.set(0, 1 - crop[1]);
    t.needsUpdate = true;
    return t;
  }), [base, crop]);
  const w = CARD_W * 0.6 - 0.02, h = CARD_H * 0.38 - 0.02;
  return (
    <group position={[0, 0, 0.017]}>
      <mesh position={[0, h / 2 + 0.005, 0]}><planeGeometry args={[w, h]} /><meshBasicMaterial map={top} toneMapped={false} /></mesh>
      <mesh position={[0, -h / 2 - 0.005, 0]} rotation={[0, 0, Math.PI]}><planeGeometry args={[w, h]} /><meshBasicMaterial map={bottom} toneMapped={false} /></mesh>
    </group>
  );
};

/** A playing card. face: 'back' or a rank ('K', 'A', '7' ...); court = her portrait in the middle (sprite + crop). */
export const Card: React.FC<{pos: P3; rot?: P3; rank?: string; back?: boolean; scale?: number; sprite?: string; crop?: [number, number]; ink?: string}> = ({
  pos, rot = [0, 0, 0], rank = 'A', back = false, scale = 1, sprite, crop = [0.02, 0.5], ink = '#2a1240',
}) => {
  const face = back ? canvasTexture('cardback', 400, 600, backPaint) : canvasTexture(`face${rank}${ink}${!!sprite}`, 400, 600, facePaint(rank, ink, !!sprite));
  const backT = canvasTexture('cardback', 400, 600, backPaint);
  const mats = useMemo(() => {
    const edge = toon('#efe4cc');
    const f = new THREE.MeshToonMaterial({map: face, gradientMap: (edge as THREE.MeshToonMaterial).gradientMap});
    const b = new THREE.MeshToonMaterial({map: backT, gradientMap: (edge as THREE.MeshToonMaterial).gradientMap});
    return [edge, edge, edge, edge, f, b];                     // box groups: +x -x +y -y +z(front) -z(back)
  }, [face, backT]);
  return (
    <group position={pos} rotation={rot} scale={scale}>
      <mesh geometry={geo()} material={mats} castShadow receiveShadow />
      {sprite && !back ? <Portrait sprite={sprite} crop={crop} /> : null}
    </group>
  );
};

/** Poker chips: a stack of striped discs. */
export const Chips: React.FC<{pos: P3; n: number; c: string; seed?: number}> = ({pos, n, c, seed = 1}) => {
  const tex = canvasTexture(`chip${c}`, 256, 32, (ctx, w, h) => {
    ctx.fillStyle = c; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f3ead6';
    for (let i = 0; i < 8; i++) ctx.fillRect((i / 8) * w, 0, w / 24, h);
  });
  return (
    <group position={pos}>
      {Array.from({length: n}, (_, i) => (
        <mesh key={i} position={[Math.sin(i * 1.7 + seed) * 0.012, 0.045 + i * 0.09, Math.cos(i * 2.3 + seed) * 0.012]} castShadow receiveShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.085, 36]} />
          <meshToonMaterial attach="material-0" map={tex} />
          <meshToonMaterial attach="material-1" color={c} />
          <meshToonMaterial attach="material-2" color={c} />
        </mesh>
      ))}
    </group>
  );
};

/** A living spade: the suit's stingray, flat, flapping its wings - a swarm of them circles like a crown. */
export const RaySwarm: React.FC<{center: P3; r: number; n: number; f: number; c?: string; size?: number}> = ({center, r, n, f, c = '#8b5cf6', size = 0.32}) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.55);
    s.bezierCurveTo(0.18, 0.42, 0.62, 0.12, 0.6, -0.12);
    s.bezierCurveTo(0.58, -0.32, 0.25, -0.34, 0.06, -0.22);
    s.lineTo(0.02, -0.95);
    s.lineTo(-0.02, -0.95);
    s.lineTo(-0.06, -0.22);
    s.bezierCurveTo(-0.25, -0.34, -0.58, -0.32, -0.6, -0.12);
    s.bezierCurveTo(-0.62, 0.12, -0.18, 0.42, 0, 0.55);
    const g = new THREE.ExtrudeGeometry(s, {depth: 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2});
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  return (
    <group position={center}>
      {Array.from({length: n}, (_, i) => {
        const a = (i / n) * Math.PI * 2 + f * 0.025;
        const y = 0.12 * Math.sin(f / 8 + i * 1.3);
        const flap = 0.35 * Math.sin(f / 4 + i);
        return (
          <group key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r]} rotation={[0, -a, 0]}>
            <mesh geometry={geo} material={toon(c, '#5b2ad6', 0.35)} scale={[size * (1 - 0.25 * Math.abs(flap)), size, size]} rotation={[flap * 0.4, 0, 0.25]} castShadow />
          </group>
        );
      })}
    </group>
  );
};
