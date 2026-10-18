// SET aquarium - "The Star Exhibit": a public aquarium tank as Raymi's stage and cage. Built only (rocks, sand, kelp,
// coral, toy castle, clam throne, bottle-cap crown, glass, visitor silhouettes with phones). Marks + cameras in
// sets.json. Options: flashes (phones flash on music hits), dim (0..1 hall + tank lights going out), crowd (count),
// led (text on the LED board above the glass), warning (true = DO NOT TAP THE GLASS sign).
import React from 'react';
import * as THREE from 'three';
import {Beam, Bubbles, Caustics, Coral, Ground, Kelp, RBox, Rock, Sign, Visitor, drawText} from '../parts';
import {BottleCap, Fish, ShellThrone, Stanchions, ToyCastle} from '../props';
import {SetLight, canvasTexture, rnd, toon, useScreenTexture} from '../look';
import type {SetProps} from './index';

const SAND = '#c9a9d6', ROCK = '#5b4a8c', ROCK2 = '#3f3577', KELP = '#2f8f86', KELP2 = '#1f6f78';
const HALL = '#191233', PEOPLE = '#231b4a', FRAME = '#2a1f45';

export const Aquarium: React.FC<SetProps> = ({f, opts, hits}) => {
  const dim = Number(opts.dim ?? 0);
  const crowd = Number(opts.crowd ?? 14);
  const flashes = opts.flashes !== false;
  const led = String(opts.led ?? 'STAR EXHIBIT');
  const on = 1 - dim;
  const screen = useScreenTexture(opts.screens ? String(opts.screens) : null);   // the phones film HER
  // pa pa pa: on each hit 3 seeded phones flash for 4 frames
  const forced = Number(opts.flash ?? 0);            // a held flash moment (key frames): that share of phones fires
  const flashOf = (i: number) => {
    if (forced > 0 && rnd(i * 7 + 3) < forced) return 1;
    if (!flashes) return 0;
    for (const h of hits) {
      const d = f - h;
      if (d >= 0 && d < 5 && rnd(h * 13 + i) < 0.28) return 1 - d / 5;
    }
    return 0;
  };
  const backdrop = canvasTexture('aq_back', 64, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#53d6e0'); g.addColorStop(0.45, '#2a7fae'); g.addColorStop(1, '#2c1f6b');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  const surface = canvasTexture('aq_surface', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#7fe6ee'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 3;
    for (let i = 0; i < 26; i++) {
      const x = rnd(i) * w, y = rnd(i + 50) * h, r = 10 + rnd(i + 90) * 24;
      ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.6, rnd(i + 7) * 3, 0, Math.PI * 2); ctx.stroke();
    }
  });
  const glassTex = canvasTexture('aq_glass', 512, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(190,240,255,0.06)'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    for (const [x, ww] of [[0.18, 22], [0.23, 6], [0.71, 30], [0.77, 8]]) {
      ctx.lineWidth = ww; ctx.beginPath(); ctx.moveTo(x * w, h); ctx.lineTo(x * w + 0.25 * h, 0); ctx.stroke();
    }
  });
  return (
    <group>
      <SetLight sky={on ? '#8be3f0' : '#2a2a6a'} ground="#3b1e72" fill={0.6 + 0.8 * on} key="#e9fbff" keyI={2.4 * on + 0.2} keyPos={[-2.5, 9, 3]}
        target={[0, 0, -0.8]} shadowSize={7} fog="#1b1542" fogNear={9} fogFar={28} bg="#120d2b" />
      <pointLight position={[0, 2.2, 1.0]} color="#7ff0ff" intensity={14 * on + 1} distance={9} decay={1.6} />
      <spotLight position={[-0.6, 4.6, -0.2]} target-position={[-0.6, 0.4, -1.0]} angle={0.42} penumbra={0.7} color="#ffd1f2"
        intensity={60 * (opts.spot === false ? 0 : 1) * (0.25 + 0.75 * on)} distance={9} castShadow />

      {/* ---- the tank: sand, back wall, rocks, life */}
      <Ground size={[11, 6.4]} pos={[0, 0, -1.2]} c={SAND} dunes={0.06} />
      <mesh position={[0, 3.0, -4.3]}><planeGeometry args={[16, 9]} /><meshBasicMaterial map={backdrop} color={new THREE.Color(1, 1, 1).multiplyScalar(1 - 0.88 * dim)} toneMapped={false} fog={false} /></mesh>
      {/* the water surface seen from below + the tank's side walls (a low camera never looks into a void) */}
      <mesh position={[0, 4.3, -1.3]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 6.2]} />
        <meshBasicMaterial map={surface} color={new THREE.Color(1, 1, 1).multiplyScalar(1 - 0.85 * dim)} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {[-5.35, 5.35].map((x) => <RBox key={x} size={[0.3, 4.6, 6.2]} pos={[x, 2.1, -1.3]} r={0.05} c="#2a2357" cast={false} />)}
      {[[-4.2, 0.6, -3.6, 1.6, 1.4, 1.1, 1], [-2.6, 0.4, -3.9, 1.3, 1.0, 0.9, 2], [3.6, 0.7, -3.6, 1.7, 1.6, 1.2, 3], [1.4, 0.35, -3.9, 1.2, 0.8, 0.8, 4],
        [4.6, 0.3, -1.0, 0.9, 0.7, 0.9, 5], [-4.7, 0.3, -0.8, 0.8, 0.6, 0.8, 6], [-0.1, 0.25, -3.6, 0.9, 0.55, 0.7, 7]].map(([x, y, z, sx, sy, sz, s]) => (
        <Rock key={s} pos={[x, y, z]} size={[sx, sy, sz]} seed={s} c={s % 2 ? ROCK : ROCK2} rotY={s} />
      ))}
      {/* throne: a flat rock base, the open clam as backrest, a sea-glass gem */}
      <Rock pos={[-0.6, 0.16, -1.15]} size={[0.95, 0.32, 0.62]} seed={11} c={ROCK} />
      <ShellThrone pos={[-0.6, 0.0, -1.3]} scale={1.15} />
      {opts.cap === 'seat'
        ? <BottleCap pos={[-0.6, 0.48, -1.08]} rot={[0.25, 0.5, -0.1]} scale={1.5} />
        : opts.cap === false ? null : <BottleCap pos={[0.25, 0.42, -1.25]} rot={[0.1, 0.4, -0.25]} scale={1.2} />}
      <Rock pos={[0.25, 0.18, -1.25]} size={[0.28, 0.26, 0.26]} seed={12} c={ROCK2} />
      <ToyCastle pos={[2.6, 0, -1.7]} scale={1.15} rotY={-0.35} />
      {[[-3.6, 2.6, 1, KELP], [-3.2, 3.2, 2, KELP2], [-4.3, 2.2, 3, KELP], [3.3, 2.9, 4, KELP2], [4.1, 2.4, 5, KELP], [-1.9, 1.9, 6, KELP2], [1.2, 2.1, 7, KELP]].map(([x, h, s, c]) => (
        <Kelp key={s as number} pos={[x as number, 0, -2.6 + rnd(s as number) * 0.8]} h={h as number} f={f} seed={s as number} c={c as string} />
      ))}
      {[[-2.4, -1.9, 1, '#ff7eb6', '#ffd0ea'], [1.7, -2.3, 2, '#ffa36b', '#ffe0b0'], [3.4, -0.6, 3, '#c47bff', '#f0d4ff'], [-3.6, -0.3, 4, '#ff6f91', '#ffd3df'], [0.9, -3.2, 5, '#7bdcff', '#e0f8ff']].map(([x, z, s, c, t]) => (
        <Coral key={s as number} pos={[x as number, 0, z as number]} seed={s as number} c={c as string} tip={t as string} scale={1.4} />
      ))}
      <Bubbles pos={[3.9, 0, -2.4]} f={f} n={22} h={4.2} spread={0.2} seed={9} />
      <Bubbles pos={[-1.6, 0, -2.9]} f={f} n={10} h={4.2} spread={0.5} seed={19} size={0.035} />
      <Fish f={f} path={{c: [0.5, 2.6, -2.2], r: [3.2, 0.9], speed: 0.012, phase: 0}} c="#ff9f5a" />
      <Fish f={f} path={{c: [-0.8, 3.1, -1.6], r: [2.6, 1.1], speed: -0.016, phase: 2}} c="#ffd36b" scale={0.18} />
      <Fish f={f} path={{c: [1.2, 1.9, -2.9], r: [2.0, 0.6], speed: 0.02, phase: 4}} c="#7fe0ff" scale={0.16} />
      <Caustics size={[11, 6]} pos={[0, 0.03, -1.2]} f={f} opacity={0.2 * on} />
      <Beam pos={[-0.6, 2.6, -1.0]} len={4.2} r={1.25} c="#ffe1f6" opacity={0.14 * on * (opts.spot === false ? 0 : 1)} />

      {/* ---- glass front + frame + plinth (the frame is an object of the world, not a box around her) */}
      <mesh position={[0, 2.1, 1.6]} renderOrder={9}>
        <planeGeometry args={[10.4, 4.4]} />
        <meshBasicMaterial map={glassTex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <RBox size={[10.8, 0.28, 0.4]} pos={[0, 4.36, 1.6]} r={0.06} c={FRAME} />
      <RBox size={[0.28, 4.6, 0.4]} pos={[-5.3, 2.1, 1.6]} r={0.06} c={FRAME} />
      <RBox size={[0.28, 4.6, 0.4]} pos={[5.3, 2.1, 1.6]} r={0.06} c={FRAME} />
      <RBox size={[10.8, 0.95, 0.5]} pos={[0, -0.45, 1.62]} r={0.05} c="#2b2050" />
      {/* the hall wall around the window (4 strips, the window stays open) */}
      <RBox size={[16, 1.6, 0.3]} pos={[0, 5.3, 1.95]} r={0.02} c={HALL} cast={false} />
      <RBox size={[5, 7.5, 0.3]} pos={[-7.9, 1.6, 1.95]} r={0.02} c={HALL} cast={false} />
      <RBox size={[5, 7.5, 0.3]} pos={[7.9, 1.6, 1.95]} r={0.02} c={HALL} cast={false} />
      <Sign id={`led${led}`} pos={[0, 4.95, 2.13]} size={[4.6, 0.5]} glow frame="#130e26" paint={(ctx, w, h) => {
        ctx.fillStyle = '#0d0920'; ctx.fillRect(0, 0, w, h);
        drawText(ctx, led, w / 2, h / 2, h * 0.62, '#ffcf6b', {maxW: w * 0.92});
      }} />
      {opts.warning !== false ? (
        <Sign id="warn" pos={[2.7, 0.55, 1.62]} size={[0.9, 0.5]} frame="#1b1430" paint={(ctx, w, h) => {
          ctx.fillStyle = '#ffd34d'; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = '#1b1430'; ctx.fillRect(0, 0, w, h * 0.08); ctx.fillRect(0, h * 0.92, w, h * 0.08);
          drawText(ctx, 'DO NOT TAP', w / 2, h * 0.36, h * 0.27, '#1b1430', {maxW: w * 0.9});
          drawText(ctx, 'THE GLASS', w / 2, h * 0.68, h * 0.27, '#1b1430', {maxW: w * 0.9});
        }} />
      ) : null}

      {/* ---- the visitor hall: floor, rope, silhouettes with phones */}
      <mesh position={[0, -0.9, 6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={toon('#2a1d52')}><planeGeometry args={[18, 9]} /></mesh>
      <Stanchions a={[-4.2, -0.9, 2.5]} b={[-1.4, -0.9, 2.5]} />
      <Stanchions a={[1.4, -0.9, 2.5]} b={[4.2, -0.9, 2.5]} />
      {Array.from({length: crowd}, (_, i) => {
        const row = i % 2, x = -5 + ((i * 0.83 + rnd(i) * 0.6) % 10), z = 3.2 + row * 1.1 + rnd(i + 5) * 0.5;
        return <Visitor key={i} pos={[x, -0.9, z]} h={1.55 + rnd(i + 9) * 0.3} c={PEOPLE} seed={i} f={f} phone={rnd(i + 2) < 0.6 ? 1 : 0} flash={flashOf(i)} screen={screen} />;
      })}
    </group>
  );
};

export const AQUARIUM_SIDE = THREE.FrontSide;
