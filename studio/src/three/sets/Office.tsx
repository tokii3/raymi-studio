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
import {Desk, RoutineLife} from '../routine';
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
    else { ctx.fillStyle = 'rgba(160,190,255,0.5)'; for (let i = 0; i < 9; i++) ctx.fillRect(w * 0.08 + i * w * 0.095, h * (0.75 - 0.4 * rnd(i * 3.3)), w * 0.06, h * 0.4 * rnd(i * 3.3) + 4); }
  });
  const snow = canvasTexture('officesnow', 512, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#16233f'); g.addColorStop(1, '#0a1226');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  return (
    <group>
      <SetLight sky={new THREE.Color('#c9cfe2').lerp(new THREE.Color('#ffd9a8'), warm).getStyle()} ground="#2a2c38" fill={0.7 * power + 0.2 * warm}
        key={warm > 0.3 ? '#ffe2b5' : '#f2f4ff'} keyI={2.6 * power + 1.4 * warm} keyPos={[3.5, 6.5, 4]} target={[0, 0, -2]} shadowSize={9}
        fog={new THREE.Color('#5a5f72').lerp(new THREE.Color('#05060c'), dark).getStyle()} fogNear={9} fogFar={34}
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
          <RBox size={[0.5, 0.34, 0.03]} pos={[0, 1.12, -0.12]} r={0.015} c="#2b2e3c" e={r + 1 >= offRows ? '#4a5a8a' : '#000000'} ei={0.35} />
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
                <RBox size={[2.3, 0.06, 0.08]} pos={[0, -0.82, 0]} r={0.01} c="#868a9c" />
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
      <RoutineLife opts={opts} f={f} camPos={camPos} />
    </group>
  );
};
