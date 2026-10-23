// SET beach - "Same Day": the sunny edge of her sea - everything she loves. Warm sand with ripples running into
// shallow turquoise water (the shore runs along x = 0.4: sand at x < 0, water at x > 0), caustics on the
// sea bed, a big low sun, a wide bay to the horizon with a headland, Salmon's tiny deck chair, and (dusk) far out in the
// deep blue the tiny grey office dome she left. The water is shallow: lying at "float" she is half in it.
// Options:
//   dusk: 0..1          day -> evening sun (warm orange, long shadows, her dots glow)
//   dusk_to: [[t, v]] + dusk_s   the light runs from dusk to v over dusk_s seconds, starting at t (song s)
//   salmon / fish / props    creatures (creatures.tsx DeepLife: Salmon waves, floats, dances)
//   deckchair: true     Salmon's tiny deck chair + parasol at the "chair" mark
//   dome: true          the tiny office dome far out at sea (shot 82)
//   page: frame         a blank calendar page floats out to sea from "shore" (shot 84)
//   things / strings / crowd   routine.tsx (the half-buried alarm clock, the fish at the waterline)
import React from 'react';
import * as THREE from 'three';
import {Caustics, Ground, RBox} from '../parts';
import {SetLight, canvasTexture, rnd, toon} from '../look';
import {DeepLife} from '../creatures';
import {RoutineLife} from '../routine';
import type {SetProps} from './index';

const num = (v: unknown, d = 0) => (typeof v === 'number' ? v : d);

export const Beach: React.FC<SetProps> = ({f, fps, opts, camPos}) => {
  // dusk_to: [[frame, value]] = the light runs from `dusk` to value over dusk_s seconds (the sky turns while you watch)
  let dusk = num(opts.dusk);
  if (Array.isArray(opts.dusk_to) && Array.isArray(opts.dusk_to[0])) {
    const [at, v] = opts.dusk_to[0] as [number, number];
    const k = Math.max(0, Math.min(1, (f - at) / (num(opts.dusk_s, 1.5) * 30)));
    dusk += (v - dusk) * (k * k * (3 - 2 * k));
  }
  const sunC = new THREE.Color('#fff4d6').lerp(new THREE.Color('#ff9a52'), dusk);
  const skyTop = new THREE.Color('#5fc4f0').lerp(new THREE.Color('#5a4a9a'), dusk);
  const skyLow = new THREE.Color('#d9f6ff').lerp(new THREE.Color('#ffb27a'), dusk);
  const sky = canvasTexture(`beachsky${dusk.toFixed(2)}`, 256, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, skyTop.getStyle()); g.addColorStop(0.75, skyLow.getStyle()); g.addColorStop(1, skyLow.getStyle());
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  const sunPos: [number, number, number] = [40, 14 - 9 * dusk, -60];
  const waterC = new THREE.Color('#38d6d0').lerp(new THREE.Color('#3a6a9a'), dusk * 0.6);
  const sandC = new THREE.Color('#f2dcaa').lerp(new THREE.Color('#e0a87a'), dusk * 0.5);
  const pageD = typeof opts.page === 'number' ? f - opts.page : -1;
  return (
    <group>
      <SetLight sky={skyLow.getStyle()} ground={sandC.getStyle()} fill={1.25} key={sunC.getStyle()} keyI={2.6 - 0.6 * dusk}
        keyPos={[8, 9 - 6 * dusk, -6]} target={[0, 0, 0]} shadowSize={8} fog={skyLow.getStyle()} fogNear={30} fogFar={140} bg={skyLow.getStyle()} />
      {/* sky dome + sun */}
      <mesh scale={[180, 90, 180]} position={[0, -5, 0]}><sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial map={sky} side={THREE.BackSide} fog={false} toneMapped={false} /></mesh>
      <mesh position={sunPos}><circleGeometry args={[4.5, 32]} /><meshBasicMaterial color={sunC} fog={false} toneMapped={false} /></mesh>
      <mesh position={[sunPos[0], sunPos[1], sunPos[2] + 0.1]}><circleGeometry args={[9, 32]} />
        <meshBasicMaterial color={sunC} transparent opacity={0.25} fog={false} depthWrite={false} toneMapped={false} /></mesh>
      {/* clouds (soft white puffs) */}
      {Array.from({length: 6}, (_, i) => (
        <group key={i} position={[-40 + i * 18 + (f * 0.01) % 10, 18 + rnd(i) * 8, -70 - rnd(i * 3) * 20]}>
          {[0, 1, 2].map((k) => <mesh key={k} position={[k * 3 - 3, Math.sin(k) * 0.8, 0]}><sphereGeometry args={[2.6 + k * 0.4, 12, 8]} />
            <meshBasicMaterial color={new THREE.Color('#ffffff').lerp(new THREE.Color('#ffc9a8'), dusk)} fog={false} toneMapped={false} /></mesh>)}
        </group>
      ))}
      {/* sand (x < 0.4) with ripples, then the sea bed under shallow water */}
      <Ground size={[40, 60]} c={sandC.getStyle()} pos={[-20, 0.02, -10]} dunes={0.05} seed={7} />
      {Array.from({length: 14}, (_, i) => (
        <mesh key={`rp${i}`} rotation={[-Math.PI / 2, 0, 0.05 * Math.sin(i)]} position={[-0.8 - i * 0.55, 0.005, -2]}>
          <planeGeometry args={[0.05, 18]} /><meshBasicMaterial color={new THREE.Color(sandC).multiplyScalar(0.9)} toneMapped={false} /></mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, -0.25, -10]} material={toon(new THREE.Color('#e7d39e').lerp(new THREE.Color('#9fb0a8'), 0.3).getStyle())}>
        <planeGeometry args={[80, 60]} /></mesh>
      <Caustics size={[30, 30]} pos={[14, -0.23, -4]} f={f} c="#ffffff" opacity={0.3 * (1 - dusk * 0.6)} />
      {/* the shallow water: gently moving surface, foam line at the shore */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, 0.06 + 0.012 * Math.sin(f / 18), -10]} renderOrder={4}>
        <planeGeometry args={[80, 60]} />
        <meshToonMaterial color={waterC} transparent opacity={0.62} depthWrite={false} />
      </mesh>
      {Array.from({length: 3}, (_, k) => {
        const t = ((f / fps) * 0.35 + k / 3) % 1;
        return <mesh key={`foam${k}`} rotation={[-Math.PI / 2, 0, 0]} position={[0.3 + 1.5 * (1 - t), 0.07, -2]} renderOrder={5}>
          <planeGeometry args={[0.18, 24]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.7 * Math.sin(Math.PI * t)} depthWrite={false} toneMapped={false} /></mesh>;
      })}
      {/* the headland across the bay */}
      <group position={[30, 0, -45]}>
        <mesh scale={[22, 7, 9]} material={toon(new THREE.Color('#5aa07a').lerp(new THREE.Color('#5a4a6a'), dusk).getStyle())}><sphereGeometry args={[1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
      </group>
      {opts.deckchair ? (
        <group position={[-1.8, 0, -2.4]} rotation={[0, 0.6, 0]} scale={0.55}>
          <RBox size={[0.6, 0.04, 1.0]} pos={[0, 0.32, 0]} rot={[-0.35, 0, 0]} r={0.01} c="#ff8a5c" />
          {[-0.28, 0.28].map((x) => <mesh key={x} position={[x, 0.18, 0]} rotation={[0.5, 0, 0]} material={toon('#c08a5a')}><cylinderGeometry args={[0.02, 0.02, 0.5, 6]} /></mesh>)}
          <mesh position={[0.6, 0.8, 0]} material={toon('#c08a5a')}><cylinderGeometry args={[0.02, 0.02, 1.6, 6]} /></mesh>
          <mesh position={[0.6, 1.6, 0]} material={toon('#ffe066', '#000', 1, {side: THREE.DoubleSide})}><coneGeometry args={[0.7, 0.25, 12, 1, true]} /></mesh>
        </group>
      ) : null}
      {opts.dome ? (
        // the grey office dome she left, tiny, deep in the blue far out at sea
        <group position={[55, -1.2, -38]}>
          <mesh material={toon('#7d8296')}><sphereGeometry args={[1.6, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
          {Array.from({length: 5}, (_, i) => <mesh key={i} position={[Math.cos(i) * 1.2, 0.5, Math.sin(i) * 1.2]}><sphereGeometry args={[0.08, 6, 4]} />
            <meshBasicMaterial color="#e6ecff" toneMapped={false} /></mesh>)}
        </group>
      ) : null}
      {pageD >= 0 ? (
        <mesh position={[0.6 + pageD * 0.03, 0.08 + 0.02 * Math.sin(pageD / 6), -1 - pageD * 0.01]} rotation={[-Math.PI / 2, 0, pageD * 0.01]} renderOrder={6}>
          <planeGeometry args={[0.32, 0.36]} /><meshToonMaterial color="#f7f3e8" /></mesh>
      ) : null}
      <DeepLife opts={opts} f={f} fps={fps} camPos={camPos} />
      <RoutineLife opts={{...opts, salmon: undefined}} f={f} camPos={camPos} />
    </group>
  );
};
