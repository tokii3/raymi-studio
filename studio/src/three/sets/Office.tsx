// SET office - "Same Day" (Take Me to the Beach): an open-plan office in a dome on the deep-sea floor. Identical grey
// desk rows to the horizon (the loop in space), ceiling light rows, frosted windows with marine snow drifting outside,
// a big wall screen, and HER desk at the front (chair at the origin, she faces +z; desk, monitor, postcard, globe,
// files, phone, printer as `things` from the shot). Options:
//   lights_off: [frame, ...]  each switches off the next quarter of the light rows, front to back (the four "down"s)
//   dark: 0..1               the whole room dimmed (the black room where only her chest light glows)
//   screen: text             the wall screen's text (a lyric is usually written there by the lyric block instead)
//   warm: 0..1               warm sea light pouring in (the window broken, the globe broken)
//   window_break: frame      the frosted window by her bursts outward (shards fly, warm light floods in)
//   unfold: frame            the walls fall outward like a paper box (the office opens into the beach)
//   rows: n                  how many desk rows go back (default 9)
import React from 'react';
import * as THREE from 'three';
import {RBox, Sign, drawText} from '../parts';
import {SetLight, canvasTexture, rnd, toon, toonSurface} from '../look';
import {Chair, Desk, RoutineLife} from '../routine';
import {CoatRack, DeskClutter, FilingCabinet, FloorPlant, OfficeWall, WaterCooler} from '../clutter';
import {ease} from '../../film/motion';
import type {SetProps} from './index';

const FLOOR = '#5a5e6e', WALL = '#6d7184', CEIL = '#4a4d5c';
const num = (v: unknown, d = 0) => (typeof v === 'number' ? v : d);

export const Office: React.FC<SetProps> = ({f, opts, camPos}) => {
  const rows = num(opts.rows, 9);
  const offs = Array.isArray(opts.lights_off) ? (opts.lights_off as number[]).filter((t) => f >= t).length : 0;
  const lastOff = Array.isArray(opts.lights_off) ? Math.max(-Infinity, ...(opts.lights_off as number[]).filter((t) => f >= t)) : -Infinity;
  const N = rows + 2;                                            // light rows, r = 0 at the front
  const offRows = Math.round((N * offs) / 4);                    // four "down"s = four quarters dark, front to back
  const prevOff = Math.round((N * Math.max(0, offs - 1)) / 4);
  const dying = f - lastOff < 5;                                 // the rows that just died flicker twice
  const litRows = N - offRows;
  const dark = Math.min(1, num(opts.dark) + (offs / 4) * 0.85);
  const warm = num(opts.warm);
  const power = Math.max(0.03, 1 - dark);
  const unfold = typeof opts.unfold === 'number' ? ease('in', Math.min(1, Math.max(0, (f - opts.unfold) / 24))) : 0;
  const brk = typeof opts.window_break === 'number' ? f - opts.window_break : -1;
  const screenTex = canvasTexture(`officescreen${String(opts.screen ?? '')}`, 1024, 300, (ctx, w, h) => {
    ctx.fillStyle = '#1e2436'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(160,180,255,0.18)'; ctx.lineWidth = 3;
    for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(0, (i / 6) * h); ctx.lineTo(w, (i / 6) * h); ctx.stroke(); }
    if (opts.screen) drawText(ctx, String(opts.screen), w / 2, h / 2, h * 0.42, '#e9eeff', {maxW: w * 0.92});
    else {
      // the company dashboard: a title, axes, a falling line (her energy) against a rising red one (the targets)
      drawText(ctx, 'Q3 PRODUCTIVITY', w * 0.2, h * 0.13, h * 0.11, '#e9eeff', {maxW: w * 0.35});
      drawText(ctx, 'DOME 3 - OPEN PLAN', w * 0.8, h * 0.13, h * 0.08, '#8fa0d0', {maxW: w * 0.3});
      ctx.strokeStyle = '#8fa0d0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w * 0.07, h * 0.25); ctx.lineTo(w * 0.07, h * 0.88); ctx.lineTo(w * 0.95, h * 0.88); ctx.stroke();
      ctx.fillStyle = 'rgba(160,190,255,0.35)'; for (let i = 0; i < 12; i++) ctx.fillRect(w * 0.1 + i * w * 0.07, h * (0.88 - 0.5 * (0.9 - i * 0.06)), w * 0.045, h * 0.5 * (0.9 - i * 0.06));
      ctx.strokeStyle = '#9ff0ff'; ctx.lineWidth = 5; ctx.beginPath(); for (let i = 0; i < 12; i++) ctx.lineTo(w * 0.12 + i * w * 0.07, h * (0.35 + 0.045 * i + 0.03 * Math.sin(i))); ctx.stroke();
      ctx.strokeStyle = '#ff5a5a'; ctx.lineWidth = 6; ctx.setLineDash([18, 10]); ctx.beginPath(); ctx.moveTo(w * 0.1, h * 0.7); ctx.lineTo(w * 0.93, h * 0.28); ctx.stroke(); ctx.setLineDash([]);
      drawText(ctx, 'TARGET', w * 0.9, h * 0.22, h * 0.07, '#ff8a8a');
      for (let i = 0; i < 5; i++) drawText(ctx, String(100 - i * 25), w * 0.04, h * (0.3 + i * 0.145), h * 0.05, '#8fa0d0');
    }
  });
  const snow = canvasTexture('officesnow', 512, 512, (ctx, w, h) => {
    // the sea outside: lighter towards the surface, the sea floor's dark ridge, faint far dome lights
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#2c4a7a'); g.addColorStop(0.6, '#16233f'); g.addColorStop(1, '#0a1226');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#0b1424'; ctx.beginPath(); ctx.moveTo(0, h * 0.8); for (let x = 0; x <= w; x += 32) ctx.lineTo(x, h * (0.74 + 0.06 * Math.sin(x * 0.02))); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(255,220,150,0.6)'; ctx.beginPath(); ctx.arc(rnd(i * 4) * w, h * (0.72 + 0.05 * rnd(i)), 3, 0, Math.PI * 2); ctx.fill(); }
  });
  const monitorTex = canvasTexture('office_monitor_ui', 256, 160, (ctx, w, h) => {
    ctx.fillStyle = '#20304e'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#3d5a8c'; ctx.fillRect(0, 0, w, 16);
    for (let r = 0; r < 9; r++) for (let c = 0; c < 5; c++) { ctx.fillStyle = (r + c) % 2 ? 'rgba(200,215,255,0.35)' : 'rgba(200,215,255,0.18)'; ctx.fillRect(8 + c * 49, 22 + r * 14, 45, 11); }
  });
  return (
    <group>
      <SetLight depth={typeof opts.depth === 'number' ? opts.depth : 0} sky={new THREE.Color('#c9cfe2').lerp(new THREE.Color('#ffd9a8'), warm).getStyle()} ground="#2a2c38" fill={0.7 * power + 0.2 * warm}
        key={warm > 0.3 ? '#ffe2b5' : '#cfe0ff'} keyI={1.9 * power + 1.4 * warm} keyPos={[-6, 5.5, 2.5]} target={[0, 0, -1.5]} shadowSize={9}
        fog={new THREE.Color('#2e3346').lerp(new THREE.Color('#05060c'), dark).getStyle()} fogNear={5} fogFar={26}
        bg={new THREE.Color('#4d5163').lerp(new THREE.Color('#030308'), dark).getStyle()} />
      {/* floor: carpet tiles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -12]} material={toonSurface(FLOOR, 'carpet', [24, 44])} receiveShadow><planeGeometry args={[24, 44]} /></mesh>
      {Array.from({length: 22}, (_, i) => (
        <mesh key={`ct${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 6 - i * 2]}><planeGeometry args={[24, 0.02]} />
          <meshBasicMaterial color="#4c505f" toneMapped={false} /></mesh>
      ))}
      {/* the rows of identical desks with identical grey monitors, back to the fog (her own desk is a `thing`) */}
      {Array.from({length: rows}, (_, r) => [-2.4, 2.4].map((x, c) => (
        <group key={`d${r}${c}`} position={[x, 0, -1.6 - r * 2.2]}>
          <Desk pos={[0, 0, 0]} rotY={Math.PI} />
          <RBox size={[0.5, 0.34, 0.03]} pos={[0, 1.12, -0.12]} r={0.015} c="#2b2e3c" />
          {r + 1 >= offRows ? <mesh position={[0, 1.12, -0.137]} rotation={[0, Math.PI, 0]}><planeGeometry args={[0.46, 0.29]} /><meshBasicMaterial map={monitorTex} toneMapped={false} /></mesh> : null}
          <DeskClutter pos={[0, 0, -0.2]} seed={r * 7 + c * 3 + 1} monitorGlow={false} />
          <RBox size={[0.5, 0.08, 0.48]} pos={[0, 0.46, -0.6]} r={0.03} c="#4a4e66" t="fabric" />
          <RBox size={[0.48, 0.5, 0.07]} pos={[0, 0.78, -0.82]} r={0.04} c="#4a4e66" t="fabric" />
        </group>
      )))}
      {/* the ceiling and its light rows (each row a long panel; rows die from the front on lights_off) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.4, -12]} material={toon(CEIL)}><planeGeometry args={[24, 44]} /></mesh>
      {Array.from({length: N}, (_, r) => {
        const k = r >= offRows ? 1 : dying && r >= prevOff && Math.floor(f / 2) % 2 === 0 ? 1 : 0;
        return (
          <group key={`l${r}`} position={[0, 3.38, 2 - r * 2.2]}>
            {[-2.4, 0, 2.4].map((x) => (
              <mesh key={x} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[1.6, 0.32]} />
                <meshBasicMaterial color={k > 0 ? (warm > 0.4 ? '#fff0d6' : '#f4f7ff') : '#2a2c38'} toneMapped={false} side={THREE.DoubleSide} /></mesh>
            ))}
          </group>
        );
      })}
      {litRows > 0 ? <pointLight position={[0, 3, 0]} color="#eef1ff" intensity={4 * power} distance={9} decay={1.4} /> : null}
      {/* depth: the lit rows nearest her throw pools on the desks; the far rows are only their panels in the dark */}
      {num(opts.depth) > 0 ? [1, 2, 3].filter((r) => r >= offRows).map((r) => (
        <pointLight key={`pool${r}`} position={[0, 3.1, 2 - r * 2.2]} color={warm > 0.4 ? '#ffe9c8' : '#e8eeff'}
          intensity={5 * power * num(opts.depth)} distance={5.5} decay={1.6} />
      )) : null}
      {/* back wall with the big screen (a lyric surface) */}
      <RBox size={[24, 3.4, 0.3]} pos={[0, 1.7, -4.4 - rows * 2.2]} r={0.02} c={WALL} cast={false} t="plaster" />
      <group position={[0, 2.25, -3.6]}>
        <RBox size={[5.4, 1.62, 0.12]} r={0.04} c="#151824" />
        <mesh position={[0, 0, 0.065]}><planeGeometry args={[5.2, 1.5]} />
          <meshBasicMaterial map={screenTex} color={new THREE.Color(1, 1, 1).multiplyScalar(0.25 + 0.75 * power)} toneMapped={false} /></mesh>
      </group>
      {/* side wall with frosted windows: marine snow drifts in the dark sea outside */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 6, 0, 0]} rotation={[0, side * -Math.PI / 2, side * unfold * 0.9]}>
          <RBox size={[44, 3.4, 0.25]} pos={[-12 * side, 1.7, 0]} r={0.02} c={WALL} cast={false} t="plaster" />
          {Array.from({length: 7}, (_, w) => {
            const x = 3 - w * 3.2;
            const broken = side < 0 && w === 1 && brk >= 0;
            return (
              <group key={w} position={[x * side, 1.75, 0.14]}>
                {!broken ? <mesh><planeGeometry args={[2.2, 1.6]} /><meshBasicMaterial map={snow} toneMapped={false} /></mesh>
                  : <mesh><planeGeometry args={[2.2, 1.6]} /><meshBasicMaterial color="#ffd9a0" toneMapped={false} /></mesh>}
                {!broken ? <mesh position={[0, 0, 0.01]}><planeGeometry args={[2.2, 1.6]} /><meshBasicMaterial color="#cfe0ff" transparent opacity={0.28} toneMapped={false} /></mesh> : null}
                {!broken ? Array.from({length: 12}, (_, i) => (
                  <mesh key={i} position={[(rnd(i + w * 13) - 0.5) * 2, ((rnd(i * 2.1 + w) * 1.6 - f * 0.004 * (0.5 + rnd(i))) % 1.6 + 1.6) % 1.6 - 0.8, 0.005]}>
                    <circleGeometry args={[0.012 + 0.012 * rnd(i * 3), 6]} /><meshBasicMaterial color="#e6efff" toneMapped={false} /></mesh>
                )) : null}
                <RBox size={[2.3, 0.08, 0.16]} pos={[0, -0.84, 0.04]} r={0.01} c="#868a9c" t="metal" />
                <RBox size={[2.3, 0.07, 0.06]} pos={[0, 0.83, 0.02]} r={0.01} c="#868a9c" t="metal" />
                {[-1.15, 0, 1.15].map((mx) => <RBox key={mx} size={[0.06, 1.66, 0.07]} pos={[mx, 0, 0.02]} r={0.01} c="#868a9c" t="metal" />)}
                <mesh position={[0, -0.77, 0.06]} scale={[1, 0.25, 0.4]} material={toon('#e8eef8')}><capsuleGeometry args={[0.05, 2.1, 4, 8]} /></mesh>
              </group>
            );
          })}
        </group>
      ))}
      {/* the window by her desk breaking outward */}
      {brk >= 0 && brk < 40 ? Array.from({length: 16}, (_, i) => (
        <mesh key={`sh${i}`} position={[-6 - brk * 0.06 * (0.5 + rnd(i)), 1.75 + (rnd(i * 2) - 0.5) * 1.4 - brk * brk * 0.0015, 3.2 - 3.2 + (rnd(i * 3) - 0.5) * 2.2]}
          rotation={[brk * 0.2 * rnd(i), brk * 0.3, rnd(i * 5) * 3]}>
          <planeGeometry args={[0.18 + 0.2 * rnd(i * 7), 0.12 + 0.18 * rnd(i * 9)]} />
          <meshBasicMaterial color="#dff0ff" transparent opacity={0.75} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      )) : null}
      {warm > 0 ? <pointLight position={[-5, 2, 0.5]} color="#ffc887" intensity={14 * warm} distance={14} decay={1.3} /> : null}
      {/* a little name plate on her desk side (readable set text) */}
      <Sign id="officeplate" pos={[0.62, 0.62, 0.88]} size={[0.32, 0.08]} paint={(ctx, w, h) => {
        ctx.fillStyle = '#d8dbe6'; ctx.fillRect(0, 0, w, h); drawText(ctx, 'RAYMI', w / 2, h / 2, h * 0.6, '#3a3e58', {maxW: w * 0.9});
      }} />
      <Desk pos={[0, 0, 0.55]} rotY={Math.PI} w={1.5} />
      {/* HER chair is part of her desk (toki 2026-10-24: "es fehlt Raymis Stuhl"): she sits on it; when she stands at
          her place the compiler rolls it back (opts.chair_out) - nobody stands inside a chair */}
      {opts.chair === false ? null : (
        <Chair t={{kind: 'chair', pos: opts.chair_out ? [0.25, 0, -0.75] : [0, 0, 0], rot: [0, opts.chair_out ? 0.5 : 0, 0]}} f={f} />
      )}
      {/* the room is lived in: walls dressed, cabinets, a water cooler, plants, coats (seeded, the same every frame) */}
      <OfficeWall pos={[-2.8, 0, -3.62]} />
      <OfficeWall pos={[2.9, 0, -3.62]} />
      {Array.from({length: Math.ceil(rows / 2)}, (_, k) => (
        <group key={`side${k}`}>
          <FilingCabinet pos={[-5.6, 0, -1.0 - k * 4.4]} rotY={Math.PI / 2} />
          <FilingCabinet pos={[-5.6, 0, -1.55 - k * 4.4]} rotY={Math.PI / 2} />
          {k % 2 ? <FloorPlant pos={[5.5, 0, -2.0 - k * 4.4]} seed={k} /> : <CoatRack pos={[5.4, 0, -2.0 - k * 4.4]} />}
        </group>
      ))}
      <WaterCooler pos={[-4.6, 0, 1.2]} />
      <FloorPlant pos={[4.4, 0, 1.6]} seed={9} />
      {/* warm desk lamps here and there: amber pools against the cool room */}
      {[[-2.4, -1.6], [2.4, -6.0], [-2.4, -10.4]].map(([x, z], k) => (
        <group key={`lamp${k}`} position={[x + 0.5, 0.765, z + 0.15]}>
          <mesh position={[0, 0.2, 0]} material={toon('#2a2c38')}><cylinderGeometry args={[0.01, 0.012, 0.4, 6]} /></mesh>
          <mesh position={[0, 0.4, 0]} rotation={[0.6, 0, 0]} material={toon('#e7b04a', '#ffb347', 0.4)}><coneGeometry args={[0.07, 0.1, 14, 1, true]} /></mesh>
          <pointLight position={[0, 0.3, 0.05]} color="#ffb35c" intensity={2.6 * power} distance={2.2} decay={1.8} />
        </group>
      ))}
      <RoutineLife opts={opts} f={f} camPos={camPos} />
    </group>
  );
};
