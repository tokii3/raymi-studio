// SET weather - "Storm Warning": a TV weather studio. A big ocean weather map wall (built, painted with canvas: sea,
// islands, weather symbols), a ticker band, a news desk, two pedestal studio cameras with tally lights (frames as
// objects), light stands with softboxes, an ON AIR box. Options: map ('sunny' | 'storm'), warning (true = WARNING
// banner on the map), onair (true), ticker (text), flood (0..1 water rising in the studio), lightning (true = white
// flashes on music hits), tally (0 | 1 | 2 = which camera is live).
import React from 'react';
import * as THREE from 'three';
import {Beam, Bubbles, RBox, Sign, drawText} from '../parts';
import {SetLight, canvasTexture, rnd, toon} from '../look';
import type {SetProps} from './index';

const FLOOR = '#1c2350', WALL = '#141a3c', TRIM = '#2fd1d6', TRIM2 = '#9b5cff';

function mapPaint(mode: string, warning: boolean) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, mode === 'storm' ? '#203069' : '#1d6fb0'); g.addColorStop(1, mode === 'storm' ? '#141a44' : '#1a3f8a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2;
    for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo((i / 8) * w, 0); ctx.lineTo((i / 8) * w, h); ctx.stroke(); }
    for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(0, (i / 5) * h); ctx.lineTo(w, (i / 5) * h); ctx.stroke(); }
    const isl = [[0.2, 0.62, 0.13, 0.09], [0.31, 0.4, 0.07, 0.05], [0.72, 0.68, 0.16, 0.1], [0.83, 0.32, 0.09, 0.07], [0.55, 0.22, 0.05, 0.04]];
    for (const [x, y, rx, ry] of isl) {
      ctx.fillStyle = '#3fc4a0';
      ctx.beginPath();
      for (let k = 0; k <= 16; k++) {
        const a = (k / 16) * Math.PI * 2, r = 1 + 0.18 * Math.sin(a * 3 + x * 20);
        const px = x * w + Math.cos(a) * rx * w * r, py = y * h + Math.sin(a) * ry * h * r;
        if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.fill();
    }
    const sym = (x: number, y: number, kind: string) => {
      const s = h * 0.09, cx = x * w, cy = y * h;
      if (kind === 'sun') {
        ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(cx, cy, s * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = s * 0.12;
        for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * s * 0.7, cy + Math.sin(a) * s * 0.7); ctx.lineTo(cx + Math.cos(a) * s, cy + Math.sin(a) * s); ctx.stroke(); }
      } else {
        ctx.fillStyle = kind === 'storm' ? '#9aa3c7' : '#e9f1ff';
        for (const [dx, dy, r] of [[-0.35, 0.1, 0.38], [0.05, -0.12, 0.5], [0.42, 0.1, 0.36]]) { ctx.beginPath(); ctx.arc(cx + dx * s, cy + dy * s, r * s, 0, Math.PI * 2); ctx.fill(); }
        if (kind !== 'cloud') {
          ctx.strokeStyle = kind === 'storm' ? '#ffd34d' : '#7fd8ff'; ctx.lineWidth = s * 0.1; ctx.lineCap = 'round';
          if (kind === 'storm') { ctx.beginPath(); ctx.moveTo(cx, cy + s * 0.3); ctx.lineTo(cx - s * 0.18, cy + s * 0.7); ctx.lineTo(cx + s * 0.08, cy + s * 0.68); ctx.lineTo(cx - s * 0.08, cy + s * 1.05); ctx.stroke(); }
          else for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(cx + (k - 1) * s * 0.35, cy + s * 0.45); ctx.lineTo(cx + (k - 1) * s * 0.35 - s * 0.1, cy + s * 0.75); ctx.stroke(); }
        }
      }
    };
    if (mode === 'storm') {
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = h * 0.012;
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(w * 0.5, h * 0.5, h * (0.08 + k * 0.07), k, k + 4.2); ctx.stroke(); }
      sym(0.22, 0.45, 'storm'); sym(0.75, 0.5, 'storm'); sym(0.83, 0.2, 'rain'); sym(0.3, 0.22, 'rain');
    } else {
      sym(0.22, 0.48, 'sun'); sym(0.72, 0.52, 'sun'); sym(0.83, 0.2, 'cloud'); sym(0.32, 0.25, 'sun');
    }
    if (warning) {
      ctx.fillStyle = '#ff5a3c'; ctx.fillRect(0, 0, w, h * 0.13);
      drawText(ctx, 'WARNING', w / 2, h * 0.067, h * 0.1, '#ffffff');
    }
  };
}

/** A pedestal studio camera with a red tally light (live = lit). */
const StudioCamera: React.FC<{pos: [number, number, number]; rotY: number; live: boolean}> = ({pos, rotY, live}) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <mesh position={[0, 0.06, 0]} material={toon('#262a40')} castShadow><cylinderGeometry args={[0.55, 0.6, 0.12, 6]} /></mesh>
    <mesh position={[0, 0.75, 0]} material={toon('#3a3f5c')} castShadow><cylinderGeometry args={[0.07, 0.09, 1.3, 10]} /></mesh>
    <RBox size={[0.5, 0.42, 0.8]} pos={[0, 1.55, 0]} r={0.05} c="#2b2f48" />
    <mesh position={[0, 1.55, 0.55]} rotation={[Math.PI / 2, 0, 0]} material={toon('#1a1c2c')} castShadow><cylinderGeometry args={[0.15, 0.17, 0.4, 20]} /></mesh>
    <mesh position={[0, 1.55, 0.76]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.13, 24]} /><meshBasicMaterial color="#3b6fd6" toneMapped={false} /></mesh>
    <RBox size={[0.3, 0.22, 0.06]} pos={[0, 1.62, -0.45]} r={0.02} c="#14162a" />
    <mesh position={[0, 1.83, 0.2]}><sphereGeometry args={[0.05, 12, 10]} /><meshBasicMaterial color={live ? '#ff2b3a' : '#4a1418'} toneMapped={false} /></mesh>
    <RBox size={[0.05, 0.05, 0.7]} pos={[0.32, 1.35, -0.6]} rot={[0.5, 0, 0]} r={0.02} c="#3a3f5c" />
  </group>
);

/** A light stand with a softbox (its glowing face lights the presenter - a real lamp in the picture). */
const Softbox: React.FC<{pos: [number, number, number]; rotY: number; c?: string}> = ({pos, rotY, c = '#fff4e6'}) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    {[-1, 0, 1].map((k) => <mesh key={k} position={[Math.sin(k * 2.1) * 0.35, 0.5, Math.cos(k * 2.1) * 0.35]} rotation={[0.35 * Math.cos(k * 2.1), 0, -0.35 * Math.sin(k * 2.1)]} material={toon('#2a2d40')}><cylinderGeometry args={[0.02, 0.02, 1.1, 6]} /></mesh>)}
    <mesh position={[0, 1.6, 0]} material={toon('#2a2d40')}><cylinderGeometry args={[0.025, 0.025, 2.2, 8]} /></mesh>
    <RBox size={[1.0, 1.0, 0.45]} pos={[0, 2.7, 0]} r={0.04} c="#1d2033" />
    <mesh position={[0, 2.7, 0.23]}><planeGeometry args={[0.9, 0.9]} /><meshBasicMaterial color={c} toneMapped={false} /></mesh>
  </group>
);

export const Weather: React.FC<SetProps> = ({f, opts, hits}) => {
  const mode = String(opts.map ?? 'sunny');
  const warning = Boolean(opts.warning);
  const flood = Number(opts.flood ?? 0);
  const onair = opts.onair !== false;
  const tally = Number(opts.tally ?? 1);
  const power = Number(opts.power ?? 1);          // 0 = power cut: only screens on battery and her glow
  const ticker = String(opts.ticker ?? 'WEATHER WITH RAYMI');
  let flash = 0;
  if (opts.lightning) for (const h of hits) { const d = f - h; if (d >= 0 && d < 4) flash = Math.max(flash, 1 - d / 4); }
  const tex = canvasTexture(`map${mode}${warning}`, 1024, 576, mapPaint(mode, warning));
  const tick = canvasTexture(`ticker${ticker}`, 2048, 96, (ctx, w, h) => {
    ctx.fillStyle = '#0d1030'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = warning ? '#ff5a3c' : '#2fd1d6'; ctx.fillRect(0, 0, h * 2.2, h);
    drawText(ctx, warning ? 'ALERT' : 'LIVE', h * 1.1, h / 2, h * 0.56, '#0d1030');
    const line = `${ticker}   ·   `.repeat(4);
    drawText(ctx, line, h * 2.6, h / 2, h * 0.52, '#ffffff', {align: 'left'});
  });
  tick.wrapS = THREE.RepeatWrapping;
  tick.offset.x = (f * 0.0025) % 1;
  return (
    <group>
      <SetLight sky={mode === 'storm' ? '#5f6fb8' : '#9fc7ff'} ground="#2b1660" fill={0.25 + 0.65 * power} key="#fff2e0" keyI={(1.6 + flash * 3) * power + 0.1} keyPos={[3, 8, 6]}
        target={[0.3, 0, -1.2]} shadowSize={7} fog="#0f1230" fogNear={12} fogFar={32} bg="#0b0d24" />
      <pointLight position={[0, 2.4, -2.2]} color={mode === 'storm' ? '#6f7cff' : '#58b8ff'} intensity={10 * power + 1} distance={7} decay={1.5} />
      <pointLight position={[-3, 2.5, 2]} color="#ffb3e6" intensity={6 * power} distance={8} decay={1.5} />
      {/* floor with a presenter mark */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1]} material={toon(FLOOR)} receiveShadow><planeGeometry args={[18, 14]} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0.4]} position={[0.6, 0.005, -1.2]}><planeGeometry args={[0.5, 0.06]} /><meshBasicMaterial color="#ffd34d" toneMapped={false} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, -0.4]} position={[0.6, 0.005, -1.2]}><planeGeometry args={[0.5, 0.06]} /><meshBasicMaterial color="#ffd34d" toneMapped={false} /></mesh>
      {/* back wall, map, trims, ticker */}
      <RBox size={[16, 6, 0.3]} pos={[0, 3, -3.2]} r={0.02} c={WALL} cast={false} />
      <RBox size={[8.4, 4.9, 0.2]} pos={[0, 2.25, -3.05]} r={0.05} c="#0c0f28" />
      <mesh position={[0, 2.3, -2.93]}><planeGeometry args={[8, 4.5]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
      <mesh position={[0, 0.3, -2.92]}><planeGeometry args={[8, 0.36]} /><meshBasicMaterial map={tick} toneMapped={false} /></mesh>
      {[-4.6, 4.6].map((x, i) => <mesh key={i} position={[x, 2.4, -3.0]}><boxGeometry args={[0.06, 4.4, 0.06]} /><meshBasicMaterial color={i ? TRIM2 : TRIM} toneMapped={false} /></mesh>)}
      <mesh position={[0, 4.85, -3.0]}><boxGeometry args={[9.4, 0.05, 0.05]} /><meshBasicMaterial color={TRIM} toneMapped={false} /></mesh>
      {/* ON AIR */}
      <Sign id={`onair${onair}`} pos={[3.8, 3.7, -3.0]} size={[1.3, 0.42]} glow frame="#14162a" paint={(ctx, w, h) => {
        ctx.fillStyle = onair ? '#ff2b3a' : '#3a1418'; ctx.fillRect(0, 0, w, h);
        drawText(ctx, 'ON AIR', w / 2, h / 2, h * 0.62, onair ? '#fff' : '#6a3a40', {maxW: w * 0.88});
      }} />
      {/* desk */}
      <group position={[-3.6, 0, 0.3]} rotation={[0, 0.5, 0]}>
        <RBox size={[2.6, 0.95, 0.9]} pos={[0, 0.48, 0]} r={0.12} c="#2b2a5e" />
        <RBox size={[2.8, 0.08, 1.05]} pos={[0, 0.98, 0]} r={0.03} c="#e9e4ff" />
        <Sign id="desklogo" pos={[0, 0.5, 0.46]} size={[2.1, 0.5]} glow paint={(ctx, w, h) => {
          ctx.fillStyle = '#1b1a46'; ctx.fillRect(0, 0, w, h);
          drawText(ctx, 'WEATHER WITH RAYMI', w / 2, h / 2, h * 0.5, '#9ff2ff', {maxW: w * 0.92});
        }} />
      </group>
      <StudioCamera pos={[0.4, 0, 4.3]} rotY={Math.PI} live={tally === 1} />
      <StudioCamera pos={[3.6, 0, 3.4]} rotY={Math.PI + 0.55} live={tally === 2} />
      <Softbox pos={[-2.4, 0, 2.6]} rotY={2.6} />
      <Softbox pos={[3.8, 0, 1.2]} rotY={-2.2} c="#ffe1f4" />
      {/* the lighting truss */}
      <mesh position={[0, 5.6, 0.5]} rotation={[0, 0, Math.PI / 2]} material={toon('#2a2d40')}><cylinderGeometry args={[0.06, 0.06, 12, 8]} /></mesh>
      {[-3, -1, 1, 3].map((x, i) => (
        <group key={i} position={[x, 5.35, 0.5]} rotation={[0.5, 0, 0]}>
          <mesh material={toon('#1d2033')}><cylinderGeometry args={[0.16, 0.22, 0.4, 12]} /></mesh>
          <mesh position={[0, -0.21, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.19, 16]} /><meshBasicMaterial color="#fff6dd" toneMapped={false} side={THREE.DoubleSide} /></mesh>
        </group>
      ))}
      <Beam pos={[1, 3.2, -0.6]} rot={[0.5, 0, 0]} len={4.6} r={1.2} c="#fff2d6" opacity={0.07 * power} />
      {/* her sea floods the studio */}
      {flood > 0 ? (
        <group>
          <mesh position={[0, flood * 1.6, 1]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={7}>
            <planeGeometry args={[18, 14, 40, 30]} />
            <meshToonMaterial color="#3fb6c9" transparent opacity={0.62} />
          </mesh>
          <Bubbles pos={[-1, 0, 1.2]} f={f} n={30} h={flood * 1.6} spread={6} seed={41} size={0.06} />
          {Array.from({length: 7}, (_, i) => (
            <mesh key={i} position={[(rnd(i) - 0.5) * 9, flood * 1.6 + 0.05 * Math.sin(f / 10 + i), (rnd(i + 3) - 0.3) * 6]} rotation={[-Math.PI / 2, 0, rnd(i + 5) * 6]} renderOrder={8}>
              <ringGeometry args={[0.3 + rnd(i + 7) * 0.4 + (f % 40) / 60, 0.36 + rnd(i + 7) * 0.4 + (f % 40) / 60, 32]} />
              <meshBasicMaterial color="#c9f6ff" transparent opacity={0.45} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ) : null}
      {flash > 0 ? <ambientLight intensity={flash * 3} color="#e8ecff" /> : null}
    </group>
  );
};
