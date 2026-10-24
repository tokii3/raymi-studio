// SET corner - Watch Me idea B "The Corner": one street corner at night under one streetlamp. Her mark is the lamp's
// light circle on the sidewalk (origin); the sidewalk runs along x, the road (12 cm lower) starts at z = 1.6 with a
// zebra crossing running away from the lens (her catwalk, mark "crossing"); behind her a building front at z = -3.2:
// a TV shop window, a door, a neon fish, a billboard frame high above; a newsstand to her right, a bus-stop poster to
// her left; the city falls away into dark blue fog. The colour script is the place's own: cold blue night, one warm lamp
// (her), neon accents. Under the sea: a few bubbles rise from the drain and fish pass high above.
// Options:
//   dark: 0..1 | dark_at: [[t, v]] + dark_s   the city blacks out (lamp, windows, TV, neon) - only her own light stays
//   lamp: 0..1         the lamp's own strength (1)
//   tv: "text"         what the TV window shows ("BREAKING NEWS")
//   billboard: "text"  the billboard above the shop (empty paper without it)
//   covers: true       the newsstand's magazines show her colour (the covers flipped to her)
//   stage / fish / salmon / props   three/staging.tsx, creatures.tsx
import React from 'react';
import * as THREE from 'three';
import {Beam, RBox, Sign, drawText} from '../parts';
import {SetLight, blobTexture, canvasTexture, rnd, runTo, toon, toonSurface} from '../look';
import {DeepLife} from '../creatures';
import {Stagings} from '../staging';
import type {SetProps} from './index';

const num = (v: unknown, d = 0) => (typeof v === 'number' ? v : d);

const ROAD_Z = 1.6;

export const Corner: React.FC<SetProps> = ({f, fps, opts, camPos}) => {
  const dark = Math.max(0, Math.min(1, runTo(num(opts.dark), opts.dark_at, num(opts.dark_s, 0.25), f)));
  const on = 1 - dark;
  // blackout: the set's whole light goes, not only its lamps (boards run 1: 'dark' left her lit as by day)
  const dim = 0.1 + 0.9 * on;
  const dimC = (c: string) => new THREE.Color(c).lerp(new THREE.Color('#010103'), dark).getStyle();
  const lamp = num(opts.lamp, 1) * on;
  const lampC = '#ffc98a';
  const night = '#0a1030';
  // flicker: the old lamp breathes a little (never a strobe)
  const breathe = 0.94 + 0.06 * Math.sin(f / 23) * Math.sin(f / 7.3);
  const spot = React.useMemo(() => {
    const l = new THREE.SpotLight(lampC, 0, 9, 0.62, 0.55, 1.4);
    l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.0006;
    return l;
  }, []);
  spot.intensity = 26 * lamp * breathe;
  spot.position.set(-0.35, 4.05, -0.35);
  spot.target.position.set(0.1, 0, 0.2);
  const tvText = typeof opts.tv === 'string' ? opts.tv : 'BREAKING NEWS';
  const tv = canvasTexture(`corner_tv${tvText}`, 512, 300, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1d4cff'); g.addColorStop(1, '#0a1a6a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ff2d55'; ctx.fillRect(0, h * 0.68, w, h * 0.2);
    drawText(ctx, tvText, w / 2, h * 0.78, h * 0.13, '#ffffff', {maxW: w * 0.9});
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1);                     // scan lines
  });
  const wall = toonSurface('#3a3550', 'plaster', [6, 2]);
  const brick = toonSurface('#4a2f3a', 'plaster', [8, 4]);
  const walk = toonSurface('#4b4e63', 'plaster', [10, 6]);
  const road = toonSurface('#20222f', 'rubber', [10, 8]);
  return (
    <group>
      <SetLight sky="#25336e" ground="#140f22" fill={0.75 * dim} key="#8fa8ff" keyI={0.9 * dim} keyPos={[-6, 9, 6]} target={[0, 0, 0]}
        shadowSize={7} fog={dimC(night)} fogNear={9} fogFar={34} bg={dimC(night)} depth={num(opts.depth, 0.8)} />
      <primitive object={spot} />
      <primitive object={spot.target} />
      {/* the ground: sidewalk slabs (her level, y 0), the curb, the road 12 cm lower with the zebra crossing */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]} material={walk} receiveShadow><planeGeometry args={[18, 5.2]} /></mesh>
      {Array.from({length: 17}, (_, i) => (
        <mesh key={`seam${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-8 + i, 0.002, -1]}>
          <planeGeometry args={[0.015, 5.2]} /><meshBasicMaterial color="#2a2c3c" toneMapped={false} /></mesh>
      ))}
      <RBox size={[18, 0.14, 0.22]} pos={[0, -0.05, ROAD_Z]} r={0.02} c="#6a6c80" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, ROAD_Z + 6]} material={road} receiveShadow><planeGeometry args={[30, 12]} /></mesh>
      {Array.from({length: 7}, (_, i) => (
        <mesh key={`zebra${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-1.5 + i * 0.5, -0.118, ROAD_Z + 3.2]} receiveShadow>
          <planeGeometry args={[0.32, 5.6]} /><meshToonMaterial color="#d9dbe6" /></mesh>
      ))}
      {/* puddles: dark mirrors catching the lamp and the neon */}
      {[[1.4, -0.5, 0.5], [-1.8, 0.4, 0.35], [2.6, ROAD_Z + 1.2, 0.6]].map(([x, z, r], i) => (
        <mesh key={`pud${i}`} rotation={[-Math.PI / 2, 0, rnd(i) * 3]} position={[x, z > ROAD_Z ? -0.115 : 0.004, z]} scale={[1, 0.55, 1]}>
          <circleGeometry args={[r, 24]} /><meshBasicMaterial color={new THREE.Color('#1a2350').lerp(new THREE.Color(lampC), 0.18 * lamp)} toneMapped={false} /></mesh>
      ))}
      {/* the streetlamp: pole, arm over her, the lamp head; its light circle on the sidewalk (her stage) */}
      <group position={[-1.1, 0, -0.7]}>
        <mesh position={[0, 2.1, 0]} material={toon('#26283a')} castShadow><cylinderGeometry args={[0.055, 0.08, 4.2, 12]} /></mesh>
        <mesh position={[0, 0.25, 0]} material={toon('#26283a')}><cylinderGeometry args={[0.12, 0.14, 0.5, 12]} /></mesh>
        <mesh position={[0.4, 4.15, 0.18]} rotation={[0, -0.42, Math.PI / 2 - 0.12]} material={toon('#26283a')}><cylinderGeometry args={[0.035, 0.035, 0.95, 8]} /></mesh>
        <mesh position={[0.78, 4.1, 0.36]} material={toon('#1c1d2a')}><coneGeometry args={[0.24, 0.22, 16, 1, true]} /></mesh>
        <mesh position={[0.78, 4.0, 0.36]}><sphereGeometry args={[0.1, 12, 8]} /><meshBasicMaterial color={lamp > 0.05 ? lampC : '#3a3450'} toneMapped={false} /></mesh>
      </group>
      {lamp > 0.02 ? (
        <>
          <Beam pos={[-0.32, 2.0, -0.34]} rot={[0, 0, 0.08]} len={4.0} r={1.25} c={lampC} opacity={0.07 * lamp} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.05, 0.006, 0.1]} renderOrder={3}>
            <circleGeometry args={[1.5, 40]} />
            <meshBasicMaterial map={blobTexture(lampC)} transparent opacity={0.55 * lamp * breathe} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        </>
      ) : null}
      {/* the building front behind her */}
      <mesh position={[0, 3, -3.4]} material={brick} receiveShadow><boxGeometry args={[18, 6.4, 0.4]} /></mesh>
      <RBox size={[18, 0.5, 0.5]} pos={[0, 0.25, -3.2]} r={0.03} c="#2c2a3e" />
      {/* the TV shop window: three screens behind glass */}
      <group position={[1.9, 0, -3.15]}>
        <RBox size={[3.0, 2.2, 0.12]} pos={[0, 1.55, 0]} r={0.03} c="#1a1826" />
        {[-0.95, 0, 0.95].map((x, i) => (
          <group key={i} position={[x, 1.5 + (i === 1 ? 0.15 : 0), 0.1]}>
            <RBox size={[0.82, 0.56, 0.3]} pos={[0, 0, -0.1]} r={0.04} c="#2a2838" />
            <mesh position={[0, 0, 0.06]}><planeGeometry args={[0.72, 0.44]} />
              {on > 0.05 ? <meshBasicMaterial map={tv} color={new THREE.Color('#ffffff').multiplyScalar(on)} toneMapped={false} />
                : <meshToonMaterial color="#0c0c14" />}</mesh>
          </group>
        ))}
        <mesh position={[0, 1.55, 0.16]}><planeGeometry args={[2.9, 2.1]} />
          <meshBasicMaterial color="#9fc8ff" transparent opacity={0.07} depthWrite={false} toneMapped={false} /></mesh>
        <Sign pos={[0, 2.85, 0.1]} size={[2.4, 0.36]} id="corner_shop" glow={on > 0.05}
          paint={(ctx, w, h) => { ctx.fillStyle = '#141220'; ctx.fillRect(0, 0, w, h); drawText(ctx, 'TV - RADIO - 24H', w / 2, h / 2, h * 0.55, on > 0.05 ? '#7fe0ff' : '#2a3040'); }} />
      </group>
      {/* the door + a neon fish above it */}
      <RBox size={[1.1, 2.3, 0.14]} pos={[-1.9, 1.15, -3.15]} r={0.03} c="#2b2236" />
      <mesh position={[-1.9, 2.75, -3.12]}><torusGeometry args={[0.3, 0.025, 8, 32, Math.PI * 1.6]} />
        <meshBasicMaterial color={on > 0.05 ? '#ff4fa3' : '#3a2a3a'} toneMapped={false} /></mesh>
      {/* the billboard frame high above the shop */}
      <group position={[0.4, 4.9, -3.1]}>
        <RBox size={[4.2, 1.9, 0.12]} r={0.03} c="#1e1c2a" />
        {/* an empty billboard is lit paper, not a light (boards run 1: a white glare above her) */}
        <Sign pos={[0, 0, 0.08]} size={[4.0, 1.7]} id={`corner_bb${opts.billboard ?? ''}`} glow={on > 0.05 && typeof opts.billboard === 'string'}
          paint={(ctx, w, h) => {
            ctx.fillStyle = typeof opts.billboard === 'string' ? '#2a1838' : '#8a8478'; ctx.fillRect(0, 0, w, h);
            if (typeof opts.billboard === 'string') drawText(ctx, opts.billboard, w / 2, h / 2, h * 0.42, '#ff3d7f', {outline: '#16121f', ow: 8, maxW: w * 0.9});
          }} />
        {[-1.4, 0, 1.4].map((x) => <mesh key={x} position={[x, 1.05, 0.3]} rotation={[0.6, 0, 0]} material={toon('#26283a')}><cylinderGeometry args={[0.03, 0.05, 0.25, 8]} /></mesh>)}
      </group>
      {/* the newsstand to her right */}
      <group position={[2.6, 0, -1.4]} rotation={[0, -0.5, 0]}>
        <RBox size={[1.4, 2.0, 0.9]} pos={[0, 1.0, 0]} r={0.05} c="#2e5a4a" />
        <RBox size={[1.6, 0.08, 1.1]} pos={[0, 2.04, 0.1]} r={0.02} c="#1f3d33" />
        {Array.from({length: 8}, (_, i) => (
          <mesh key={i} position={[-0.5 + (i % 4) * 0.33, 0.75 + Math.floor(i / 4) * 0.5, 0.46]} rotation={[-0.15, 0, 0]}>
            <planeGeometry args={[0.26, 0.36]} />
            <meshToonMaterial color={opts.covers ? ['#ff3d7f', '#7fd8ff', '#ffd166', '#b98cff'][i % 4] : ['#c9c2b8', '#8a8fa8', '#b0a49a', '#9a8f8a'][i % 4]} />
          </mesh>
        ))}
        <Sign pos={[0, 1.78, 0.46]} size={[1.2, 0.26]} id="corner_news" glow={on > 0.05}
          paint={(ctx, w, h) => { ctx.fillStyle = '#ffd166'; ctx.fillRect(0, 0, w, h); drawText(ctx, 'NEWS', w / 2, h / 2, h * 0.7, '#16121f'); }} />
      </group>
      {/* the bus-stop poster to her left */}
      <group position={[-3.0, 0, -1.2]} rotation={[0, 0.45, 0]}>
        <RBox size={[0.08, 2.2, 0.08]} pos={[-0.6, 1.1, 0]} r={0.02} c="#2a2c3c" />
        <RBox size={[0.08, 2.2, 0.08]} pos={[0.6, 1.1, 0]} r={0.02} c="#2a2c3c" />
        <mesh position={[0, 1.2, 0]}><planeGeometry args={[1.12, 1.6]} />
          <meshBasicMaterial color={new THREE.Color('#bfe6ff').multiplyScalar(0.25 + 0.75 * on)} toneMapped={false} /></mesh>
      </group>
      {/* street things: hydrant, bin, a drain with bubbles (the sea above the city) */}
      <group position={[1.2, 0, 1.1]}>
        <mesh position={[0, 0.3, 0]} material={toon('#c8344a')} castShadow><cylinderGeometry args={[0.11, 0.13, 0.6, 12]} /></mesh>
        <mesh position={[0, 0.63, 0]} material={toon('#c8344a')}><sphereGeometry args={[0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
      </group>
      <mesh position={[-2.2, 0.42, -0.2]} material={toon('#2d3a4e')} castShadow><cylinderGeometry args={[0.26, 0.22, 0.84, 14]} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.6, -0.116, ROAD_Z + 0.5]}><planeGeometry args={[0.6, 0.3]} /><meshToonMaterial color="#14141c" /></mesh>
      {Array.from({length: 9}, (_, i) => {
        const t = ((f / fps) * 0.25 + rnd(i)) % 1;
        return <mesh key={`bub${i}`} position={[0.6 + (rnd(i + 3) - 0.5) * 0.4 + 0.05 * Math.sin(f / 9 + i), -0.1 + t * 6, ROAD_Z + 0.5 + (rnd(i + 7) - 0.5) * 0.2]}>
          <sphereGeometry args={[0.025 + rnd(i + 5) * 0.03, 8, 6]} />
          <meshBasicMaterial color="#cfeaff" transparent opacity={0.5 * (1 - t)} depthWrite={false} toneMapped={false} /></mesh>;
      })}
      {/* the city behind: dark blocks with lit windows, falling into the fog */}
      {Array.from({length: 12}, (_, i) => {
        const x = -16 + i * 2.9, h = 7 + rnd(i) * 9, z = -9 - rnd(i + 4) * 6;
        const win = canvasTexture(`corner_win${i}`, 64, 128, (ctx, w, hh) => {
          ctx.fillStyle = '#101530'; ctx.fillRect(0, 0, w, hh);
          for (let y = 6; y < hh; y += 10) for (let xx = 4; xx < w; xx += 10) if (rnd(i * 97 + y * 3 + xx) > 0.62) { ctx.fillStyle = rnd(xx + y) > 0.5 ? '#ffd59a' : '#9fd0ff'; ctx.fillRect(xx, y, 5, 6); }
        });
        return <mesh key={`blk${i}`} position={[x, h / 2, z]}><boxGeometry args={[2.6, h, 2]} />
          <meshBasicMaterial map={win} color={new THREE.Color('#ffffff').multiplyScalar(0.25 + 0.75 * on)} toneMapped={false} /></mesh>;
      })}
      <DeepLife opts={opts} f={f} fps={fps} camPos={camPos} />
      <Stagings opts={opts} f={f} camPos={camPos} />
    </group>
  );
};
