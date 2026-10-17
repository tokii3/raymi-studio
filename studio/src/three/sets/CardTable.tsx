// SET cardtable - "King of Spades": a giant card table on the sea floor under one hanging lamp. Raymi is card-sized
// (a card is 1.8 m tall): she walks on the felt between chips, a deck, a house of cards and the KING card with her
// own portrait. Marks + cameras in sets.json. Options: king (sprite printed on the King card), house (levels 0-3),
// lamp (0..1), dealt (cards lying face down on the felt), swing (lamp swing amplitude).
import React from 'react';
import {Bubbles, Beam, Kelp, RBox, Rock} from '../parts';
import {Card, CARD_H, Chips, RaySwarm} from '../cards';
import {SetLight, canvasTexture, rnd, toon} from '../look';
import type {SetProps} from './index';

const FELT = '#1f4f5c', RIM = '#3a1f52', GOLD = '#d4ab4f';

export const CardTable: React.FC<SetProps> = ({f, opts}) => {
  const lamp = Number(opts.lamp ?? 1);
  const levels = Number(opts.house ?? 3);
  const swing = Number(opts.swing ?? 0.04) * Math.sin(f / 45);
  const king = String(opts.king ?? 'sprites/WS_F_SMUG_WINK_UV_169.png');
  const backdrop = canvasTexture('ct_back', 64, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0e2f4f'); g.addColorStop(0.6, '#1b1846'); g.addColorStop(1, '#120c2a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  // house of cards: A-frames per level, flat cards as floors
  const house: React.ReactNode[] = [];
  const lean = 0.32;
  for (let lv = 0; lv < levels; lv++) {
    const n = levels - lv;
    const y = lv * (CARD_H * Math.cos(lean) + 0.03);
    for (let k = 0; k < n; k++) {
      const x = (k - (n - 1) / 2) * 1.3;
      house.push(<Card key={`a${lv}${k}`} pos={[2.2 + x - 0.28, y + CARD_H * Math.cos(lean) / 2, -1.8]} rot={[0, 0, -lean]} back />);
      house.push(<Card key={`b${lv}${k}`} pos={[2.2 + x + 0.28, y + CARD_H * Math.cos(lean) / 2, -1.8]} rot={[0, 0, lean]} back />);
      if (lv < levels - 1 && k < n - 1) {
        house.push(<Card key={`f${lv}${k}`} pos={[2.2 + x + 0.65, y + CARD_H * Math.cos(lean) + 0.02, -1.8]} rot={[Math.PI / 2, 0, Math.PI / 2]} back />);
      }
    }
  }
  return (
    <group>
      <SetLight sky="#5f8fd6" ground="#2a1446" fill={0.75} key="#ffe2b8" keyI={0.5 + 1.4 * lamp} keyPos={[1.5, 10, 2.5]} target={[0, 0, 0]}
        shadowSize={8} fog="#14123a" fogNear={11} fogFar={34} bg="#0d0b24" />
      <spotLight position={[swing * 10, 6.6, 0]} target-position={[0, 0, 0]} angle={0.62} penumbra={0.55} color="#ffd9a3" intensity={140 * lamp} distance={16} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0006} />
      <mesh position={[0, 6, -14]}><planeGeometry args={[60, 24]} /><meshBasicMaterial map={backdrop} toneMapped={false} fog={false} /></mesh>
      {/* the sea floor the table stands on */}
      <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon('#3a2c62')} receiveShadow><planeGeometry args={[70, 50]} /></mesh>
      {[[-9, 1], [8, 2], [-6, 3], [10, 4], [-12, 5]].map(([x, s]) => <Kelp key={s} pos={[x, -2.2, -7 - rnd(s) * 3]} h={7 + rnd(s + 1) * 3} f={f} seed={s} c="#1d5b66" w={0.4} />)}
      <Rock pos={[-10, -1.6, -4]} size={[2.4, 1.6, 2]} seed={21} c="#2e2556" />
      <Rock pos={[11, -1.7, -5]} size={[3, 1.4, 2.2]} seed={22} c="#2e2556" />
      <Bubbles pos={[-7, -2.2, -3]} f={f} n={16} h={12} spread={0.6} seed={33} size={0.08} />
      {/* table: felt, padded rim with gold piping, a leg */}
      <RBox size={[13, 0.3, 9]} pos={[0, -0.15, 0]} r={0.08} c={FELT} />
      {[[0, 4.65, 13.6, 0.5], [0, -4.65, 13.6, 0.5]].map(([x, z, w, d], i) => <RBox key={i} size={[w, 0.42, d]} pos={[x, 0.02, z]} r={0.2} c={RIM} />)}
      {[[6.65, 0], [-6.65, 0]].map(([x], i) => <RBox key={i} size={[0.5, 0.42, 9.8]} pos={[x, 0.02, 0]} r={0.2} c={RIM} />)}
      <mesh position={[0, 0.05, 4.4]} material={toon(GOLD)}><boxGeometry args={[12.9, 0.03, 0.03]} /></mesh>
      <RBox size={[1.4, 2.0, 1.4]} pos={[0, -1.2, 0]} r={0.2} c="#24163a" />
      {/* felt print: a ray-spade arc and a betting line */}
      <mesh position={[0, 0.006, 1.6]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <planeGeometry args={[9, 3]} />
        <meshToonMaterial transparent map={canvasTexture('felt_print', 1024, 340, (ctx, w, h) => {
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = 'rgba(214,190,120,0.75)'; ctx.lineWidth = 6;
          ctx.beginPath(); ctx.ellipse(w / 2, -h * 1.1, w * 0.48, h * 1.95, 0, 0.12 * Math.PI, 0.88 * Math.PI); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(w / 2, -h * 1.1, w * 0.44, h * 1.78, 0, 0.14 * Math.PI, 0.86 * Math.PI); ctx.stroke();
        })} />
      </mesh>
      {/* the hanging lamp */}
      <group position={[swing * 10, 7.2, 0]} rotation={[0, 0, swing]}>
        <mesh position={[0, 3, 0]} material={toon('#151022')}><cylinderGeometry args={[0.03, 0.03, 6, 6]} /></mesh>
        <mesh material={toon('#1f6b52', '#000000')} castShadow><coneGeometry args={[1.3, 0.9, 32, 1, true]} /></mesh>
        <mesh position={[0, -0.25, 0]}><sphereGeometry args={[0.32, 16, 12]} /><meshBasicMaterial color={lamp > 0.2 ? '#fff1cc' : '#4a3b2a'} toneMapped={false} /></mesh>
      </group>
      <Beam pos={[swing * 10, 3.6, 0]} len={7} r={3.6} c="#ffe7bf" opacity={0.08 * lamp} />
      {/* props on the felt */}
      <Card pos={[-1.6, CARD_H / 2 + 0.01, -1.2]} rot={[0, 0.18, 0]} rank="K" sprite={king} crop={[0.02, 0.46]} />
      {house}
      <Chips pos={[1.5, 0, 0.9]} n={6} c="#7a49c4" />
      <Chips pos={[2.4, 0, 1.4]} n={4} c="#2fa3a0" seed={2} />
      <Chips pos={[0.9, 0, 1.7]} n={9} c="#d4ab4f" seed={3} />
      <Chips pos={[-4.6, 0, 2.6]} n={3} c="#c2416f" seed={4} />
      {/* the deck, squared */}
      {Array.from({length: 7}, (_, i) => <Card key={`d${i}`} pos={[-2.6, 0.02 + i * 0.032, 0.8]} rot={[-Math.PI / 2, 0, 0.3 + i * 0.01]} back />)}
      {opts.pair ? (                                   // left side / right side: two Kings facing each other
        <group>
          <Card pos={[-1.7, CARD_H / 2 + 0.01, 0.6]} rot={[0, 0.5, 0]} rank="K" sprite={king} crop={[0.02, 0.46]} />
          <Card pos={[1.7, CARD_H / 2 + 0.01, 0.6]} rot={[0, -0.5, 0]} rank="K" sprite={king} crop={[0.02, 0.46]} />
        </group>
      ) : null}
      {opts.swarm ? <RaySwarm center={[2.2, levels * (CARD_H * 0.95 + 0.03) + 0.9, -1.8]} r={1.1} n={9} f={f} /> : null}
      {opts.dealt ? Array.from({length: 5}, (_, i) => <Card key={`x${i}`} pos={[-3 + i * 1.5, 0.02, 3.0]} rot={[-Math.PI / 2, 0, (rnd(i) - 0.5) * 0.3]} back />) : null}
    </group>
  );
};
