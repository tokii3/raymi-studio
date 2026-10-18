// SET cardtable - "King of Spades": a giant card table on the sea floor under one hanging lamp. Raymi is card-sized
// (a card is 1.8 m tall): she walks on the felt between chips, a deck, a house of cards and the KING card with her
// own portrait. Marks + cameras in sets.json. Options: king (sprite printed on the King card), house (levels 0-3),
// lamp (0..1), dealt (cards lying face down on the felt), swing (lamp swing amplitude).
// Night (KING build list, reusable): palette 'night' (wine felt, amber caged work lamp, black-violet surround),
// chips 'coins' (her wish coins as towers), pool (the lamp's light pool on the felt) + pool_on [[f, 'card'|'deck'|
// 'raymi'|'house'|'pile']] (where it swings to), gust (f: a current swings the lamp hard), deal_beats ('beats': the
// pool flips a card face up on every beat), house_keys [[f, levels]], collapse (f), pile [x,y,z] (a heap of cards),
// topple (f: coin towers fall like dominoes), pickup (f: PICK UP lights in the felt print), king_float / king_held /
// king_bend / king_rot [a, b] (180 deg) / king_kick (f), warning_cards [f...] + warning_slash (f), slaps [f...],
// flick [f, 'left'|'right'], coin_flick (f: a coin shot up into the lamp), bulb_pop (f), black (total black),
// coin_roll / coin_spin (f), spade_glow (f | 'all'), swarm_peel [f...] (spades peel off as little rays), swarm.
import React from 'react';
import * as THREE from 'three';
import {Bubbles, Beam, Kelp, RBox, Rock, drawText} from '../parts';
import {Card, CARD_H, Chips, RaySwarm} from '../cards';
import {Coin} from '../aquarium_props';
import {SetLight, blobTexture, canvasTexture, rnd, toon} from '../look';
import {flare, frames, passed, since, stepValue} from '../events';
import {ease} from '../../film/motion';
import type {SetProps} from './index';

type P3 = [number, number, number];
const DAY = {felt: '#1f4f5c', rim: '#3a1f52', back: ['#0e2f4f', '#1b1846', '#120c2a'], floor: '#3a2c62', lamp: '#ffd9a3', sky: '#5f8fd6'};
const NIGHT = {felt: '#5a1830', rim: '#1a0f22', back: ['#0a0614', '#140a24', '#07040e'], floor: '#160d24', lamp: '#ffb35c', sky: '#3a2a5e'};
const GOLD = '#d4ab4f';
const TARGET: Record<string, P3> = {card: [-1.6, 0, -1.2], deck: [-2.6, 0, 0.8], raymi: [0, 0, 0], house: [2.2, 0, -1.8], chips: [1.5, 0, 0.9]};

export const CardTable: React.FC<SetProps> = ({f, opts, beats}) => {
  const night = opts.palette === 'night';
  const P = night ? NIGHT : DAY;
  const black = opts.black === true;
  const popped = typeof opts.bulb_pop === 'number' && f >= opts.bulb_pop;
  const lamp = black || popped ? 0 : Number(opts.lamp ?? 1);
  const king = String(opts.king ?? 'sprites/WS_F_SMUG_WINK_UV_169.png');
  // ---- the lamp: where its pool is aimed (pool_on), its swing, a gust
  const aim = stepValue<string>(opts.pool_on, f, 10);
  const tgt = (k: string | null): P3 => (k === 'pile' && Array.isArray(opts.pile) ? opts.pile as P3 : TARGET[k ?? 'raymi'] ?? TARGET.raymi);
  const a0 = tgt(aim.from ?? aim.to), a1 = tgt(aim.to);
  const g = since(opts.gust, f);
  const gust = Number.isFinite(g) ? 0.45 * Math.exp(-g / 40) * Math.sin(g / 6) : 0;
  const sw = Number(opts.swing ?? 0.04) * Math.sin(f / 45) + gust;
  const lx = (aim.to ? a0[0] + (a1[0] - a0[0]) * aim.t : 0) + sw * 10, lz = aim.to ? a0[2] + (a1[2] - a0[2]) * aim.t : 0;
  const lampPos: P3 = [lx, 7.2, lz];
  // ---- house of cards: levels over time (house_keys), collapse
  const hk = stepValue<number>(opts.house_keys, f, 1);
  const levels = hk.to !== null ? Number(hk.to) : Number(opts.house ?? 3);
  const col = since(opts.collapse, f);
  const fallen = Number.isFinite(col) ? Math.min(1, col / 12) : 0;
  const backdrop = canvasTexture(`ct_back${night}`, 64, 512, (ctx, w, h) => {
    const gr = ctx.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, P.back[0]); gr.addColorStop(0.6, P.back[1]); gr.addColorStop(1, P.back[2]);
    ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
  });
  const house: React.ReactNode[] = [];
  const lean = 0.32;
  for (let lv = 0; lv < levels; lv++) {
    const n = levels - lv;
    const y = lv * (CARD_H * Math.cos(lean) + 0.03);
    for (let k = 0; k < n; k++) {
      const x = (k - (n - 1) / 2) * 1.3;
      const s = lv * 7 + k;
      const fall = (p: P3, r: P3): [P3, P3] => (fallen > 0
        ? [[p[0] + (rnd(s) - 0.5) * 3 * fallen, p[1] * (1 - fallen) + 0.03 * fallen, p[2] + (rnd(s + 1) - 0.5) * 2 * fallen],
          [r[0] + (-Math.PI / 2 - r[0]) * fallen, r[1] + rnd(s + 2) * 2 * fallen, r[2] * (1 - fallen)]] : [p, r]);
      const [pa, ra] = fall([2.2 + x - 0.28, y + CARD_H * Math.cos(lean) / 2, -1.8], [0, 0, -lean]);
      const [pb, rb] = fall([2.2 + x + 0.28, y + CARD_H * Math.cos(lean) / 2, -1.8], [0, 0, lean]);
      house.push(<Card key={`a${lv}${k}`} pos={pa} rot={ra} back />, <Card key={`b${lv}${k}`} pos={pb} rot={rb} back />);
      if (lv < levels - 1 && k < n - 1) {
        const [pf, rf] = fall([2.2 + x + 0.65, y + CARD_H * Math.cos(lean) + 0.02, -1.8], [Math.PI / 2, 0, Math.PI / 2]);
        house.push(<Card key={`f${lv}${k}`} pos={pf} rot={rf} back />);
      }
    }
  }
  const topY = levels > 0 ? (levels - 1) * (CARD_H * Math.cos(lean) + 0.03) + CARD_H * Math.cos(lean) : 0;
  if (levels > 0 && fallen < 1) house.push(<Card key="top" pos={[2.2, topY + 0.03, -1.8]} rot={[-Math.PI / 2, 0, Math.PI / 2]} back />);
  // ---- the King card (her portrait): rot (180 deg between a..b), kick (flies off), bend
  const kr = frames(opts.king_rot);
  const rotZ = kr.length === 2 ? Math.PI * ease('inOut', (f - kr[0]) / Math.max(1, kr[1] - kr[0])) : 0;
  const kk = since(opts.king_kick, f);
  const kickT = Number.isFinite(kk) ? Math.min(1, kk / 18) : 0;
  const bend = opts.king_bend ? 0.18 * Math.sin(f / 5) : 0;
  const kingCard = kickT >= 1 ? null : (
    <Card pos={[-1.6 + 6 * kickT, CARD_H / 2 + 0.01 + 3 * Math.sin(kickT * Math.PI) * 0.8, -1.2 - 2 * kickT]}
      rot={[bend, 0.18 + kickT * 6, rotZ + kickT * 4]} scale={[1 - Math.abs(bend), 1, 1] as unknown as number} rank="K" sprite={king} crop={[0.02, 0.46]} />
  );
  // ---- coins (wish coins as chip towers at night), topple
  const tp = since(opts.topple, f);
  const towers: [P3, number, string, number][] = [[[1.5, 0, 0.9], 6, '#7a49c4', 1], [[2.4, 0, 1.4], 4, '#2fa3a0', 2], [[0.9, 0, 1.7], 9, GOLD, 3], [[-4.6, 0, 2.6], 3, '#c2416f', 4]];
  const chips = towers.map(([p, n, c, s], i) => {
    const t = Number.isFinite(tp) ? Math.max(0, Math.min(1, (tp - i * 4) / 10)) : 0;
    const coins = opts.chips === 'coins';
    return (
      <group key={s} position={p} rotation={[0, 0, -ease('in', t) * Math.PI / 2]}>
        {coins ? Array.from({length: n}, (_, k) => <Coin key={k} pos={[0, 0.06 + k * 0.13, 0]} rot={[0, k, 0]} scale={5.5} />)
          : <Chips pos={[0, 0, 0]} n={n} c={c} seed={s} />}
      </group>
    );
  });
  // ---- dealing: the pool flips a card face up on every beat; slaps (face down); warning cards; flicks
  const dealt: React.ReactNode[] = [];
  if (opts.deal_beats === 'beats') {
    const past = beats.filter((b) => b <= f).slice(-6);
    past.forEach((b, i) => {
      const d = f - b, t = Math.min(1, d / 5);
      const ox = (rnd(b) - 0.5) * 2.4, oz = (rnd(b + 1) - 0.5) * 1.6;
      dealt.push(<Card key={`d${b}`} pos={[lx + ox, 0.03 + i * 0.002 + 0.5 * Math.sin(t * Math.PI), lz + oz]} rot={[-Math.PI / 2, 0, rnd(b + 2) * 2 + Math.PI * (1 - t)]}
        rank={['K', 'A', '7', 'Q', 'J'][b % 5]} sprite={b % 3 === 0 ? king : undefined} />);
    });
  }
  frames(opts.slaps).forEach((t0, i) => {
    const d = f - t0;
    if (d < 0) return;
    const t = Math.min(1, d / 3);
    dealt.push(<Card key={`s${i}`} pos={[-0.9 + i * 0.9, 0.03 + 0.8 * (1 - t), 0.9]} rot={[-Math.PI / 2, 0, (rnd(i) - 0.5) * 0.4]} back />);
  });
  const ws = since(opts.warning_slash, f);
  frames(opts.warning_cards).forEach((t0, i) => {
    const d = f - t0;
    if (d < 0) return;
    const t = Math.min(1, d / 3);
    const split = i === 1 && Number.isFinite(ws) ? Math.min(1, ws / 8) : 0;
    const base: P3 = [-0.9 + i * 1.8, 0.03 + 0.8 * (1 - t), 0.4];
    if (split > 0) {
      for (const sgn of [-1, 1]) {
        dealt.push(<Card key={`w${i}${sgn}`} pos={[base[0] + sgn * (0.3 + split * 0.5), 0.03, base[2]]} rot={[-Math.PI / 2, 0, sgn * split * 0.6]}
          scale={0.7} rank="!" ink="#d0203a" />);
      }
    } else dealt.push(<Card key={`w${i}`} pos={base} rot={[-Math.PI / 2, 0, (rnd(i + 5) - 0.5) * 0.3]} rank="!" ink="#d0203a" />);
  });
  const fl = Array.isArray(opts.flick) ? opts.flick as [number, string] : null;
  if (fl) {
    const d = f - fl[0], dir = fl[1] === 'left' ? -1 : 1;
    for (let i = 0; i < 4; i++) {
      const t = Math.max(0, (d - i * 2) / 14);
      dealt.push(<Card key={`fl${i}`} pos={[dir * (1 + t * 7) + (rnd(i) - 0.5), 0.03 + 2 * Math.sin(Math.min(1, t) * Math.PI) * 0.6, 0.5 + i * 0.4]}
        rot={[-Math.PI / 2 + t * 3, t * 4, 0]} back={i % 2 === 0} rank="K" sprite={i % 2 ? king : undefined} />);
    }
  }
  // ---- coins on their own: flick up into the lamp, roll, spin
  const cf = since(opts.coin_flick, f);
  const coinShot = Number.isFinite(cf) ? (() => {
    const t = Math.min(1, cf / 10);
    return <Coin pos={[lx * t, 1.0 + (6.9 - 1.0) * ease('out', t), lz * t + 0.4 * (1 - t)]} rot={[cf, 0, cf * 0.7]} scale={5.5} />;
  })() : null;
  const cr = since(opts.coin_roll, f);
  const coinRoll = Number.isFinite(cr) ? <Coin pos={[1.5 - Math.min(cr, 30) * 0.06, 0.4, 0.9 + Math.min(cr, 30) * 0.02]} rot={[Math.PI / 2, 0, -cr * 0.3]} scale={5.5} /> : null;
  const cs = since(opts.coin_spin, f);
  const coinSpin = Number.isFinite(cs) ? <Coin pos={[1.2, 0.42, -0.4]} rot={[0.15 * Math.sin(cs / 3), cs * 0.45, Math.PI / 2]} scale={5.5} /> : null;
  // ---- the bulb popping: sparks
  const bp = since(opts.bulb_pop, f);
  const sparks = bp < 10 ? Array.from({length: 10}, (_, i) => {
    const a = rnd(i) * Math.PI * 2, r = bp * 0.12;
    return <mesh key={i} position={[lx + Math.cos(a) * r, 6.9 - bp * 0.05 - rnd(i + 1) * r, lz + Math.sin(a) * r]}><sphereGeometry args={[0.05, 6, 4]} />
      <meshBasicMaterial color="#fff1cc" transparent opacity={1 - bp / 10} toneMapped={false} /></mesh>;
  }) : null;
  // ---- her light on the cards: spade_glow (one card once at f, or 'all'), swarm_peel (spades leave the cards as rays)
  const sgAll = opts.spade_glow === 'all';
  const sgOne = typeof opts.spade_glow === 'number' ? flare(opts.spade_glow, f, 20) : 0;
  const scatter: P3[] = Array.from({length: 12}, (_, i) => [(rnd(i + 60) - 0.5) * 9, 0.025, (rnd(i + 61) - 0.5) * 6]);
  const peel = frames(opts.swarm_peel);
  // ---- the PICK UP felt print and the floating prize card
  const pick = since(opts.pickup, f);
  const pickOn = Number.isFinite(pick) ? Math.min(1, pick / 8) : 0;
  const pickTex = canvasTexture('felt_pickup', 1024, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    drawText(ctx, 'PICK UP', w / 2, h / 2, h * 0.7, '#ffd36b', {maxW: w * 0.9});
  });
  const fillI = black ? 0.04 : night ? 0.32 : 0.75;
  return (
    <group>
      <SetLight sky={P.sky} ground="#2a1446" fill={fillI} key={night ? '#ffc98a' : '#ffe2b8'} keyI={black ? 0 : (night ? 0.2 : 0.5) + 1.4 * lamp} keyPos={[1.5, 10, 2.5]}
        target={[0, 0, 0]} shadowSize={8} fog={black ? '#000000' : night ? '#0b0614' : '#14123a'} fogNear={11} fogFar={34} bg={black ? '#000000' : night ? '#07040e' : '#0d0b24'} />
      <spotLight position={[lampPos[0], 6.6, lampPos[2]]} target-position={[lampPos[0] * 0.6, 0, lampPos[2] * 0.6]} angle={0.5} penumbra={0.55} color={P.lamp}
        intensity={(night ? 190 : 140) * lamp} distance={16} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0006} />
      {black ? null : <mesh position={[0, 6, -14]}><planeGeometry args={[60, 24]} /><meshBasicMaterial map={backdrop} toneMapped={false} fog={false} /></mesh>}
      <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon(P.floor)} receiveShadow><planeGeometry args={[70, 50]} /></mesh>
      {[[-9, 1], [8, 2], [-6, 3], [10, 4], [-12, 5]].map(([x, s]) => <Kelp key={s} pos={[x, -2.2, -7 - rnd(s) * 3]} h={7 + rnd(s + 1) * 3} f={f} seed={s} c={night ? '#123f48' : '#1d5b66'} w={0.4} />)}
      <Rock pos={[-10, -1.6, -4]} size={[2.4, 1.6, 2]} seed={21} c="#2e2556" />
      <Rock pos={[11, -1.7, -5]} size={[3, 1.4, 2.2]} seed={22} c="#2e2556" />
      <Bubbles pos={[-7, -2.2, -3]} f={f} n={16} h={12} spread={0.6} seed={33} size={0.08} />
      <RBox size={[13, 0.3, 9]} pos={[0, -0.15, 0]} r={0.08} c={P.felt} />
      {[[0, 4.65, 13.6, 0.5], [0, -4.65, 13.6, 0.5]].map(([x, z, w, d], i) => <RBox key={i} size={[w, 0.42, d]} pos={[x, 0.02, z]} r={0.2} c={P.rim} />)}
      {[[6.65, 0], [-6.65, 0]].map(([x], i) => <RBox key={i} size={[0.5, 0.42, 9.8]} pos={[x, 0.02, 0]} r={0.2} c={P.rim} />)}
      <mesh position={[0, 0.05, 4.4]} material={toon(GOLD)}><boxGeometry args={[12.9, 0.03, 0.03]} /></mesh>
      <RBox size={[1.4, 2.0, 1.4]} pos={[0, -1.2, 0]} r={0.2} c="#24163a" />
      <mesh position={[0, 0.006, 1.6]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <planeGeometry args={[9, 3]} />
        <meshToonMaterial transparent map={canvasTexture('felt_print', 1024, 340, (ctx, w, h) => {
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = 'rgba(214,190,120,0.75)'; ctx.lineWidth = 6;
          ctx.beginPath(); ctx.ellipse(w / 2, -h * 1.1, w * 0.48, h * 1.95, 0, 0.12 * Math.PI, 0.88 * Math.PI); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(w / 2, -h * 1.1, w * 0.44, h * 1.78, 0, 0.14 * Math.PI, 0.86 * Math.PI); ctx.stroke();
        })} />
      </mesh>
      {pickOn > 0 ? (
        <mesh position={[0, 0.012, 2.3]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}><planeGeometry args={[5, 1.25]} />
          <meshBasicMaterial map={pickTex} transparent opacity={pickOn * (0.8 + 0.2 * Math.sin(f / 3))} toneMapped={false} depthWrite={false} /></mesh>
      ) : null}
      {/* the lamp: at night the tank's caged work lamp on its cable */}
      <group position={[lampPos[0], 7.2, lampPos[2]]} rotation={[0, 0, sw]}>
        <mesh position={[0, 3, 0]} material={toon('#151022')}><cylinderGeometry args={[0.03, 0.03, 6, 6]} /></mesh>
        <mesh material={toon(night ? '#2b2340' : '#1f6b52', '#000000')} castShadow><coneGeometry args={[1.3, 0.9, 32, 1, true]} /></mesh>
        {night ? Array.from({length: 8}, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <mesh key={i} position={[Math.cos(a) * 0.55, -0.55, Math.sin(a) * 0.55]} material={toon('#5b5170')}><boxGeometry args={[0.05, 0.8, 0.05]} /></mesh>;
        }) : null}
        <mesh position={[0, -0.25, 0]}><sphereGeometry args={[0.32, 16, 12]} /><meshBasicMaterial color={lamp > 0.2 ? '#fff1cc' : '#3d3328'} toneMapped={false} /></mesh>
        {Number.isFinite(cf) && cf >= 10 ? <Coin pos={[0.2, -0.6, 0.3]} rot={[1.2, 0.3, 0.2]} scale={5.5} /> : null}
      </group>
      {black ? null : <Beam pos={[lampPos[0], 3.6, lampPos[2]]} len={7} r={3.6} c="#ffe7bf" opacity={(night ? 0.11 : 0.08) * lamp} />}
      {opts.pool && lamp > 0 ? (
        <mesh position={[lampPos[0] * 0.6, 0.015, lampPos[2] * 0.6]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}><planeGeometry args={[4.2, 4.2]} />
          <meshBasicMaterial map={blobTexture('#ffcf8a')} transparent opacity={0.35 * lamp} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} /></mesh>
      ) : null}
      {sparks}
      {opts.king_float ? (
        <Card pos={[0, 1.6 + 0.15 * Math.sin(f / 10), 2.0]} rot={[0.1, f * 0.06, 0]} rank="K" sprite={king} crop={[0.02, 0.46]} scale={0.6} />
      ) : null}
      {opts.king_held ? <Card pos={[0.35, 0.95, 0.35]} rot={[0.2, -0.3, 0.1]} rank="K" sprite={king} crop={[0.02, 0.46]} scale={0.45} /> : null}
      {kingCard}
      {sgOne > 0 ? <mesh position={[-1.6, CARD_H / 2 + 0.01, -1.15]} rotation={[0, 0.18, 0]}><planeGeometry args={[1.2, 1.8]} />
        <meshBasicMaterial map={blobTexture('#9b5cff')} transparent opacity={0.9 * sgOne} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} /></mesh> : null}
      {house}
      {chips}
      {Array.from({length: 7}, (_, i) => <Card key={`d${i}`} pos={[-2.6, 0.02 + i * 0.032, 0.8]} rot={[-Math.PI / 2, 0, 0.3 + i * 0.01]} back />)}
      {opts.pair ? (
        <group>
          <Card pos={[-1.7, CARD_H / 2 + 0.01, 0.6]} rot={[0, 0.5, 0]} rank="K" sprite={king} crop={[0.02, 0.46]} />
          <Card pos={[1.7, CARD_H / 2 + 0.01, 0.6]} rot={[0, -0.5, 0]} rank="K" sprite={king} crop={[0.02, 0.46]} />
        </group>
      ) : null}
      {opts.swarm ? <RaySwarm center={levels > 0 && !night ? [2.2, topY + 1.0, -1.8] : [0, 1.0, 0]} r={levels > 0 && !night ? 1.05 : 1.6} n={9} f={f} /> : null}
      {opts.dealt ? Array.from({length: 5}, (_, i) => <Card key={`x${i}`} pos={[-3 + i * 1.5, 0.02, 3.0]} rot={[-Math.PI / 2, 0, (rnd(i) - 0.5) * 0.3]} back />) : null}
      {dealt}
      {Array.isArray(opts.pile) ? (
        <group position={opts.pile as P3}>
          {Array.from({length: 26}, (_, i) => <Card key={i} pos={[(rnd(i + 80) - 0.5) * 2.2, 0.05 + rnd(i + 81) * 0.9 * (1 - Math.abs(rnd(i + 80) - 0.5)), (rnd(i + 82) - 0.5) * 1.6]}
            rot={[-Math.PI / 2 + (rnd(i + 83) - 0.5) * 1.4, rnd(i + 84) * 3, (rnd(i + 85) - 0.5) * 1.2]} back={i % 3 !== 0} rank="K" sprite={i % 3 === 0 ? king : undefined} />)}
        </group>
      ) : null}
      {sgAll ? scatter.map((p, i) => (
        <group key={`sg${i}`}>
          <Card pos={p} rot={[-Math.PI / 2, 0, rnd(i + 62) * 3]} rank="A" />
          <mesh position={[p[0], 0.06, p[2]]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.6, 1.6]} />
            <meshBasicMaterial map={blobTexture('#9b5cff')} transparent opacity={0.6 + 0.3 * Math.sin(f / 6 + i)} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} /></mesh>
        </group>
      )) : null}
      {peel.map((t0, i) => {
        const d = f - t0;
        if (d < 0) return null;
        const t = Math.min(1, d / 24), p = scatter[i % scatter.length];
        return <RaySwarm key={`pe${i}`} center={[p[0] * (1 - t), 0.1 + 1.0 * ease('out', t), p[2] * (1 - t)]} r={0.01} n={1} f={f + i * 7} size={0.32} />;
      })}
      {coinShot}{coinRoll}{coinSpin}
    </group>
  );
};
