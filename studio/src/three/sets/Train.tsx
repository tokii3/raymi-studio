// SET train - "Same Day": the deep-sea commuter train and its platform. The car (origin): benches along both sides,
// grab poles and hanging straps, windows with the dark sea streaming past, a long LED band over the windows (a lyric
// surface), ad panels (lyric surfaces), sliding doors at z = 0 on the right side (x = +1.3). The platform lies outside
// those doors (x > 1.6): tiles, a yellow edge line, floor arrows, a departure board.
// Options:
//   doors: 0..1 | [[frame, 0..1], ...]   open amount of the doors (0 closed), stepping like other keyed options
//   led: text            the LED band's running text (the lyric block usually writes there instead)
//   moving: true         the sea streams past the windows (default true)
//   beach_flash: [from, to]   frames the windows show the sunny beach (sun on her face)
//   board: text          the departure board's text
//   arrows: true         the floor arrows on the platform
import React from 'react';
import * as THREE from 'three';
import {RBox, Sign, drawText} from '../parts';
import {SetLight, canvasTexture, rnd, toon, toonSurface} from '../look';
import {RoutineLife} from '../routine';
import {stepValue} from '../events';
import type {SetProps} from './index';

export const Train: React.FC<SetProps> = ({f, opts, camPos}) => {
  const doorsV = typeof opts.doors === 'number' ? opts.doors : (() => {
    const s = stepValue<number>(opts.doors, f, 10);
    return s.to === null ? 0 : (s.from ?? s.to) + (s.to - (s.from ?? s.to)) * s.t;
  })();
  const moving = opts.moving !== false;
  const flash = Array.isArray(opts.beach_flash) && f >= (opts.beach_flash as number[])[0] && f < (opts.beach_flash as number[])[1];
  const run = moving ? f * 0.09 : 0;
  const ledText = String(opts.led ?? 'NEXT: OFFICE DOME 3   NEXT: OFFICE DOME 3');
  const led = canvasTexture(`trainled${ledText}`, 2048, 96, (ctx, w, h) => {
    ctx.fillStyle = '#120a08'; ctx.fillRect(0, 0, w, h);
    drawText(ctx, ledText, w / 2, h / 2, h * 0.7, '#ffb347', {maxW: w * 0.96});
  });
  return (
    <group>
      <SetLight sky="#d6dcf0" ground="#2a2c3a" fill={0.65} key="#f6f7ff" keyI={2.3} keyPos={[0, 4, 2]} target={[0, 0.5, 0]} shadowSize={6}
        fog="#3a3e52" fogNear={10} fogFar={26} bg="#1c2033" />
      {/* the car body */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={toonSurface('#5e6274', 'rubber', [6, 36])} receiveShadow><planeGeometry args={[2.6, 16]} /></mesh>
      <mesh position={[0, 2.3, 0]} rotation={[Math.PI / 2, 0, 0]} material={toon('#c9ccd8')}><planeGeometry args={[2.6, 16]} /></mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          {/* wall below + above the windows */}
          <mesh position={[side * 1.3, 0.45, 0]} rotation={[0, -side * Math.PI / 2, 0]} material={toon('#8d92a6')}><planeGeometry args={[16, 0.9]} /></mesh>
          <mesh position={[side * 1.3, 2.05, 0]} rotation={[0, -side * Math.PI / 2, 0]} material={toon('#9aa0b4')}><planeGeometry args={[16, 0.5]} /></mesh>
          {/* windows: the sea (or the beach) streaming past */}
          {Array.from({length: 5}, (_, w) => {
            const z = -6 + w * 3;
            if (side > 0 && Math.abs(z) < 1.2) return null;           // the doors
            return (
              <group key={w} position={[side * 1.31, 1.35, z]} rotation={[0, -side * Math.PI / 2, 0]}>
                <mesh><planeGeometry args={[2.2, 0.9]} /><meshBasicMaterial color={flash ? '#7fe6e0' : '#0d1730'} toneMapped={false} /></mesh>
                {flash ? <mesh position={[0, -0.25, 0.005]}><planeGeometry args={[2.2, 0.4]} /><meshBasicMaterial color="#f4dfae" toneMapped={false} /></mesh> : null}
                {!flash ? Array.from({length: 10}, (_, i) => {
                  const x = ((rnd(i + w * 7) * 2.6 - run * (0.6 + rnd(i * 3))) % 2.6 + 2.6) % 2.6 - 1.3;
                  return <mesh key={i} position={[x, (rnd(i * 2.3) - 0.5) * 0.8, 0.004]}><planeGeometry args={[0.12 + 0.2 * rnd(i * 5), 0.012]} />
                    <meshBasicMaterial color="#7fa2e0" transparent opacity={0.7} toneMapped={false} /></mesh>;
                }) : null}
                <mesh position={[0, 0, 0.01]}><planeGeometry args={[2.2, 0.9]} /><meshBasicMaterial color="#cfe0ff" transparent opacity={0.12} toneMapped={false} /></mesh>
              </group>
            );
          })}
          {/* benches */}
          {[-4.5, 4.5].map((z) => <RBox key={z} size={[0.45, 0.45, 3]} pos={[side * 1.05, 0.23, z]} r={0.05} c="#4f5aa0" t="fabric" />)}
          {/* ad panels above the benches (lyric surfaces) */}
          {[-4.5, 4.5].map((z) => (
            <Sign key={`ad${z}`} id={`trainad${side}${z}`} pos={[side * 1.28, 1.98, z]} rot={[0, -side * Math.PI / 2, 0]} size={[1.6, 0.34]} paint={(ctx, w, h) => {
              ctx.fillStyle = '#f2efe6'; ctx.fillRect(0, 0, w, h);
              drawText(ctx, z < 0 ? 'WORK HARDER - SMILE MORE' : 'DOME 3 BUSINESS PARK', w / 2, h / 2, h * 0.45, '#3a3e58', {maxW: w * 0.92});
            }} />
          ))}
        </group>
      ))}
      {/* the LED band over the windows on the left wall */}
      <mesh position={[-1.27, 2.2, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[9, 0.2]} /><meshBasicMaterial map={led} toneMapped={false} /></mesh>
      {/* poles and straps */}
      {[-3, 0, 3].map((z) => <mesh key={z} position={[0, 1.15, z]} material={toon('#d7dae6')}><cylinderGeometry args={[0.025, 0.025, 2.3, 10]} /></mesh>)}
      <mesh position={[0.55, 2.05, 0]} rotation={[Math.PI / 2, 0, 0]} material={toon('#d7dae6')}><cylinderGeometry args={[0.02, 0.02, 16, 8]} /></mesh>
      <mesh position={[-0.55, 2.05, 0]} rotation={[Math.PI / 2, 0, 0]} material={toon('#d7dae6')}><cylinderGeometry args={[0.02, 0.02, 16, 8]} /></mesh>
      {Array.from({length: 12}, (_, i) => [-0.55, 0.55].map((x) => (
        <group key={`${i}${x}`} position={[x, 2.05, -5.5 + i]} rotation={[0.05 * Math.sin(f / 12 + i), 0, 0.06 * Math.sin(f / 9 + i * 2)]}>
          <mesh position={[0, -0.12, 0]} material={toon('#e9ebf2')}><boxGeometry args={[0.02, 0.24, 0.02]} /></mesh>
          <mesh position={[0, -0.3, 0]} material={toon('#f4c95a')}><torusGeometry args={[0.06, 0.012, 6, 16]} /></mesh>
        </group>
      )))}
      {/* the sliding doors on the right side + the "mind the gap" stickers */}
      {[-1, 1].map((sd) => (
        <group key={`door${sd}`} position={[1.3, 1.05, sd * (0.4 + 0.75 * doorsV)]}>
          <RBox size={[0.06, 2.1, 0.8]} r={0.02} c="#b6bbcc" />
          <mesh position={[-0.035, 0.35, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[0.6, 0.7]} /><meshBasicMaterial color="#0d1730" toneMapped={false} /></mesh>
          <Sign id="mindgap" pos={[-0.04, -0.35, 0]} rot={[0, -Math.PI / 2, 0]} size={[0.5, 0.12]} paint={(ctx, w, h) => {
            ctx.fillStyle = '#ffd34d'; ctx.fillRect(0, 0, w, h); drawText(ctx, 'MIND THE GAP', w / 2, h / 2, h * 0.55, '#1a1030', {maxW: w * 0.9});
          }} />
        </group>
      ))}
      {/* the platform outside the doors */}
      <group position={[1.6, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4, 0, 0]} material={toon('#7a7f92')} receiveShadow><planeGeometry args={[8, 16]} /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.25, 0.003, 0]}><planeGeometry args={[0.2, 16]} /><meshBasicMaterial color="#ffd34d" toneMapped={false} /></mesh>
        {Array.from({length: 8}, (_, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[4, 0.002, -7 + i * 2]}><planeGeometry args={[8, 0.02]} /><meshBasicMaterial color="#666b7d" toneMapped={false} /></mesh>
        ))}
        {opts.arrows ? Array.from({length: 5}, (_, i) => (
          <mesh key={`ar${i}`} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} position={[2.2 + i * 1.1, 0.004, 0]}>
            <circleGeometry args={[0.35, 3]} /><meshBasicMaterial color="#f4f2ea" toneMapped={false} /></mesh>
        )) : null}
        <group position={[5.5, 0, -2.5]} rotation={[0, -1.2, 0]}>
          <mesh position={[0, 1.4, 0]} material={toon('#3a3e52')}><cylinderGeometry args={[0.05, 0.05, 2.8, 8]} /></mesh>
          <Sign id={`board${String(opts.board ?? '')}`} pos={[0, 2.6, 0.06]} size={[2.2, 0.6]} glow frame="#1a1c28" paint={(ctx, w, h) => {
            ctx.fillStyle = '#0c0e16'; ctx.fillRect(0, 0, w, h);
            drawText(ctx, String(opts.board ?? '07:42  OFFICE DOME 3'), w / 2, h / 2, h * 0.42, '#ffb347', {maxW: w * 0.92});
          }} />
        </group>
        <mesh position={[8, 1.7, 0]} rotation={[0, -Math.PI / 2, 0]} material={toon('#5a5f74')}><planeGeometry args={[16, 3.4]} /></mesh>
      </group>
      <pointLight position={[0, 2.1, 0]} color="#f2f6ff" intensity={4} distance={8} decay={1.4} />
      <RoutineLife opts={opts} f={f} camPos={camPos} />
    </group>
  );
};
