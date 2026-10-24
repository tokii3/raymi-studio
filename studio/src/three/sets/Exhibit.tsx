// SET exhibit - Watch Me idea C "The Exhibit": one museum hall after closing. Her mark is the top of a white plinth
// (mark "plinth", 0.42 m high) in the middle of the hall behind a velvet rope; deep red walls with gold frames (sea
// paintings - built textures, no generated image), a marble floor, a bench, track spots from the ceiling, a "please do
// not touch" sign, a brass plaque on the plinth. The colour script is the place's: gold + deep red + marble, her pale
// blue the accent.
// Options:
//   dark: 0..1 | dark_at: [[t, v]] + dark_s   the museum lights go out - only her own light (and the exit sign) stays
//   hers: true          every painting in the hall shows her colours (the frames became hers)
//   plaque: "text"      the plinth's plaque ("RAYMI, 2026 - deep sea")
//   crossed: t          her tail strikes a pink line through DO NOT TOUCH (drawn over 8 frames)
//   visitors: n         fish-shaped visitors at the rope (parts Visitor silhouettes, phones up)
//   stage / fish / salmon / props   three/staging.tsx, creatures.tsx
import React from 'react';
import * as THREE from 'three';
import {Beam, RBox, Sign, Visitor, drawText} from '../parts';
import {SetLight, canvasTexture, rnd, runTo, toon, toonSurface} from '../look';
import {DeepLife} from '../creatures';
import {Stagings} from '../staging';
import type {SetProps} from './index';

const num = (v: unknown, d = 0) => (typeof v === 'number' ? v : d);
export const PLINTH = 0.42;

function painting(i: number, hers: boolean): THREE.CanvasTexture {
  return canvasTexture(`ex_paint${i}${hers}`, 256, 320, (ctx, w, h) => {
    const pal = hers ? ['#bcd6ff', '#7f9fd8', '#ff3d7f', '#1b1840', '#e8f3ff'] : ['#2b5a6a', '#d8c08a', '#6a3a2a', '#1a2a3a', '#a8b8a0'];
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, pal[0]); g.addColorStop(1, pal[3]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // a sea motif per painting: waves, a ray's diamond silhouette, a moon, a school of fish
    ctx.globalAlpha = 0.85;
    if (i % 4 === 0) { for (let k = 0; k < 5; k++) { ctx.strokeStyle = pal[4]; ctx.lineWidth = 6; ctx.beginPath(); for (let x = 0; x <= w; x += 8) ctx.lineTo(x, h * (0.45 + k * 0.1) + 10 * Math.sin(x / 20 + k)); ctx.stroke(); } }
    if (i % 4 === 1) { ctx.fillStyle = pal[2]; ctx.beginPath(); ctx.moveTo(w / 2, h * 0.2); ctx.lineTo(w * 0.85, h * 0.5); ctx.lineTo(w / 2, h * 0.62); ctx.lineTo(w * 0.15, h * 0.5); ctx.closePath(); ctx.fill(); ctx.fillRect(w / 2 - 3, h * 0.6, 6, h * 0.3); }
    if (i % 4 === 2) { ctx.fillStyle = pal[4]; ctx.beginPath(); ctx.arc(w * 0.65, h * 0.3, w * 0.16, 0, 7); ctx.fill(); }
    if (i % 4 === 3) { ctx.fillStyle = pal[1]; for (let k = 0; k < 14; k++) { ctx.beginPath(); ctx.ellipse(w * rnd(k + i), h * rnd(k * 3 + i), 14, 6, 0.3, 0, 7); ctx.fill(); } }
    ctx.globalAlpha = 1;
  });
}

export const Exhibit: React.FC<SetProps> = ({f, fps, opts, camPos}) => {
  const dark = Math.max(0, Math.min(1, runTo(num(opts.dark), opts.dark_at, num(opts.dark_s, 0.3), f)));
  const on = 1 - dark;
  // blackout: the set's whole light goes, not only its lamps (boards run 1: 'dark' left her lit as by day)
  const dim = 0.16 + 0.84 * on;   // blackout: the place stays readable (look-critic boards 1: 'a black void')
  const dimC = (c: string) => new THREE.Color(c).lerp(new THREE.Color('#010103'), dark).getStyle();
  const hers = Boolean(opts.hers);
  const marble = toonSurface('#e9e2d6', 'plaster', [6, 6]);
  const wallMat = toonSurface('#5a1424', 'fabric', [8, 3]);
  const spots = React.useMemo(() => [0, 1, 2].map(() => { const l = new THREE.SpotLight('#ffe2b0', 0, 9, 0.38, 0.6, 1.3); l.castShadow = true; l.shadow.mapSize.set(1024, 1024); return l; }), []);
  const spotPos: [number, number, number][] = [[0, 4.4, 0.8], [-3.2, 4.4, -2.6], [3.2, 4.4, -2.6]];
  const spotAim: [number, number, number][] = [[0, 1.2, 0], [-3.2, 1.9, -4.3], [3.2, 1.9, -4.3]];
  spots.forEach((l, i) => { l.intensity = (i === 0 ? 30 : 16) * on; l.position.set(...spotPos[i]); l.target.position.set(...spotAim[i]); });
  const frames = [[-3.2, -4.32, 0, 1.4, 1.8], [3.2, -4.32, 0, 1.4, 1.8], [0, -4.32, 0, 1.0, 1.3], [-5.3, -1.5, Math.PI / 2, 1.2, 1.5], [5.3, -1.5, -Math.PI / 2, 1.2, 1.5], [-5.3, 1.6, Math.PI / 2, 0.9, 1.2], [5.3, 1.6, -Math.PI / 2, 0.9, 1.2]];
  return (
    <group>
      <SetLight sky="#4a2a2a" ground="#1a0e10" fill={0.65 * dim} key="#ffe6c0" keyI={0.7 * dim} keyPos={[2, 7, 4]} target={[0, 0, 0]}
        shadowSize={7} fog={dimC('#120609')} fogNear={9} fogFar={28} bg={dimC('#120609')} depth={num(opts.depth, 0.8)} />
      {spots.map((l, i) => <React.Fragment key={i}><primitive object={l} /><primitive object={l.target} /></React.Fragment>)}
      {/* marble floor (checker of two marbles), walls, ceiling */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={marble} receiveShadow><planeGeometry args={[11, 10]} /></mesh>
      {Array.from({length: 40}, (_, i) => (i + Math.floor(i / 8)) % 2 ? null : (
        <mesh key={`tile${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-4.4 + (i % 8) * 1.25, 0.002, -4.4 + Math.floor(i / 8) * 1.25 + 2.5]}>
          <planeGeometry args={[1.25, 1.25]} /><meshToonMaterial color="#c9bfae" /></mesh>
      ))}
      <mesh position={[0, 2.6, -4.5]} material={wallMat} receiveShadow><boxGeometry args={[11, 5.2, 0.2]} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * 5.5, 2.6, 0]} material={wallMat} receiveShadow><boxGeometry args={[0.2, 5.2, 10]} /></mesh>)}
      <mesh position={[0, 5.2, 0]} material={toon('#2a1416')}><boxGeometry args={[11, 0.1, 10]} /></mesh>
      <RBox size={[11, 0.18, 0.08]} pos={[0, 0.09, -4.38]} r={0.02} c="#d9a441" />
      {/* the track spots and their beams */}
      <RBox size={[0.06, 0.06, 6]} pos={[0, 4.6, -1.5]} r={0.02} c="#1a1012" />
      {spotPos.map((p, i) => <mesh key={i} position={p} material={toon('#1a1012')}><cylinderGeometry args={[0.07, 0.1, 0.22, 12]} /></mesh>)}
      {on > 0.05 ? <Beam pos={[0, 2.8, 0.4]} rot={[-0.12, 0, 0]} len={3.4} r={0.9} c="#ffe2b0" opacity={0.06 * on} /> : null}
      {/* the gold frames on the walls */}
      {frames.map(([x, z, ry, w, h], i) => (
        <group key={`fr${i}`} position={[x, 2.2, z + (ry === 0 ? 0.12 : 0)]} rotation={[0, ry, 0]}>
          <RBox size={[w + 0.24, h + 0.24, 0.1]} pos={[0, 0, 0]} r={0.03} c="#d9a441" />
          <mesh position={[0, 0, 0.056]}><planeGeometry args={[w, h]} /><meshToonMaterial map={painting(i, hers)} /></mesh>
        </group>
      ))}
      {/* the plinth (her mark on top), its plaque, the velvet rope in front */}
      <RBox size={[0.95, PLINTH, 0.95]} pos={[0, PLINTH / 2, 0]} r={0.02} c="#f2efe8" t="plaster" />
      <Sign pos={[0, PLINTH * 0.55, 0.48]} size={[0.5, 0.15]} id={`ex_plaque${opts.plaque ?? ''}`}
        paint={(ctx, w, h) => { ctx.fillStyle = '#c8a25a'; ctx.fillRect(0, 0, w, h); drawText(ctx, String(opts.plaque ?? 'RAYMI, 2026 - deep sea'), w / 2, h / 2, h * 0.4, '#2a1a08', {maxW: w * 0.9}); }} />
      {[-1.1, 1.1].map((x) => (
        <group key={x} position={[x, 0, 1.25]}>
          <mesh position={[0, 0.48, 0]} material={toon('#d9a441')}><cylinderGeometry args={[0.03, 0.03, 0.96, 10]} /></mesh>
          <mesh position={[0, 0.03, 0]} material={toon('#d9a441')}><cylinderGeometry args={[0.16, 0.18, 0.06, 16]} /></mesh>
          <mesh position={[0, 0.98, 0]} material={toon('#d9a441')}><sphereGeometry args={[0.05, 10, 8]} /></mesh>
        </group>
      ))}
      <mesh position={[0, 0.82, 1.25]} rotation={[0, 0, Math.PI]}><torusGeometry args={[1.1, 0.025, 8, 24, Math.PI]} /><meshToonMaterial color="#8a1430" /></mesh>
      <Sign pos={[1.45, 0.85, 1.2]} rot={[0, -0.3, 0]} size={[0.42, 0.28]} id="ex_dont"
        paint={(ctx, w, h) => { ctx.fillStyle = '#f2ede2'; ctx.fillRect(0, 0, w, h); drawText(ctx, 'PLEASE', w / 2, h * 0.32, h * 0.26, '#3a1a1a'); drawText(ctx, 'DO NOT TOUCH', w / 2, h * 0.68, h * 0.22, '#3a1a1a', {maxW: w * 0.9}); }} />
      {typeof opts.crossed === 'number' && f >= opts.crossed ? (
        <mesh position={[1.45 - 0.2 * (1 - Math.min(1, (f - opts.crossed) / 8)) * 0.5, 0.85, 1.215]} rotation={[0, -0.3, 0.32]} renderOrder={4}>
          <planeGeometry args={[0.46 * Math.min(1, (f - opts.crossed) / 8), 0.035]} /><meshBasicMaterial color="#ff3d7f" toneMapped={false} /></mesh>
      ) : null}
      <mesh position={[1.45, 0.42, 1.2]} material={toon('#d9a441')}><cylinderGeometry args={[0.02, 0.02, 0.84, 8]} /></mesh>
      {/* a bench to the side, the exit sign (the one light that stays on) */}
      <RBox size={[1.6, 0.08, 0.5]} pos={[-3.4, 0.45, 0.8]} r={0.02} c="#3a2418" t="wood" />
      {[-0.7, 0.7].map((x) => <RBox key={x} size={[0.08, 0.45, 0.45]} pos={[-3.4 + x, 0.22, 0.8]} r={0.01} c="#1a1012" />)}
      <Sign pos={[4.2, 3.6, -4.38]} size={[0.6, 0.22]} id="ex_exit" glow
        paint={(ctx, w, h) => { ctx.fillStyle = '#0f6a3a'; ctx.fillRect(0, 0, w, h); drawText(ctx, 'EXIT', w / 2, h / 2, h * 0.6, '#d8ffe8'); }} />
      {Array.from({length: num(opts.visitors)}, (_, i) => (
        <Visitor key={i} pos={[(i % 2 ? 1 : -1) * (1.6 + 0.5 * Math.floor(i / 2)), 0, 2.0 + rnd(i) * 0.6]} c={['#3a5a8a', '#6a3a5a', '#2a6a6a', '#5a4a2a'][i % 4]}
          seed={i + 3} phone={1} f={f} flash={Math.floor(f / 11 + i * 3) % 9 === 0 ? 1 : 0} look={i % 2 ? -0.6 : 0.6} />
      ))}
      <DeepLife opts={opts} f={f} fps={fps} camPos={camPos} />
      <Stagings opts={opts} f={f} camPos={camPos} />
    </group>
  );
};
