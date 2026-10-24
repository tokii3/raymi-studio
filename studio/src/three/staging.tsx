// Stagings: a picture that ASSEMBLES around her on the beat and flies away again (toki 2026-10-24, Watch Me: "es fliegen
// Assets wie Schrift, Hintergrund etc ins Bild, sodass es aussieht wie ein Magazin mit Raymi als Cover, sie macht 2-3
// coole Posen on beat ... bevor die Teile wegfliegen"). One part for every video: any set draws <Stagings opts={opts}>
// and a shot lists `"stage": [{kind, at, out, pos, ...}]` (song seconds, marks - raymi/timeline.py NESTED_OPTS).
//   cover     a magazine cover: back card behind her, masthead above her head, cover lines at her sides, barcode
//   frame     a gold picture frame closing around her + a brass plaque ("the Louvre gon' hang it")
//   forecast  a weather card "100 % chance of slay" beside her + a hurricane spiral turning around her feet
//   radar     a radar disc on the floor under her, the sweep passing her blip on the beat
// Every piece keeps clear of her body by construction: back pieces stand >= 0.5 m behind her, front pieces only above
// her head (standing head top ~1.62 m at 1.55 m) or beside her shoulders - never across her (Beach: "clippt rein").
import React from 'react';
import * as THREE from 'three';
import {canvasTexture, rnd, toon} from './look';
import {drawText} from './parts';

type V3 = [number, number, number];
type Spec = {kind: string; at: number; out?: number; pos?: V3; h?: number; title?: string; lines?: string[]; text?: string;
  color?: string; paper?: string; ink?: string; seed?: number; side?: number};

const FPS = 30;
const IN = 0.42 * FPS;          // frames a piece needs to fly in (with an overshoot that lands on the beat)
const OUT = 0.32 * FPS;
const STAGGER = 2;              // frames between two pieces: they arrive as a burst, not all at once

const backOut = (t: number) => { const s = 1.70158; const x = t - 1; return 1 + (s + 1) * x * x * x + s * x * x; };
const easeIn = (t: number) => t * t * t;

/** 0 = away, 1 = in place; >1 / <0 never. k = the piece's order in the burst. */
function phase(f: number, at: number, out: number | undefined, k: number): {v: number; leaving: boolean} {
  const a = (f - at - k * STAGGER) / IN;
  if (a <= 0) return {v: 0, leaving: false};
  if (out !== undefined && f >= out + k * STAGGER * 0.5) {
    const b = Math.min(1, (f - out - k * STAGGER * 0.5) / OUT);
    return {v: 1 - easeIn(b), leaving: true};
  }
  return {v: Math.min(1.08, backOut(Math.min(1, a))), leaving: false};
}

/** A piece flies from `from` (offset in the stage's own frame) to its place, spinning in; leaving it flies on past. */
const Piece: React.FC<{f: number; s: Spec; k: number; place: V3; rot?: V3; from: V3; children: React.ReactNode}> = ({f, s, k, place, rot = [0, 0, 0], from, children}) => {
  const {v, leaving} = phase(f, s.at, s.out, k);
  if (v <= 0.001) return null;
  const away = 1 - Math.min(1, v);
  const dir = leaving ? -1 : 1;
  const p: V3 = [place[0] + from[0] * away * dir, place[1] + from[1] * away, place[2] + from[2] * away * dir];
  const spin = away * (1.4 + rnd(k + (s.seed ?? 0)) * 0.8) * (k % 2 ? 1 : -1);
  return <group position={p} rotation={[rot[0] + spin * 0.3, rot[1] + spin, rot[2] + spin * 0.2]} scale={0.7 + 0.3 * Math.min(1, v)}>{children}</group>;
};

function card(id: string, w: number, h: number, paint: (ctx: CanvasRenderingContext2D, W: number, H: number) => void): THREE.CanvasTexture {
  return canvasTexture(id, Math.round(512 * Math.min(2, w / h)), Math.round(512 * Math.min(2, h / w)), paint);
}

/** A flat printed piece (paper look: matte toon, text in her font). text = qc 'text' for the mask pass. */
const Print: React.FC<{tex: THREE.Texture; w: number; h: number; text?: boolean; glow?: boolean}> = ({tex, w, h, text, glow}) => (
  <mesh userData={text ? {qc: 'text'} : {}} castShadow={false}>
    <planeGeometry args={[w, h]} />
    {glow ? <meshBasicMaterial map={tex} transparent toneMapped={false} side={THREE.DoubleSide} />
      : <meshToonMaterial map={tex} transparent side={THREE.DoubleSide} />}
  </mesh>
);

const Cover: React.FC<{f: number; s: Spec}> = ({f, s}) => {
  const H = s.h ?? 2.3, W = H * 0.76;
  const accent = s.color ?? '#ff3d7f', paper = s.paper ?? '#f3ede2', ink = s.ink ?? '#16121f';
  const id = `${s.title}|${(s.lines ?? []).join('|')}|${accent}|${paper}`;
  const back = card(`cv_back${id}`, W, H, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, paper); g.addColorStop(1, new THREE.Color(paper).lerp(new THREE.Color(accent), 0.35).getStyle());
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.12; ctx.fillStyle = accent;                                  // big soft shapes: depth, not noise
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(w * rnd(i + 3), h * (0.3 + 0.6 * rnd(i + 9)), w * (0.18 + 0.2 * rnd(i)), 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = ink; ctx.lineWidth = w * 0.012; ctx.strokeRect(w * 0.03, h * 0.02, w * 0.94, h * 0.96);
  });
  const mast = card(`cv_mast${s.title}${accent}`, W, H * 0.2, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    drawText(ctx, s.title ?? 'WATCH ME', w / 2, h * 0.55, h * 0.9, accent, {outline: ink, ow: h * 0.09, maxW: w * 0.96});
  });
  const lines = s.lines ?? ['THE SLAY ISSUE', '100% CHANCE'];
  const line = (t: string, i: number) => card(`cv_line${t}${accent}${i}`, W * 0.34, H * 0.12, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = i % 2 ? accent : ink; ctx.fillRect(0, h * 0.08, w * 0.06, h * 0.84);
    drawText(ctx, t, w * 0.54, h * 0.5, h * 0.42, i % 2 ? ink : accent, {outline: paper, ow: h * 0.06, maxW: w * 0.86});
  });
  const code = card('cv_code', 0.3, 0.18, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
    for (let x = 6; x < w - 6; x += 3 + Math.floor(rnd(x) * 5)) { ctx.fillStyle = ink; ctx.fillRect(x, 6, 1 + Math.floor(rnd(x + 1) * 3), h * 0.7); }
  });
  return (
    <>
      <Piece f={f} s={s} k={0} place={[0, H / 2, -0.62]} from={[0, 0.2, -4]}><Print tex={back} w={W} h={H} /></Piece>
      <Piece f={f} s={s} k={1} place={[0, H * 0.88, 0.32]} from={[0, 3, 1]}><Print tex={mast} w={W * 1.02} h={H * 0.2} text /></Piece>
      {lines.slice(0, 4).map((t, i) => (
        <Piece key={i} f={f} s={s} k={2 + i} place={[(i % 2 ? 1 : -1) * W * 0.36, H * (0.56 - 0.13 * Math.floor(i / 2)), 0.28]}
          rot={[0, (i % 2 ? -1 : 1) * 0.12, 0]} from={[(i % 2 ? 1 : -1) * 3.5, 0.5, 0.5]}>
          <Print tex={line(t, i)} w={W * 0.34} h={H * 0.12} text />
        </Piece>
      ))}
      <Piece f={f} s={s} k={6} place={[W * 0.38, H * 0.08, 0.2]} from={[2, -1, 0]}><Print tex={code} w={0.3} h={0.18} /></Piece>
    </>
  );
};

const Frame: React.FC<{f: number; s: Spec}> = ({f, s}) => {
  const H = s.h ?? 2.2, W = H * 0.72, t = 0.16;
  const gold = s.color ?? '#d9a441';
  const plaque = card(`fr_pl${s.text}`, 0.5, 0.16, (ctx, w, h) => {
    ctx.fillStyle = '#c8a25a'; ctx.fillRect(0, 0, w, h);
    drawText(ctx, s.text ?? 'RAYMI, 2026 - deep sea', w / 2, h / 2, h * 0.42, '#2a1a08', {maxW: w * 0.9});
  });
  const bar = (k: number, pos: V3, size: V3, from: V3) => (
    <Piece key={k} f={f} s={s} k={k} place={pos} from={from}>
      <mesh material={toon(gold, '#5a3a08', 0.25)} castShadow><boxGeometry args={size} /></mesh>
      <mesh position={[0, 0, size[2] / 2 + 0.003]} material={toon(new THREE.Color(gold).multiplyScalar(0.7).getStyle())}>
        <boxGeometry args={[size[0] * 0.8, size[1] * 0.8, 0.01]} /></mesh>
    </Piece>
  );
  // the frame stands in a plane 0.35 m in front of her: its opening is bigger than her figure on every side
  return (
    <>
      <Piece f={f} s={s} k={0} place={[0, H / 2, -0.7]} from={[0, 0, -4]}>
        <mesh material={toon(s.paper ?? '#5a1424')}><planeGeometry args={[W, H]} /></mesh>
      </Piece>
      {bar(1, [0, H + t / 2, 0.35], [W + 2 * t, t, 0.1], [0, 3, 0])}
      {bar(2, [0, -t / 2 + 0.02, 0.35], [W + 2 * t, t, 0.1], [0, -2, 0])}
      {bar(3, [-W / 2 - t / 2, H / 2, 0.35], [t, H, 0.1], [-3, 0, 0])}
      {bar(4, [W / 2 + t / 2, H / 2, 0.35], [t, H, 0.1], [3, 0, 0])}
      <Piece f={f} s={s} k={5} place={[0, -0.22, 0.42]} from={[0, -1.5, 1]}><Print tex={plaque} w={0.5} h={0.16} text /></Piece>
    </>
  );
};

const Forecast: React.FC<{f: number; s: Spec}> = ({f, s}) => {
  const side = s.side ?? 1;
  const accent = s.color ?? '#3fd0ff';
  const tex = card(`fc_card${s.text}${accent}`, 1.0, 0.7, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#0d2a52'); g.addColorStop(1, '#16114a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = accent; ctx.lineWidth = 8; ctx.strokeRect(10, 10, w - 20, h - 20);
    drawText(ctx, '100%', w / 2, h * 0.38, h * 0.36, '#ffffff', {outline: accent, ow: 6, maxW: w * 0.8});
    drawText(ctx, s.text ?? 'CHANCE OF SLAY', w / 2, h * 0.74, h * 0.15, accent, {maxW: w * 0.86});
  });
  const {v} = phase(f, s.at, s.out, 3);
  return (
    <>
      <Piece f={f} s={s} k={0} place={[side * 1.05, 1.25, 0.1]} rot={[0, -side * 0.35, 0]} from={[side * 3, 1, 0]}><Print tex={tex} w={1.0} h={0.7} text /></Piece>
      {v > 0 ? (
        // the hurricane: a flat spiral of cloud bands turning around her feet, never above her knees
        <group position={[0, 0.03, 0]} rotation={[0, -f * 0.12, 0]} scale={Math.min(1, v)}>
          {Array.from({length: 3}, (_, i) => (
            <mesh key={i} rotation={[-Math.PI / 2, 0, (i * Math.PI * 2) / 3]} userData={{noSupport: true}}>
              <ringGeometry args={[0.55 + i * 0.12, 1.5 + i * 0.25, 48, 1, 0, Math.PI * 1.1]} />
              <meshBasicMaterial color={i === 1 ? accent : '#e9f6ff'} transparent opacity={0.5 - i * 0.1} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ) : null}
    </>
  );
};

const Radar: React.FC<{f: number; s: Spec}> = ({f, s}) => {
  const accent = s.color ?? '#5dff9a';
  const {v} = phase(f, s.at, s.out, 0);
  if (v <= 0) return null;
  const sweep = ((f - s.at) / FPS) * Math.PI * 2 * 0.5;
  const disc = canvasTexture(`radar${accent}`, 512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = accent; ctx.globalAlpha = 0.7; ctx.lineWidth = 3;
    for (let r = 1; r <= 4; r++) { ctx.beginPath(); ctx.arc(w / 2, h / 2, (r / 4) * w * 0.48, 0, 7); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
  });
  return (
    <group position={[0, 0.02, 0]} scale={Math.min(1, v)} userData={{noSupport: true}}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[3.2, 3.2]} />
        <meshBasicMaterial map={disc} transparent depthWrite={false} toneMapped={false} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, -sweep]} position={[0, 0.005, 0]}>
        <ringGeometry args={[0.05, 1.55, 48, 1, 0, 0.5]} />
        <meshBasicMaterial color={accent} transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} /></mesh>
    </group>
  );
};

const KINDS: Record<string, React.FC<{f: number; s: Spec}>> = {cover: Cover, frame: Frame, forecast: Forecast, radar: Radar};

/** Every staging of the shot, each turned to face the lens around its mark (her place). */
export const Stagings: React.FC<{opts: Record<string, unknown>; f: number; camPos?: V3}> = ({opts, f, camPos = [0, 1.4, 4]}) => {
  const list = (Array.isArray(opts.stage) ? opts.stage : opts.stage ? [opts.stage] : []) as Spec[];
  if (!list.length) return null;
  return (
    // noSupport: nothing stands on a staging; stage: the probe still measures her against it, the mask paints it
    <group userData={{noSupport: true, stage: true}}>
      {list.map((s, i) => {
        const K = KINDS[s.kind];
        if (!K) return null;
        const p = s.pos ?? [0, 0, 0];
        // the stage faces the lens in the ground plane (a cover is upright, it never tilts with a dutch camera)
        const yaw = Math.atan2(camPos[0] - p[0], camPos[2] - p[2]);
        return <group key={i} position={p} rotation={[0, yaw, 0]}><K f={f} s={s} /></group>;
      })}
    </group>
  );
};
