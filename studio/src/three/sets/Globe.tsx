// SET globe - "Same Day": INSIDE the boss's snow globe. She stands tiny among towering stacks of grey files (his
// 'mountains' - a metaphor, never a real mountain, toki 2026-10-23), snow-capped with paper snow;
// the glass dome curves around and over her; paper snow swirls when the hand shakes it. Through the glass, huge and
// blurred: the grey office and the boss's fingers. The T-A-K-E: her tail cracks the glass (a star of cracks), and the
// crack lines light up letter by letter with the vocal, then the glass bursts into shards.
// Options:
//   shake: [frame, ...]     the globe is shaken (snow swirls up, the world tilts)
//   cracks: [frame, ...]    each tail blow adds a ring of cracks around "hit" (default the glass toward the lens)
//   letters: [[frame, "T"], ...]  crack letters that light (frame-wide over the glass)
//   burst: frame           the glass bursts outward (shards fly; afterwards no glass)
//   hit: [x, y, z]         where the tail strikes the glass
import React from 'react';
import * as THREE from 'three';
import {SetLight, canvasTexture, rnd, toon, toonSurface} from '../look';
import {drawText} from '../parts';
import {RoutineLife} from '../routine';
import type {SetProps} from './index';

const R = 3.2;   // dome radius (m) - she is 1.55 m: the globe is her whole world

export const Globe: React.FC<SetProps> = ({f, opts, camPos}) => {
  const shakes = Array.isArray(opts.shake) ? (opts.shake as number[]) : [];
  let swirl = 0;
  for (const s of shakes) { const d = f - s; if (d >= 0 && d < 45) swirl = Math.max(swirl, 1 - d / 45); }
  const cracks = Array.isArray(opts.cracks) ? (opts.cracks as number[]).filter((t) => f >= t).length : 0;
  const burst = typeof opts.burst === 'number' ? f - opts.burst : -1;
  // where the tail strikes: given, or the glass where the lens looks at her (near side from outside, far side inside)
  const c = new THREE.Vector3(0, 1.3, 0), cam = new THREE.Vector3(...(camPos ?? [0, 1.4, 6]));
  const outside = cam.distanceTo(new THREE.Vector3(0, 0, 0)) > R;
  const dirV = (outside ? cam.clone().sub(c) : c.clone().sub(cam)).normalize();
  const auto = c.clone().add(dirV.multiplyScalar(R * 0.9));
  const hit = (Array.isArray(opts.hit) ? opts.hit : [auto.x, auto.y, auto.z]) as [number, number, number];
  const letters = Array.isArray(opts.letters) ? (opts.letters as [number, string][]) : [];
  const lit = letters.filter(([t]) => f >= t).map(([, l]) => l).join('');
  const crackTex = canvasTexture(`globecracks${cracks}${lit}`, 1024, 1024, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineCap = 'round';
    for (let ring = 0; ring < cracks; ring++) {
      for (let i = 0; i < 11; i++) {
        const a = (i / 11) * Math.PI * 2 + ring * 0.4;
        ctx.lineWidth = 7 - ring * 2;
        ctx.beginPath(); ctx.moveTo(w / 2, h / 2);
        let x = w / 2, y = h / 2;
        for (let k = 1; k <= 4; k++) {
          const r = (k / 4) * w * (0.22 + ring * 0.2);
          x = w / 2 + Math.cos(a + 0.18 * Math.sin(k * 3 + i)) * r; y = h / 2 + Math.sin(a + 0.18 * Math.sin(k * 3 + i)) * r;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    if (lit) {
      // the lit letters ride the crack star: glowing violet-white strokes, frame-wide
      ctx.shadowColor = '#c9a6ff'; ctx.shadowBlur = 40;
      drawText(ctx, lit, w / 2, h / 2, h * 0.34, '#fff6ff', {maxW: w * 0.9, outline: '#7a4cff', ow: 16});
    }
  });
  const sky = canvasTexture('globeoffice', 512, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#5a5f72'); g.addColorStop(1, '#3a3d4c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(240,244,255,0.5)';
    for (let i = 0; i < 6; i++) ctx.fillRect(w * (0.05 + i * 0.16), h * 0.08, w * 0.1, h * 0.04);   // blurred ceiling lights
  });
  return (
    <group>
      <SetLight sky="#dfe6ff" ground="#4a5680" fill={0.8} key="#ffffff" keyI={1.4} keyPos={[2, 6, 4]} target={[0, 0, 0]} shadowSize={5}
        fog="#6a6f82" fogNear={6} fogFar={22} bg="#4a4e60" />
      {/* the office outside, huge and soft through the glass */}
      <mesh position={[0, 4, -12]} scale={[40, 20, 1]}><planeGeometry args={[1, 1]} /><meshBasicMaterial map={sky} toneMapped={false} /></mesh>
      {/* the paper ground (a disc) and the file towers, slightly tilting while it is shaken */}
      <group rotation={[0.06 * swirl * Math.sin(f * 0.7), 0, 0.08 * swirl * Math.sin(f * 0.9)]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={toonSurface('#8fa6d8', 'paper', [6, 6])} receiveShadow><circleGeometry args={[R, 48]} /></mesh>
        {[[-1.8, -1.6, 2.4], [1.6, -1.9, 2.0], [0.2, -2.5, 3.0], [-2.4, 0.4, 1.4], [2.3, 0.6, 1.2]].map(([x, z, hgt], i) => (
          <group key={i} position={[x, 0, z]} rotation={[0, rnd(i) * 1.5, 0]}>
            {/* a tower of files, each folder a little askew, a cap of paper snow on top */}
            {Array.from({length: Math.round(hgt / 0.12)}, (_, k) => (
              <mesh key={k} position={[0.04 * Math.sin(k * 2.3 + i), 0.06 + k * 0.12, 0.03 * Math.cos(k * 1.7 + i)]} rotation={[0, 0.18 * Math.sin(k * 3.1 + i), 0.02 * Math.sin(k)]}
                material={toonSurface(['#9aa0b4', '#b8bdcc', '#7f879e', '#a7acbf'][(k + i) % 4], 'paper')} castShadow><boxGeometry args={[0.95, 0.11, 0.7]} /></mesh>
            ))}
            <mesh position={[0, hgt + 0.08, 0]} material={toon('#ffffff')} scale={[1, 0.25, 0.75]}><sphereGeometry args={[0.5, 12, 8]} /></mesh>
          </group>
        ))}
      </group>
      {/* paper snow: drifting, swirling up when shaken */}
      {Array.from({length: 120}, (_, i) => {
        const a = rnd(i * 1.3) * Math.PI * 2 + swirl * f * 0.05 * (rnd(i) - 0.3);
        const r = Math.sqrt(rnd(i * 2.9)) * (R - 0.3);
        const fall = (rnd(i * 4.4) * 4 - f * 0.01 * (0.4 + rnd(i * 7))) % 4;
        const y = swirl > 0 ? 0.3 + rnd(i * 5.5) * 3.4 * swirl + (1 - swirl) * ((fall + 4) % 4) * 0.8 : ((fall + 4) % 4) * 0.8;
        return <mesh key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r]} rotation={[f * 0.05 + i, i, 0]}>
          <planeGeometry args={[0.05, 0.05]} /><meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} toneMapped={false} /></mesh>;
      })}
      {/* the glass dome (gone after the burst) */}
      {burst < 0 ? (
        <>
          <mesh renderOrder={9}><sphereGeometry args={[R, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2 + 0.25]} />
            <meshToonMaterial color="#e6f4ff" transparent opacity={0.16} side={THREE.DoubleSide} depthWrite={false} /></mesh>
          {/* a highlight streak on the glass */}
          <mesh position={[-1.2, 2.2, R * 0.72]} rotation={[0, -0.4, 0.5]} renderOrder={10}><planeGeometry args={[0.18, 1.6]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.35} depthWrite={false} toneMapped={false} /></mesh>
          {cracks > 0 || lit ? (
            <mesh position={[hit[0], hit[1] + 0.85, hit[2]]} rotation={[0, camPos ? Math.atan2(camPos[0] - hit[0], camPos[2] - hit[2]) : 0, 0]} renderOrder={11}>
              <planeGeometry args={[2.0, 2.0]} /><meshBasicMaterial map={crackTex} transparent depthWrite={false} toneMapped={false} />
            </mesh>
          ) : null}
          {lit ? <pointLight position={[hit[0], hit[1], hit[2] - 0.4]} color="#d9b8ff" intensity={6} distance={6} decay={1.5} /> : null}
        </>
      ) : burst < 50 ? Array.from({length: 40}, (_, i) => {
        // the shards fly outward past the lens and hang for a beat (the shot spells TAKE with its lyric block)
        const a = rnd(i * 2.2) * Math.PI * 2, el = rnd(i * 3.1) * 1.2;
        const sp = 0.12 * (0.5 + rnd(i * 5)) * Math.max(0.15, 1 - burst / 20);
        const d = R + burst * sp;
        return <mesh key={i} position={[Math.cos(a) * Math.cos(el) * d, 0.4 + Math.sin(el) * d, Math.sin(a) * Math.cos(el) * d]}
          rotation={[burst * 0.1 * rnd(i), burst * 0.13, rnd(i * 9) * 3]} renderOrder={9}>
          <planeGeometry args={[0.25 + 0.4 * rnd(i * 7), 0.2 + 0.35 * rnd(i * 8)]} />
          <meshBasicMaterial color="#eaf6ff" transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
        </mesh>;
      }) : null}
      <RoutineLife opts={opts} f={f} camPos={camPos} />
    </group>
  );
};
