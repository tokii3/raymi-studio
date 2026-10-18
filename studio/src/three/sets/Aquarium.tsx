// SET aquarium - "The Star Exhibit": a public aquarium tank as Raymi's stage and cage. Built only (rocks, sand, kelp,
// coral, toy castle, clam throne, bottle-cap crown, glass, visitor silhouettes with phones). Marks + cameras in
// sets.json. Options: flashes (phones flash on music hits), dim (0..1 hall + tank lights going out), crowd (count),
// led (text on the LED board above the glass), warning (true = DO NOT TAP THE GLASS sign).
// Timed options (film frames, compiled from song seconds): flash_beats ('beats': phones flare on every beat),
// flash_seq (bigger flares), crowd_look ([[f, 'left'|'right'|'center']]: heads turn in a wave), phones_up,
// crowd_in / crowd_out (waves of visitors arrive / leave), hall_lights / banks_off (the hall's light banks switch on /
// bang off; 'all' = dark), led_flip (letters light one by one), led_blink (the board blinks), chute (the wish chute),
// bury: [x, y, z] + bury_h (a sand mound she hid in; burst: [x, y, z] + burst_at = the mound blows apart).
// Story props: phone [x,y,z] (hero phone), taps (knuckle on the glass) + warning_flash, hands [fade from, to] (frames),
// screens_crop (each phone a different piece of her), coin_drop / coin_rain / coin_pile, deck_ledge + deck_tip /
// deck_slide, card_rain [a, b], cards 'scattered', king_up [x,y,z], dead_lamp, salmon 'glass'|'near'|'behind' +
// salmon_arrive [a, b] + salmon_coin, cap_lift (the cap rises off its pebble), child [x,y,z] (a small waving visitor).
import React from 'react';
import * as THREE from 'three';
import {Beam, Bubbles, Caustics, Coral, Ground, Kelp, RBox, Rock, Sign, Visitor, drawText} from '../parts';
import {BottleCap, Fish, LightBank, SandMound, ShellThrone, Stanchions, ToyCastle, WishChute} from '../props';
import {flare, frames, passed, since, stepValue} from '../events';
import {CardRain, Coin, GlassHands, HeroPhone, KnuckleTap, LedgeDeck, Salmon, ScatteredDeck, WorkLamp} from '../aquarium_props';
import {Card} from '../cards';
import {SetLight, canvasTexture, rnd, toon, useScreenCrops, useScreenTexture} from '../look';
import type {SetProps} from './index';

const SAND = '#a98bc4',   // a deeper sand: the bright lavender floor washed every frame out (toki: blass)
      ROCK = '#5b4a8c', ROCK2 = '#3f3577', KELP = '#2f8f86', KELP2 = '#1f6f78';
const HALL = '#191233', PEOPLE = '#231b4a', FRAME = '#2a1f45';

export const Aquarium: React.FC<SetProps> = ({f, opts, hits, beats, camPos}) => {
  const dim = Number(opts.dim ?? 0);
  const crowd = Number(opts.crowd ?? 14);
  const flashes = opts.flashes !== false;
  const led = String(opts.led ?? 'STAR EXHIBIT');   // '' = a blank board (a lyric is written on it)
  const on = 1 - dim;
  const screen = useScreenTexture(opts.screens ? String(opts.screens) : null);   // the phones film HER
  const crops = useScreenCrops(opts.screens_crop && opts.screens ? String(opts.screens) : null);   // each phone a piece of her
  // pa pa pa: on each hit 3 seeded phones flash for 4 frames
  const forced = Number(opts.flash ?? 0);            // a held flash moment (key frames): that share of phones fires
  const onBeats = opts.flash_beats === 'beats';       // chorus: local flares on every beat (max ~2.7 / s, flash-safe)
  const seq = frames(opts.flash_seq);
  const flashOf = (i: number) => {
    if (forced > 0 && rnd(i * 7 + 3) < forced) return 1;
    for (const t of seq) { const d = f - t; if (d >= 0 && d < 6 && rnd(t * 5 + i) < 0.4) return 1 - d / 6; }
    if (onBeats) for (const b of beats) { const d = f - b; if (d >= 0 && d < 4 && rnd(b * 17 + i) < 0.14) return 1 - d / 4; }
    if (!flashes) return 0;
    for (const h of hits) {
      const d = f - h;
      if (d >= 0 && d < 5 && rnd(h * 13 + i) < 0.28) return 1 - d / 5;
    }
    return 0;
  };
  // where the crowd looks: a wave of heads after each cue (staggered per visitor)
  const LOOK: Record<string, number> = {left: -1, right: 1, center: 0};
  const lookOf = (i: number) => {
    const st = stepValue<string>(opts.crowd_look, f - Math.floor(rnd(i + 31) * 5), 5);
    if (st.to === null) return 0;
    const a = st.from === null ? 0 : LOOK[st.from] ?? 0, b = LOOK[st.to] ?? 0;
    return a + (b - a) * st.t;
  };
  // waves of visitors: visitor i belongs to wave i % n; it slides in after its wave's frame / out after it
  const wIn = frames(opts.crowd_in), wOut = frames(opts.crowd_out);
  const presence = (i: number): number => {          // 0 = gone, 1 = at the rope; negative = walking away
    let p = 1;
    if (wIn.length) { const t = wIn[i % wIn.length]; p = Math.min(1, Math.max(0, (f - t) / 12)); }
    if (wOut.length) { const t = wOut[i % wOut.length] + Math.floor(rnd(i + 77) * 4); if (f >= t) p = -Math.min(1, (f - t) / 14); }
    return p;
  };
  const banks = [3.4, 5.2, 7.0];
  const lightsOn = opts.hall_lights !== undefined ? Math.min(banks.length, passed(opts.hall_lights, f)) : banks.length;
  const off = Math.min(banks.length, passed(opts.banks_off, f, banks.length));
  const bankOff = frames(opts.banks_off);
  const ledText = led;
  const flipN = opts.led_flip !== undefined ? passed(opts.led_flip, f) : null;
  const flips = frames(opts.led_flip).length;
  const ledShown = flipN === null ? ledText : ledText.slice(0, Math.round((ledText.length * flipN) / Math.max(1, flips)));
  const ledOff = since(opts.led_blink, f) < 5;
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
      <SetLight sky={on ? '#6fd2e8' : '#2a2a6a'} ground="#2a0f5c" fill={0.4 + 0.5 * on} key="#e9fbff" keyI={2.4 * on + 0.2} keyPos={[-2.5, 9, 3]}
        target={[0, 0, -0.8]} shadowSize={7} fog="#140f3a" fogNear={7} fogFar={24} bg="#120d2b" />
      <pointLight position={[0, 2.2, 1.0]} color="#7ff0ff" intensity={14 * on + 1} distance={9} decay={1.6} />
      <spotLight position={[-0.6, 4.6, -0.2]} target-position={[-0.6, 0.4, -1.0]} angle={0.42} penumbra={0.7} color="#ffd1f2"
        intensity={60 * (opts.spot === false ? 0 : 1) * (0.25 + 0.75 * on)} distance={9} castShadow />

      {/* ---- the tank: sand, back wall, rocks, life */}
      <Ground size={[11, 6.4]} pos={[0, 0, -1.2]} c={SAND} dunes={0.06} />
      <mesh position={[0, 3.0, -4.3]}><planeGeometry args={[16, 9]} /><meshBasicMaterial map={backdrop} color={new THREE.Color(1, 1, 1).multiplyScalar(1 - 0.88 * dim)} toneMapped={false} fog={false} /></mesh>
      {/* the water surface seen from below + the tank's side walls (a low camera never looks into a void) */}
      <mesh position={[0, 4.3, -1.3]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 6.2]} />
        {/* seen from BELOW only: a lens above the open tank looks clean through the water (pilot 2 looked blurred) */}
        <meshBasicMaterial map={surface} color={new THREE.Color(1, 1, 1).multiplyScalar(1 - 0.85 * dim)} toneMapped={false} side={THREE.FrontSide} />
      </mesh>
      {[-5.35, 5.35].map((x) => <RBox key={x} size={[0.3, 4.6, 6.2]} pos={[x, 2.1, -1.3]} r={0.05} c="#2a2357" cast={false} />)}
      {[[-4.2, 0.6, -3.6, 1.6, 1.4, 1.1, 1], [-2.6, 0.4, -3.9, 1.3, 1.0, 0.9, 2], [3.6, 0.7, -3.6, 1.7, 1.6, 1.2, 3], [1.4, 0.35, -3.9, 1.2, 0.8, 0.8, 4],
        [4.6, 0.3, -1.0, 0.9, 0.7, 0.9, 5], [-4.7, 0.3, -0.8, 0.8, 0.6, 0.8, 6], [-0.1, 0.25, -3.6, 0.9, 0.55, 0.7, 7]].map(([x, y, z, sx, sy, sz, s]) => (
        <Rock key={s} pos={[x, y, z]} size={[sx, sy, sz]} seed={s} c={s % 2 ? ROCK : ROCK2} rotY={s} />
      ))}
      {/* throne: a flat rock base, the open clam as backrest, a sea-glass gem */}
      <Rock pos={[-0.6, 0.16, -1.15]} size={[0.95, 0.32, 0.62]} seed={11} c={ROCK} />
      <ShellThrone pos={[-0.6, 0.0, -1.3]} scale={1.15} />
      {(opts.crown === 'head' || typeof opts.crown_from === 'number') && !(typeof opts.crown_from === 'number' && f < opts.crown_from)
        && !(typeof opts.cap_off === 'number' && f >= opts.cap_off + 12) ? null : opts.cap === 'seat'
        ? <BottleCap pos={[-0.6, 0.48, -1.08]} rot={[0.25, 0.5, -0.1]} scale={1.5} />
        : opts.cap === false ? null : <BottleCap pos={[0.25, 0.42 + (typeof opts.cap_lift === 'number' && f >= opts.cap_lift ? Math.min(0.5, (f - opts.cap_lift) * 0.012) : 0), -1.25]}
          rot={[0.1, 0.4 + (typeof opts.cap_lift === 'number' && f >= opts.cap_lift ? (f - opts.cap_lift) * 0.05 : 0), -0.25]} scale={1.2} />}
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
      <Sign id={`led${ledShown}|${ledOff}|${ledText}`} pos={[0, 4.95, 2.13]} size={[4.6, 0.5]} glow frame="#130e26" paint={(ctx, w, h) => {
        ctx.fillStyle = '#0d0920'; ctx.fillRect(0, 0, w, h);
        if (ledOff) return;
        ctx.font = `${h * 0.62}px Raymi`;
        const full = ctx.measureText(ledText).width, px = full > w * 0.92 ? (h * 0.62 * w * 0.92) / full : h * 0.62;
        ctx.font = `${px}px Raymi`;
        const x0 = w / 2 - ctx.measureText(ledText).width / 2;
        drawText(ctx, ledText, x0, h / 2, px, '#3a2a18', {align: 'left'});          // unlit letters stay readable as bulbs
        if (ledShown) drawText(ctx, ledShown, x0, h / 2, px, '#ffcf6b', {align: 'left'});
      }} />
      {Array.isArray(opts.bury) ? <SandMound pos={opts.bury as [number, number, number]} h={Number(opts.bury_h ?? 0.2)} f={f} /> : null}
      {Array.isArray(opts.burst) ? <SandMound pos={opts.burst as [number, number, number]} h={Number(opts.bury_h ?? 0.2)} f={f}
        burst={typeof opts.burst_at === 'number' ? Math.max(0, (f - opts.burst_at) / 10) : 0} /> : null}
      {Array.isArray(opts.phone) ? <HeroPhone pos={opts.phone as [number, number, number]} screen={screen} flash={flashOf(0)} /> : null}
      {opts.taps !== undefined ? <KnuckleTap pos={[1.25, 1.35, 1.95]} d={since(opts.taps, f)} big={1.4} /> : null}
      {opts.warning !== false && (opts.warning_flash !== undefined) ? (
        <mesh position={[2.1, 0.55, 1.68]} renderOrder={9}><planeGeometry args={[1.0, 0.6]} />
          <meshBasicMaterial color="#ff3b4e" transparent opacity={0.75 * flare(opts.warning_flash === true ? opts.taps : opts.warning_flash, f, 6)}
            depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} /></mesh>
      ) : null}
      {Array.isArray(opts.hands) ? <GlassHands pos={[0.9, 1.5, 1.66]}
        fade={Math.max(0, Math.min(1, (f - (opts.hands as number[])[0]) / Math.max(1, (opts.hands as number[])[1] - (opts.hands as number[])[0])))} /> : null}
      {typeof opts.coin_drop !== 'undefined' ? (() => {
        const d = since(opts.coin_drop, f);
        if (!Number.isFinite(d)) return null;
        const t = Math.min(1, d / 24), u = Math.max(0, Math.min(1, (d - 24) / 12));
        const p: [number, number, number] = t < 1 ? [-3.6, 3.95 - 3.7 * t, 1.5 - 0.6 * t] : [-3.6 + 0.3 * u, 0.25 - 0.22 * u, 0.9 - 0.2 * u];
        return <Coin pos={p} rot={[d * 0.5, 0, d * 0.3]} scale={1.3} />;
      })() : null}
      {opts.coin_rain !== undefined ? frames(opts.coin_rain).flatMap((t0, k) => Array.from({length: 7}, (_, i) => {
        const d = f - t0 - i * 2;
        if (d < 0) return null;
        const t = Math.min(1, d / 26);
        return <Coin key={`${k}-${i}`} pos={[-0.6 + (rnd(i + k * 9) - 0.5) * 2.4, 4.2 - 4.15 * t, -0.6 + (rnd(i + k * 9 + 4) - 0.5) * 1.6]}
          rot={t < 1 ? [d * 0.4, i, d * 0.2] : [Math.PI / 2, 0, i]} scale={1.3} />;
      })) : null}
      {opts.coin_pile ? Array.from({length: 9}, (_, i) => <Coin key={`p${i}`} pos={[-0.15 + (i % 3) * 0.02, 0.02 + i * 0.019, -0.55]} rot={[Math.PI / 2, 0, i]} scale={1.3} />) : null}
      {opts.deck_ledge ? <LedgeDeck pos={[-3.6, 3.83, 2.18]} f={f} tip={typeof opts.deck_tip === 'number' ? opts.deck_tip : undefined}
        slide={typeof opts.deck_slide === 'number' ? opts.deck_slide : undefined} sprite={opts.screens ? String(opts.screens) : undefined} /> : null}
      {opts.card_rain !== undefined ? <CardRain center={[0, 0, -0.5]} f={f} a={frames(opts.card_rain)[0]} b={frames(opts.card_rain)[1] ?? frames(opts.card_rain)[0] + 60}
        sprite={opts.screens ? String(opts.screens) : undefined} /> : null}
      {opts.cards === 'scattered' ? <ScatteredDeck center={[0.2, 0, -0.4]} sprite={opts.screens ? String(opts.screens) : undefined} /> : null}
      {Array.isArray(opts.king_up) ? <Card pos={opts.king_up as [number, number, number]} rot={[-Math.PI / 2, 0, 0.2]} scale={0.12} rank="K"
        sprite={opts.screens ? String(opts.screens) : undefined} /> : null}
      {/* the tank's night-service work lamp: hangs dark by day (planted, KING script-critic 3), dead with the coin after the night */}
      {opts.dead_lamp || opts.work_lamp ? <WorkLamp pos={[0.9, 3.5, -0.7]} coin={!!opts.dead_lamp} on={opts.work_lamp === 'on' ? 1 : 0} swing={0.03 * Math.sin(f / 40)} /> : null}
      {opts.felt_mat && opts.card_rain !== undefined ? (() => {           // the deck's little play mat sinks with the cards
        const t = Math.max(0, Math.min(1, (f - frames(opts.card_rain)[0]) / 110));
        return t > 0 ? <mesh position={[0.6 + Math.sin(t * 6) * 0.4, 4.0 - 3.96 * t, -0.9]} rotation={[-Math.PI / 2 + (1 - t) * 0.6 * Math.sin(t * 9), 0, t * 2]}>
          <planeGeometry args={[0.55, 0.38]} /><meshToonMaterial color="#5a1830" side={THREE.DoubleSide} /></mesh> : null;
      })() : null}
      {opts.salmon ? (() => {
        const at: Record<string, [number, number, number]> = {glass: [-2.0, 1.5, 1.15], near: [1.3, 1.7, -0.3], behind: [-0.1, 1.6, -1.7]};
        const p = at[String(opts.salmon)] ?? at.near;
        const arr = frames(opts.salmon_arrive);
        const coin = since(opts.salmon_coin, f);
        return (
          <group>
            <Salmon at={p} f={f} a={arr[0]} b={arr[1]} from={arr.length ? [-5.2, p[1] + 0.4, p[2] - 0.5] : undefined} />
            {coin < 14 ? <Coin pos={[-0.2 + (p[0] + 0.2) * (coin / 14), 0.3 + (p[1] - 0.3) * (coin / 14) + Math.sin((coin / 14) * Math.PI) * 0.6, -0.6 + (p[2] + 0.6) * (coin / 14)]}
              rot={[coin * 0.6, 0, 0]} scale={1.3} /> : null}
          </group>
        );
      })() : null}
      {Array.isArray(opts.child) ? <Visitor pos={opts.child as [number, number, number]} h={1.0} c={PEOPLE} seed={77} f={f} phone={1} flash={0} screen={screen}
        look={0.3 * Math.sin(f / 4)} raise={0.6} /> : null}
      {opts.chute ? <WishChute pos={[-3.6, 4.1, 1.95]} out={[-3.6, 0.25, 0.9]} /> : null}
      {opts.warning !== false ? (
        <Sign id="warn" pos={[2.1, 0.55, 1.62]} size={[0.9, 0.5]} frame="#1b1430" paint={(ctx, w, h) => {
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
      {banks.map((z, k) => (
        <LightBank key={z} z={z} y={6.2} floorY={-0.9} on={k < lightsOn && k >= off ? 1 : 0}
          bang={k < off ? flare(bankOff[k], f, 4) : 0} />
      ))}
      {Array.from({length: crowd}, (_, i) => {
        const pr = presence(i);
        if (pr === 0 || pr <= -1) return null;
        const row = i % 2, x = -5 + ((i * 0.83 + rnd(i) * 0.6) % 10), z = 3.2 + row * 1.1 + rnd(i + 5) * 0.5;
        // the cameraman's space: nobody stands within 1.8 m of the lens (pilot 2: blobs filled the frame)
        if (camPos && Math.hypot(x - camPos[0], z - camPos[2]) < 1.8) return null;
        const away = pr < 0 ? -pr : 1 - pr;                  // walks back into the dark hall
        const phone = opts.phones_up ? 1 : rnd(i + 2) < 0.6 ? 1 : 0;
        return <Visitor key={i} pos={[x + away * (x > 0 ? 1.5 : -1.5), -0.9, z + away * 4]} h={1.55 + rnd(i + 9) * 0.3} c={PEOPLE} seed={i} f={f}
          phone={phone} flash={pr > 0 ? flashOf(i) : 0} screen={crops ? crops[i % crops.length] : screen} look={lookOf(i)} raise={opts.phones_up ? 1 : 0} />;
      })}
    </group>
  );
};

export const AQUARIUM_SIDE = THREE.FrontSide;
