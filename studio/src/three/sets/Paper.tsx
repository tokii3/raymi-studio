// SET paper - "Ink War" (Love is War idea B, 2026-10-25): a white paper world - floor and sky one sheet, a faint
// fold line as the horizon - where Sumi's ink is physical: splashes on the floor, giant brush slashes standing in the
// air, a grey wash when the rain makes the ink bleed, and the page turning black until only her light is left (her
// dots become the stars). Three colours only: paper, ink, one red (the paper heart she fights for) + her UV.
// Built, never generated (hard rule 8).
// Options (times song s -> frames):
//   ink 0..1                       ink splashed on the floor around her mark (how much)
//   ink_slash [[t, deg, x, z], ...]  a brush slash appears at t (grows in 4 frames), rotated deg in the picture plane,
//                                  standing at (x, z) (default behind her); a bare t list works too
//   wash 0..1                      the rain's grey wash over the whole paper (Weltschmerz)
//   black 0..1 | black_at          the page turns black (1 = night); stars appear in it
//   heart [x, y, z] + heart_scale  the red paper heart floating there (default 0.9)
import React from 'react';
import * as THREE from 'three';
import {SetLight, canvasTexture, rnd, toon} from '../look';
import {add, glowTex} from '../fire';
import {frames} from '../events';
import type {SetProps} from './index';

type P3 = [number, number, number];
const PAPER = new THREE.Color('#ece6da'), WASH = new THREE.Color('#8f8b95'), NIGHT = new THREE.Color('#09080f');

function paperTex(): THREE.CanvasTexture {
  const t = canvasTexture('paper_fibre', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 2400; i++) {                     // fibres: short pale strokes, the paper's grain
      const x = rnd(i * 3) * w, y = rnd(i * 5) * h, a = rnd(i * 7) * Math.PI, l = 4 + rnd(i * 11) * 14;
      ctx.strokeStyle = `rgba(150,140,125,${0.05 + rnd(i) * 0.08})`; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Ink on the floor: a big wet blot with splatter and drips running out of it (alpha). */
function blotTex(): THREE.CanvasTexture {
  return canvasTexture('ink_blot', 512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(8,7,12,0.95)';
    for (let i = 0; i < 90; i++) {
      const a = rnd(i * 3) * Math.PI * 2, d = Math.pow(rnd(i * 5), 1.8) * w * 0.48, r = 3 + (1 - d / (w * 0.48)) * 46 * rnd(i * 7);
      ctx.beginPath(); ctx.arc(w / 2 + Math.cos(a) * d, h / 2 + Math.sin(a) * d, r, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 14; i++) {                       // splash rays: thin streaks thrown outward
      const a = rnd(i * 13) * Math.PI * 2, l = w * (0.25 + rnd(i * 17) * 0.24);
      ctx.strokeStyle = 'rgba(8,7,12,0.9)'; ctx.lineWidth = 2 + rnd(i) * 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(w / 2, h / 2); ctx.lineTo(w / 2 + Math.cos(a) * l, h / 2 + Math.sin(a) * l); ctx.stroke();
    }
  });
}

/** One brush slash: a long stroke, thick in the middle, dry-brush streaks at the tail (alpha). */
function slashTex(): THREE.CanvasTexture {
  return canvasTexture('ink_slash', 1024, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    for (let s = 0; s < 70; s++) {                       // bristles: each a line whose thickness follows the stroke's press
      const off = (rnd(s * 3) - 0.5) * h * 0.5, alpha = 0.55 + rnd(s * 5) * 0.45;
      ctx.strokeStyle = `rgba(6,5,10,${alpha})`;
      for (let x = 0; x < w; x += 6) {
        const u = x / w, press = Math.sin(Math.PI * Math.min(1, u * 1.15)) * (u > 0.8 ? (1 - u) * 5 : 1);
        if (u > 0.7 && rnd(s * 31 + x) < (u - 0.7) * 2.4) continue;   // the dry tail breaks up
        ctx.lineWidth = 2 + press * 22;
        ctx.beginPath(); ctx.moveTo(x, h / 2 + off * press); ctx.lineTo(x + 7, h / 2 + off * press); ctx.stroke();
      }
    }
  });
}

/** A heart outline as a shape (the red paper heart). */
function heartShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, -0.5);
  s.bezierCurveTo(-0.15, -0.32, -0.55, -0.1, -0.5, 0.2);
  s.bezierCurveTo(-0.45, 0.48, -0.08, 0.5, 0, 0.25);
  s.bezierCurveTo(0.08, 0.5, 0.45, 0.48, 0.5, 0.2);
  s.bezierCurveTo(0.55, -0.1, 0.15, -0.32, 0, -0.5);
  return s;
}

export const Paper: React.FC<SetProps> = ({f, fps, opts}) => {
  const o = opts;
  const blackAt = frames(o.black_at)[0];
  const black = typeof blackAt === 'number' ? Math.max(0, Math.min(1, (f - blackAt) / (Number(o.black_s ?? 2) * fps))) : Number(o.black ?? 0);
  const wash = Number(o.wash ?? 0);
  const col = PAPER.clone().lerp(WASH, wash).lerp(NIGHT, black);
  const hex = `#${col.getHexString()}`;
  const tex = paperTex();
  tex.repeat.set(40, 40);
  const slashes = Array.isArray(o.ink_slash) ? (o.ink_slash as unknown[]).map((x) => (Array.isArray(x) ? x as number[] : [x as number])) : [];
  return (
    <group>
      <SetLight neutral={Number(o.neutral_sky ?? 0)} sky={black > 0.5 ? '#2a2350' : '#ffffff'} ground={hex} fill={1.15 - 0.7 * black} key="#fff4e4" keyI={1.5 - 1.1 * black}
        keyPos={[3, 9, 5]} shadowSize={10} fog={hex} fogNear={18} fogFar={110} />
      {/* the sheet: floor + a dome of the same paper, the fold line as horizon */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[320, 320]} />
        <meshToonMaterial color={hex} map={tex} />
      </mesh>
      <mesh scale={150} renderOrder={-10}>
        <sphereGeometry args={[1, 32, 20]} />
        <meshBasicMaterial color={hex} side={THREE.BackSide} fog={false} />
      </mesh>
      <mesh position={[0, 0.02, -100]} scale={[400, 0.08, 1]} renderOrder={-9}>
        <planeGeometry args={[1, 1]} /><meshBasicMaterial color="#000" transparent opacity={0.08 * (1 - black)} fog={false} />
      </mesh>
      {/* ink on the floor around her */}
      {Number(o.ink ?? 0) > 0 ? (
        <mesh rotation={[-Math.PI / 2, 0, rnd(5) * 6]} position={[0, 0.012, 0]} scale={9 * Number(o.ink)} renderOrder={3}>
          <planeGeometry args={[1, 1]} /><meshBasicMaterial map={blotTex()} transparent depthWrite={false} />
        </mesh>
      ) : null}
      {/* brush slashes standing in the air */}
      {slashes.map(([t, deg = -12, x = 0, z = -3.5], k) => {
        const g = Math.max(0, Math.min(1, (f - t) / 4));   // the stroke is drawn left to right in 4 frames
        if (g <= 0) return null;
        return <group key={k} position={[x, 1.6, z]} rotation={[0, 0, THREE.MathUtils.degToRad(deg)]}>
          <mesh scale={[12 * g, 3, 1]} position={[-6 + 6 * g, 0, 0]} renderOrder={4}>
            <planeGeometry args={[1, 1]} /><meshBasicMaterial map={slashTex()} transparent depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>;
      })}
      {/* the red paper heart she fights for */}
      {Array.isArray(o.heart) ? (
        <mesh position={o.heart as P3} rotation={[0.1, Math.sin(f / 40) * 0.6, 0.05 * Math.sin(f / 23)]} scale={Number(o.heart_scale ?? 0.9)} castShadow material={toon('#b51a30')}>
          <extrudeGeometry args={[heartShape(), {depth: 0.04, bevelEnabled: false}]} />
        </mesh>
      ) : null}
      {/* in the black page: her stars */}
      {black > 0.3 ? Array.from({length: 360}, (_, i) => {
        const a = rnd(i * 3) * Math.PI * 2, e = 0.02 + Math.pow(rnd(i * 5), 0.8) * 1.3;
        const p = new THREE.Vector3(Math.cos(e) * Math.cos(a), Math.sin(e), Math.cos(e) * Math.sin(a)).multiplyScalar(120);
        const tw = 0.6 + 0.4 * Math.sin(f / (5 + rnd(i) * 7) + i);
        return <mesh key={`s${i}`} position={p} scale={1.2 + rnd(i * 7) * 1.6} renderOrder={-8}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={glowTex(i % 4 ? '#c58cff' : '#ffffff')} {...add} opacity={tw * (black - 0.3) / 0.7} fog={false} />
        </mesh>;
      }) : null}
    </group>
  );
};
