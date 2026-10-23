// Set dressing (toki 2026-10-23: "Szenen wirken leer und lieblos, ohne Details"): the small things that make a place
// lived-in, built once for every later video. All seeded (rnd) so a desk row is varied but identical on every worker.
//   DeskClutter  - what lies on a working desk: keyboard, mouse, mug, pen cup, paper stacks, sticky notes, a plant, cables
//   OfficeWall   - notice board with pinned papers, a wall clock, a poster, a vent
//   FilingCabinet, WaterCooler, CoatRack, Plant (floor), Blinds
//   RoomClutter  - her room: fairy lights, posters, books, a shell jar, clothes on a chair, a rug, plushies
//   Coral, Kelp  - the dream's reef pieces (soft, glowing tips)
import React from 'react';
import * as THREE from 'three';
import {RBox, drawText} from './parts';
import {canvasTexture, rnd, toon, toonSurface} from './look';

type P3 = [number, number, number];

const Mug: React.FC<{pos: P3; c: string; seed: number}> = ({pos, c, seed}) => (
  <group position={pos} rotation={[0, rnd(seed) * 6, 0]}>
    <mesh material={toon(c)} castShadow><cylinderGeometry args={[0.04, 0.036, 0.095, 16]} /></mesh>
    <mesh position={[0, 0.046, 0]} material={toon('#3a2a24')}><cylinderGeometry args={[0.035, 0.035, 0.004, 16]} /></mesh>
    <mesh position={[0.045, 0.005, 0]} rotation={[0, 0, Math.PI / 2]} material={toon(c)}><torusGeometry args={[0.025, 0.007, 6, 12, Math.PI]} /></mesh>
  </group>
);

const PenCup: React.FC<{pos: P3; seed: number}> = ({pos, seed}) => (
  <group position={pos}>
    <mesh material={toonSurface('#5a5e74', 'metal')} castShadow><cylinderGeometry args={[0.032, 0.032, 0.09, 12]} /></mesh>
    {[0, 1, 2, 3].map((k) => (
      <mesh key={k} position={[0.012 * Math.cos(k * 1.7 + seed), 0.07, 0.012 * Math.sin(k * 1.7 + seed)]} rotation={[0.2 * Math.sin(k + seed), 0, 0.2 * Math.cos(k * 2 + seed)]}
        material={toon(['#e0533c', '#2f6fd0', '#1a1a24', '#f2c94c'][k])}><cylinderGeometry args={[0.004, 0.004, 0.13, 6]} /></mesh>
    ))}
  </group>
);

const Papers: React.FC<{pos: P3; n: number; seed: number; rotY?: number}> = ({pos, n, seed, rotY = 0}) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    {Array.from({length: n}, (_, k) => (
      <mesh key={k} position={[0.006 * Math.sin(k * 3 + seed), 0.002 + k * 0.0025, 0.006 * Math.cos(k * 2 + seed)]} rotation={[-Math.PI / 2, 0, 0.12 * Math.sin(k * 1.9 + seed)]}
        material={toonSurface(k % 4 === 3 ? '#f4e8c8' : '#f6f5f0', 'paper')} receiveShadow><planeGeometry args={[0.21, 0.297]} /></mesh>
    ))}
  </group>
);

const Plant: React.FC<{pos: P3; scale?: number; seed: number}> = ({pos, scale = 1, seed}) => (
  <group position={pos} scale={scale}>
    <mesh position={[0, 0.06, 0]} material={toon('#c86a4a')} castShadow><cylinderGeometry args={[0.06, 0.045, 0.12, 14]} /></mesh>
    <mesh position={[0, 0.12, 0]} material={toon('#3a2a24')}><cylinderGeometry args={[0.055, 0.055, 0.01, 14]} /></mesh>
    {Array.from({length: 9}, (_, k) => {
      const a = (k / 9) * Math.PI * 2 + seed;
      return <mesh key={k} position={[Math.cos(a) * 0.04, 0.2 + 0.05 * rnd(seed + k), Math.sin(a) * 0.04]} rotation={[Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7]}
        material={toon(k % 2 ? '#3f8f5a' : '#57a86c', '#000', 1, {side: THREE.DoubleSide})} castShadow><planeGeometry args={[0.05, 0.18]} /></mesh>;
    })}
  </group>
);

const Keyboard: React.FC<{pos: P3}> = ({pos}) => (
  <group position={pos}>
    <RBox size={[0.42, 0.018, 0.14]} r={0.006} c="#2c2f3e" />
    {Array.from({length: 4}, (_, r) => <mesh key={r} position={[0, 0.011, -0.045 + r * 0.03]} material={toon('#4a4e62')}><boxGeometry args={[0.38, 0.006, 0.022]} /></mesh>)}
    <mesh position={[0.3, 0.008, 0.02]} material={toon('#2c2f3e')} scale={[1, 0.5, 1.4]} castShadow><sphereGeometry args={[0.03, 12, 8]} /></mesh>
  </group>
);

const Cable: React.FC<{a: P3; b: P3; c?: string}> = ({a, b, c = '#1a1a24'}) => {
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(...a), new THREE.Vector3((a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 0.1, (a[2] + b[2]) / 2), new THREE.Vector3(...b)]);
  return <mesh geometry={new THREE.TubeGeometry(curve, 16, 0.005, 5, false)} material={toon(c)} />;
};

/** Everything on one working desk (top at y 0.765, the user on the -z side unless flip). seed varies it. */
export const DeskClutter: React.FC<{pos: P3; rotY?: number; seed: number; monitorGlow?: boolean}> = ({pos, rotY = 0, seed, monitorGlow = true}) => {
  const y = 0.768;
  const has = (k: number, p: number) => rnd(seed * 7.3 + k) < p;
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <Keyboard pos={[0, y + 0.009, -0.12]} />
      {has(1, 0.8) ? <Mug pos={[0.45 + 0.1 * rnd(seed), y + 0.048, -0.05]} c={['#e85a7a', '#f2efe6', '#4f7ad0', '#f2c94c'][Math.floor(rnd(seed + 2) * 4)]} seed={seed} /> : null}
      {has(2, 0.7) ? <PenCup pos={[-0.5, y + 0.045, 0.12]} seed={seed} /> : null}
      <Papers pos={[-0.35 + 0.1 * rnd(seed + 3), y, -0.05]} n={2 + Math.floor(rnd(seed + 4) * 9)} seed={seed} rotY={0.3 * rnd(seed + 5)} />
      {has(3, 0.5) ? <Plant pos={[0.55, y, 0.22]} seed={seed} /> : null}
      {has(4, 0.7) ? Array.from({length: 1 + Math.floor(rnd(seed + 6) * 4)}, (_, k) => (
        <mesh key={`st${k}`} position={[-0.15 + k * 0.035, 1.02 + 0.02 * k, 0.12]} rotation={[0, Math.PI, 0.1 * Math.sin(k + seed)]}>
          <planeGeometry args={[0.05, 0.05]} /><meshToonMaterial color={['#ffe066', '#ff9ab5', '#9bf0ff'][k % 3]} side={THREE.DoubleSide} /></mesh>
      )) : null}
      <Cable a={[0.1, y + 0.01, 0.2]} b={[0.25, 0.05, 0.38]} />
      {monitorGlow ? <pointLight position={[0, 1.05, 0.0]} color="#8fb0ff" intensity={0.6} distance={1.4} decay={2} /> : null}
    </group>
  );
};

const noticeTex = () => canvasTexture('noticeboard', 512, 360, (ctx, w, h) => {
  ctx.fillStyle = '#b98b5a'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 1600; i++) { ctx.fillStyle = `rgba(80,50,20,${0.15 + 0.2 * rnd(i)})`; ctx.fillRect(rnd(i * 2) * w, rnd(i * 3) * h, 2, 2); }
  const notes = ['MEETING 9:00', 'TPS REPORTS', 'SMILE :)', 'NO FISH IN THE FRIDGE', 'Q3 TARGETS', 'OVERTIME', 'DEADLINE FRI'];
  notes.forEach((t, i) => {
    const x = 30 + (i % 4) * 120 + 10 * rnd(i), y = 30 + Math.floor(i / 4) * 160 + 10 * rnd(i + 5);
    ctx.save(); ctx.translate(x + 50, y + 60); ctx.rotate((rnd(i + 9) - 0.5) * 0.2);
    ctx.fillStyle = i % 3 === 0 ? '#ffe066' : '#f6f5f0'; ctx.fillRect(-50, -60, 100, 120);
    ctx.fillStyle = 'rgba(40,40,60,0.55)'; for (let l = 0; l < 6; l++) ctx.fillRect(-38, -20 + l * 12, 60 + 16 * rnd(i * 4 + l), 3);
    drawText(ctx, t, 0, -42, 13, '#222236', {maxW: 90});
    ctx.fillStyle = ['#e0533c', '#2f6fd0', '#3f8f5a'][i % 3]; ctx.beginPath(); ctx.arc(0, -56, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
});

/** A section of office wall dressing: notice board, a wall clock (06:00), a motivational poster, an air vent. */
export const OfficeWall: React.FC<{pos: P3; rotY?: number}> = ({pos, rotY = 0}) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <RBox size={[1.5, 1.05, 0.04]} pos={[0, 1.6, 0]} r={0.02} c="#6b4a2c" />
    <mesh position={[0, 1.6, 0.025]}><planeGeometry args={[1.42, 0.97]} /><meshToonMaterial map={noticeTex()} /></mesh>
    <group position={[1.3, 2.35, 0.03]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={toon('#2a2c38')}><cylinderGeometry args={[0.17, 0.17, 0.04, 28]} /></mesh>
      <mesh position={[0, 0, 0.021]}><circleGeometry args={[0.15, 28]} /><meshBasicMaterial color="#f6f2e6" toneMapped={false} /></mesh>
      <mesh position={[0, 0.05, 0.025]} material={toon('#1a1a24')}><boxGeometry args={[0.01, 0.1, 0.004]} /></mesh>
      <mesh position={[0, -0.06, 0.025]} material={toon('#1a1a24')}><boxGeometry args={[0.008, 0.13, 0.004]} /></mesh>
    </group>
    <mesh position={[-1.35, 1.75, 0.03]}><planeGeometry args={[0.6, 0.8]} /><meshToonMaterial map={canvasTexture('poster_teamwork', 300, 400, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a4a7a'); g.addColorStop(1, '#1a2240'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#f2c94c'; ctx.beginPath(); ctx.moveTo(w * 0.2, h * 0.65); ctx.lineTo(w * 0.5, h * 0.25); ctx.lineTo(w * 0.8, h * 0.65); ctx.fill();
      drawText(ctx, 'TEAMWORK', w / 2, h * 0.8, 40, '#f6f2e6', {maxW: w * 0.85}); ctx.strokeStyle = '#f6f2e6'; ctx.lineWidth = 8; ctx.strokeRect(6, 6, w - 12, h - 12);
    })} /></mesh>
    <RBox size={[0.5, 0.18, 0.03]} pos={[0.2, 3.1, 0]} r={0.01} c="#9aa0b4" t="metal" />
    {Array.from({length: 5}, (_, k) => <mesh key={k} position={[0.02 + k * 0.09, 3.1, 0.017]} material={toon('#3a3d4c')}><boxGeometry args={[0.06, 0.14, 0.004]} /></mesh>)}
  </group>
);

export const FilingCabinet: React.FC<{pos: P3; rotY?: number}> = ({pos, rotY = 0}) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <RBox size={[0.48, 1.3, 0.6]} pos={[0, 0.65, 0]} r={0.02} c="#8a8fa3" t="metal" />
    {[0, 1, 2, 3].map((k) => (
      <group key={k} position={[0, 0.2 + k * 0.3, 0.302]}>
        <mesh material={toon('#7a7f93')}><boxGeometry args={[0.44, 0.26, 0.006]} /></mesh>
        <mesh position={[0, 0.06, 0.008]} material={toon('#d0d3dd')}><boxGeometry args={[0.14, 0.02, 0.012]} /></mesh>
        <mesh position={[0, -0.03, 0.006]}><planeGeometry args={[0.1, 0.035]} /><meshBasicMaterial color="#f6f5f0" toneMapped={false} /></mesh>
      </group>
    ))}
    <Papers pos={[0, 1.302, 0]} n={4} seed={pos[0] * 13} />
  </group>
);

export const WaterCooler: React.FC<{pos: P3}> = ({pos}) => (
  <group position={pos}>
    <RBox size={[0.34, 1.0, 0.34]} pos={[0, 0.5, 0]} r={0.03} c="#e6e8ee" />
    <mesh position={[0, 1.22, 0]} material={toon('#9fd8ff', '#3a7aff', 0.15, {opacity: 0.75})}><cylinderGeometry args={[0.14, 0.14, 0.42, 20]} /></mesh>
    <mesh position={[0.1, 0.75, 0.17]} material={toon('#2f6fd0')}><boxGeometry args={[0.03, 0.04, 0.04]} /></mesh>
    <mesh position={[-0.1, 0.75, 0.17]} material={toon('#e0533c')}><boxGeometry args={[0.03, 0.04, 0.04]} /></mesh>
  </group>
);

export const FloorPlant: React.FC<{pos: P3; seed: number}> = ({pos, seed}) => <Plant pos={pos} scale={4.2} seed={seed} />;

export const CoatRack: React.FC<{pos: P3}> = ({pos}) => (
  <group position={pos}>
    <mesh position={[0, 0.9, 0]} material={toon('#3a2a24')}><cylinderGeometry args={[0.025, 0.03, 1.8, 10]} /></mesh>
    {[0, 1, 2].map((k) => <mesh key={k} position={[0.12 * Math.cos(k * 2.1), 0.03, 0.12 * Math.sin(k * 2.1)]} rotation={[0, -k * 2.1, Math.PI / 2.4]} material={toon('#3a2a24')}><cylinderGeometry args={[0.012, 0.012, 0.3, 6]} /></mesh>)}
    <mesh position={[0.1, 1.45, 0]} material={toonSurface('#4a5a7a', 'fabric')} scale={[1, 1.5, 0.5]} castShadow><sphereGeometry args={[0.16, 12, 10]} /></mesh>
    <mesh position={[-0.08, 1.55, 0.05]} material={toonSurface('#c86a4a', 'fabric')} scale={[0.8, 1.1, 0.4]} castShadow><sphereGeometry args={[0.13, 12, 10]} /></mesh>
  </group>
);

/** Her room: fairy lights along the dome rib, posters, a book stack, a shell jar, clothes on a chair, a rug, plushies. */
export const RoomClutter: React.FC<{f: number}> = ({f}) => (
  <group>
    {/* fairy lights draped in an arc over the bed head */}
    {Array.from({length: 22}, (_, k) => {
      const t = k / 21, x = -1.6 + t * 3.2, y = 2.4 - 0.35 * Math.sin(Math.PI * t), z = -2.6 + 0.4 * Math.sin(Math.PI * t);
      return <mesh key={`fl${k}`} position={[x, y, z]}><sphereGeometry args={[0.025, 8, 6]} />
        <meshBasicMaterial color={['#ffd98a', '#ff9ab5', '#9bf0ff', '#c9a6ff'][k % 4]} toneMapped={false} /></mesh>;
    })}
    <pointLight position={[0, 2.2, -2.3]} color="#ffcf9a" intensity={2.2} distance={4} decay={1.6} />
    {/* posters on the dome wall: a ray silhouette + a game cover */}
    {[[-2.2, 1.6, -2.9, 0.35, '#5a3aa8', 'RAYS'], [2.4, 1.5, -2.6, -0.5, '#e05a7a', 'LV 99']].map(([x, y, z, r, c, t], i) => (
      <mesh key={`po${i}`} position={[x as number, y as number, z as number]} rotation={[0, r as number, 0]}><planeGeometry args={[0.6, 0.85]} />
        <meshToonMaterial map={canvasTexture(`roomposter${i}`, 300, 420, (ctx, w, h) => {
          ctx.fillStyle = c as string; ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.2); ctx.lineTo(w * 0.85, h * 0.45); ctx.lineTo(w * 0.5, h * 0.62); ctx.lineTo(w * 0.15, h * 0.45); ctx.fill();
          drawText(ctx, t as string, w / 2, h * 0.82, 52, '#ffffff', {maxW: w * 0.8});
        })} /></mesh>
    ))}
    {/* a book stack, a shell jar and a plush on the floor by the nightstand */}
    {Array.from({length: 6}, (_, k) => <RBox key={`bk${k}`} size={[0.24, 0.045, 0.17]} pos={[1.35, 0.025 + k * 0.047, -0.4]} rot={[0, 0.15 * Math.sin(k * 2), 0]} r={0.008} c={['#5a3aa8', '#e05a7a', '#3f8f8a', '#f2c94c', '#2f6fd0', '#c86a4a'][k]} />)}
    <mesh position={[1.4, 0.35, -0.4]} material={toon('#bfe6f0', '#000', 1, {opacity: 0.55})}><cylinderGeometry args={[0.07, 0.07, 0.16, 16]} /></mesh>
    {Array.from({length: 7}, (_, k) => <mesh key={`sh${k}`} position={[1.4 + 0.03 * Math.cos(k * 2), 0.3 + 0.02 * k, -0.4 + 0.03 * Math.sin(k * 2)]}><sphereGeometry args={[0.015, 8, 6]} /><meshToonMaterial color={['#f3d6b0', '#f1c7d8', '#ffffff'][k % 3]} /></mesh>)}
    {/* clothes thrown over the chair-like stool, a rug */}
    <mesh position={[-1.4, 0.45, 0.5]} material={toonSurface('#4a5a9a', 'fabric')} scale={[1.2, 0.4, 0.9]} castShadow><sphereGeometry args={[0.22, 14, 10]} /></mesh>
    <RBox size={[0.4, 0.4, 0.4]} pos={[-1.4, 0.2, 0.5]} r={0.05} c="#a58fc2" t="wood" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.1, 0.006, 1.1]} material={toonSurface('#c9a6ff', 'carpet', [3, 2])} receiveShadow><circleGeometry args={[0.6, 28]} /></mesh>
    <mesh position={[0.3, 0.6, -0.85]} material={toonSurface('#8f86e8', 'plush')} scale={[1, 0.3, 0.8]} castShadow><sphereGeometry args={[0.16, 8, 6]} /></mesh>
    {void f}
  </group>
);

/** A soft coral branch with glowing tips (the dream's reef around the pile). */
export const Coral: React.FC<{pos: P3; seed: number; c?: string; glow?: string}> = ({pos, seed, c = '#ff9ab5', glow = '#ffd9ff'}) => (
  <group position={pos} rotation={[0, rnd(seed) * 6, 0]}>
    {Array.from({length: 6}, (_, k) => {
      const a = (k / 6) * Math.PI * 2 + seed, tilt = 0.3 + 0.3 * rnd(seed + k);
      const h = 0.3 + 0.35 * rnd(seed * 3 + k);
      return (
        <group key={k} rotation={[Math.sin(a) * tilt, 0, Math.cos(a) * tilt]}>
          <mesh position={[0, h / 2, 0]} material={toonSurface(c, 'plush')} castShadow><cylinderGeometry args={[0.025, 0.045, h, 8]} /></mesh>
          <mesh position={[0, h, 0]}><sphereGeometry args={[0.04, 10, 8]} /><meshBasicMaterial color={glow} toneMapped={false} /></mesh>
        </group>
      );
    })}
  </group>
);
