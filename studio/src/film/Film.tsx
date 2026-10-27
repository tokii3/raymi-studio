// The music-video composition: built 3D sets seen through a real camera, Raymi in the space, lyrics as objects,
// transitions through things. MV (1920x1080) and its Short (1080x1920) are the SAME timeline (types.ts) - only the
// frame differs; the camera widens its vertical view for portrait (motion.fovFor).
import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {AbsoluteFill, Audio, cancelRender, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {useRaymiFont} from '../font';
import {grainTile} from '../textures';
import {ReactionIcon} from '../Icons';
import {Stamp} from '../Text';
import {SETS} from '../three/sets';
import {Puppet3D, WhipSmear} from '../three/Puppet3D';
import {Flame, SparkBurst, TossedFlame, fireScale, type FireSpec, type SparkSpec} from '../three/fire';
import {Words3D} from '../three/Words3D';
import {CapCrown} from '../three/props';
import {Card, RaySwarm} from '../three/cards';
import {flare, frames, since, stepValue} from '../three/events';
import {runTo, useTexturesReady} from '../three/look';
import {VrmPuppet, useVrmReady, vrmBones} from '../three/VrmPuppet';
import {Strings} from '../three/routine';
import {makeVrmMouthKeys} from '../three/vrmLipSync';
import {Probe} from './Probe';
import {QcMask} from './QcMask';
import {WorldMotion, worldSpec} from '../three/world';
import {TwoTone, twoToneOn} from './TwoTone';
import {SET_WET, SetFx} from '../three/setfx';
import {vrmFilmKeys, vrmFilmWords} from '../three/vrmFilm';
import {OVERLAY, makeCamera, puppetMatrix, visibleCutEdges} from './check';
import {planeSize, puppetAt} from './motion';
import {Transitions, whipStyle} from './Transitions';
import {Fx2D, Fx2DDefs, fxFilter} from './Fx2D';
import {PovLayer, povFilter, sceneFrame} from './PovFx';
import {PostFX, type PostSpec} from '../three/PostFX';
import type {FilmProps, Shot} from './types';
import {TONES, gradeName, mixTone, type LyricTone, type Tone} from './grade';

export function shotAt(shots: Shot[], f: number): number {
  for (let i = shots.length - 1; i >= 0; i--) if (f >= shots[i].from) return i;
  return 0;
}

const CameraRig: React.FC<{cam: THREE.PerspectiveCamera}> = ({cam}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.copy(cam.position);
    c.quaternion.copy(cam.quaternion);
    c.fov = cam.fov; c.aspect = cam.aspect; c.near = cam.near; c.far = cam.far;
    c.updateProjectionMatrix();
    c.updateMatrixWorld(true);
  });
  return null;
};

/** World point on her figure: u = 0..1 across the sprite, t = 0..1 from the sprite top. */
function figurePoint(shot: Shot, f: number, fps: number, camPos: [number, number, number], u: number, t: number): THREE.Vector3 | null {
  const p = puppetAt(shot.puppets, f, fps);
  if (!p) return null;
  const {w, h} = planeSize(p.key);
  return new THREE.Vector3((u - 0.5) * w, (p.key.feet - t) * h, 0).applyMatrix4(puppetMatrix(p, camPos));
}

export const Film: React.FC<FilmProps> = (props) => {
  const fontReady = useRaymiFont(Boolean(props.heavy));
  const texReady = useTexturesReady(props.vrm ? [] : props.sprites.map((s) => staticFile(s)));
  const vrmReady = useVrmReady(props.vrm ? [staticFile(props.vrm)] : [],
    props.vrm ? (props.motions ?? ['motions/dance.fbx', 'motions/idle.fbx']).map(staticFile) : []);
  const ready = fontReady && texReady && vrmReady;
  const mask = props.qcMask ?? null;   // the QC mask pass: the picture as flat ID colours (raymi/qcv2.py)
  const fNow = useCurrentFrame();
  const {width: W, height: H, fps} = useVideoConfig();
  const mouthWords = useMemo(() => props.sung ?? vrmFilmWords(props.shots, fps), [props.sung, props.shots, fps]);
  // the loudness of her vocal stem per film frame (raymi/timeline.py) opens the mouth wider where she sings loud
  const mouthKeys = useMemo(() => makeVrmMouthKeys(mouthWords, fps, 0, props.durationInFrames, {env: props.mouthEnv ?? null}),
    [mouthWords, fps, props.durationInFrames, props.mouthEnv]);
  const i = shotAt(props.shots, fNow);
  const shot = props.shots[i];
  // a freeze / polaroid holds the 3D world on one frame while the 2D layer above keeps time (PovFx.tsx)
  const f = sceneFrame(shot.fx, fNow);
  // a two-tone frame is TWO values: no grade, bloom or vignette may lift the ink (TwoTone.tsx)
  // the colour flip (Love is War, script v3b): one beat of gold-orange on ink on a measured turn to the minor chord -
  // the world flips, she keeps her values (opts.flip_at song seconds, flip_n frames, flip_light)
  const flipOn = twoToneOn(shot.opts.flip_at, f, Number(shot.opts.flip_n ?? 14));
  // the flood (the last hit A+ / the cold open): the world white-gold, SHE a black silhouette in it (opts.flood [t],
  // flood_n frames, flood_light) - the one place her values give way, on purpose (4_SCRIPT rows 0b, 83)
  const floodOn = twoToneOn(shot.opts.flood, f, Number(shot.opts.flood_n ?? 6));
  const twoOn = flipOn || floodOn || twoToneOn(shot.opts.two_tone, f, Number(shot.opts.two_tone_n ?? 2));
  const ink = String(shot.opts.two_tone_dark ?? '#0b0910');
  const paper = floodOn ? String(shot.opts.flood_light ?? '#fff1d2') : flipOn ? String(shot.opts.flip_light ?? '#f0a03c') : shot.opts.two_tone_light ? String(shot.opts.two_tone_light) : undefined;
  // a 3D shot names her rig keys itself (shots.json "actor"); the 2026-10-21 VRM edition translated sprite keys
  const actorKeys = useMemo(() => shot.actor?.length ? shot.actor : vrmFilmKeys(shot.puppets), [shot]);
  const gain = shot.mouth?.gain ?? 1;
  const shotMouth = useMemo(() => gain === 1 ? mouthKeys : gain <= 0 ? []
    : mouthKeys.map((k) => ({f: k.f, values: Object.fromEntries(Object.entries(k.values).map(([n, v]) => [n, n === 'close' ? v : (v ?? 0) * gain]))})),
  [mouthKeys, gain]);
  const fx = shot.fx ?? [];
  // her battery (opts.battery = [[frame, dots], ...]): the five chest lights + the 2D sign beside her head
  const bat = shot.opts.battery !== undefined ? stepValue<number>(shot.opts.battery, f, 6) : null;
  // chest_dots (POV Shorts): her five chest lights always on; glow_flare (frames) makes them flare (she senses you)
  const dotBoost = flare(shot.opts.glow_flare, f, 8);
  const battery = bat && bat.to !== null ? {n: bat.to, prev: bat.from ?? bat.to, t: bat.t, boost: dotBoost}
    : shot.opts.chest_dots ? {n: 5, prev: 5, t: 1, boost: dotBoost} : null;
  const aspect = W / H;
  const cam = makeCamera(shot, f, aspect, props.hits, fps);
  // fin wave (timeline effects: a real turn of hers): 10 frames of watery distortion, strongest at the start
  const finD = since(shot.opts.finwave, f);
  const fin = finD >= 0 && finD < 10 ? Math.sin((Math.PI * (finD + 1)) / 11) : 0;
  const camPos: [number, number, number] = [cam.position.x, cam.position.y, cam.position.z];
  // motion blur (toki 2026-10-23 "depth und motion blur"): where does the world point at the frame centre go between
  // the previous frame and this one? Its screen travel (px) becomes a directional blur on the 3D layer.
  const blur = (() => {
    if (f <= shot.from) return null;                                // a cut is never blurred across
    const prev = makeCamera(shot, f - 1, aspect, props.hits, fps);
    const p = new THREE.Vector3(0, 0, -4).applyQuaternion(cam.quaternion).add(cam.position);
    const a = p.clone().project(prev), b = p.clone().project(cam);
    const dx = Math.abs(b.x - a.x) * W / 2, dy = Math.abs(b.y - a.y) * H / 2;
    // a camera bridge (timeline.py bridge_cuts: the cut became a fast move, toki 2026-10-25 "... + etwas mehr motion
    // blur") is a travel, not a jump, and smears harder
    const bridging = (shot.bridge ?? 0) > 0 && f - shot.from <= (shot.bridge ?? 0);
    if (!bridging && !(dx < W / 3 && dy < H / 3)) return null;      // a lens JUMP inside a shot (a hold key) is a cut, not a move
    const k = bridging ? 0.7 : Number(shot.opts.motion_blur ?? 0.3);  // share of the travel smeared (look-critic stills 3: 0.45 / 28 px smeared her face and the lyric)
    const cap = bridging ? 40 : 16;
    const sx = Math.min(cap, dx * k), sy = Math.min(cap, dy * k);
    return sx < 1.2 && sy < 1.2 ? null : {sx: sx / 2, sy: sy / 2};
  })();
  // her place on screen (chest height of the current key): the centre of a colour spread
  const herKey = actorKeys.length ? actorKeys.reduce((p, k) => (k.f <= f ? k : p), actorKeys[0]) : null;
  const herNdc = herKey ? new THREE.Vector3(herKey.pos[0], herKey.pos[1] + (herKey.height ?? 1.55) * 0.62, herKey.pos[2]).project(cam) : null;
  const herScreen: [number, number] = herNdc ? [herNdc.x * 0.5 + 0.5, -herNdc.y * 0.5 + 0.5] : [0.5, 0.5];
  // her eyes at ~0.77 of her figure height: the probe measured raymi7's head bone 1.0-1.2 m above her feet in bent clips
  // (Love is War 2026-10-27; 0.9 put the ink crown's hole above her face)
  const headNdc = herKey ? new THREE.Vector3(herKey.pos[0], herKey.pos[1] + (herKey.height ?? 1.55) * 0.77, herKey.pos[2]).project(cam) : null;
  const herHead: [number, number] = headNdc ? [headNdc.x * 0.5 + 0.5, -headNdc.y * 0.5 + 0.5] : [0.5, 0.3];
  const faults = props.vrm ? [] : visibleCutEdges(shot, f, aspect, props.hits, fps);
  if (faults.length) cancelRender(new Error(`cut sprite edge on screen: ${JSON.stringify(faults)} - reframe the shot (hard rule 9)`));
  const Set = SETS[shot.set];
  if (!Set) cancelRender(new Error(`unknown set ${shot.set}`));
  const pose = puppetAt(shot.puppets, f, fps);
  const head = pose ? figurePoint(shot, f, fps, camPos, 0.62, pose.key.top + 0.02) : null;
  // the bottle-cap crown on her head; cap_off (frame) = she takes it off and tosses it back onto its pebble (12 frames)
  const capOff = typeof shot.opts.cap_off === 'number' ? shot.opts.cap_off : Infinity;
  // the crown sits on her HEAD (head box centre), not the sprite centre: leaning poses carry it with them (stills run 14)
  const crownUV = (k: Shot['puppets'][number]): [number, number] => (k.head ? [(k.head[0] + k.head[2]) / 2, k.head[1] + 0.035] : [0.5, k.top + 0.035]);
  // crown_from (frame): she puts it on - before it lies on its pebble, then it drops onto her head with an overshoot
  const crownFrom = typeof shot.opts.crown_from === 'number' ? shot.opts.crown_from : -Infinity;
  const wearing = (shot.opts.crown === 'head' || Number.isFinite(crownFrom)) && f >= crownFrom;
  let crownAt = wearing && pose ? figurePoint(shot, f, fps, camPos, ...crownUV(pose.key)) : null;
  if (crownAt && f - crownFrom < 8) crownAt.add(new THREE.Vector3(0, 0.35 * (1 - (f - crownFrom) / 8) ** 2 - 0.03 * Math.sin(((f - crownFrom) / 8) * Math.PI), 0));
  if (crownAt && f >= capOff) {
    const t = (f - capOff) / 12;
    const from = figurePoint(shot, capOff, fps, camPos, ...crownUV(pose!.key))!;
    const to = new THREE.Vector3(...((shot.opts.pebble as [number, number, number]) ?? [0.25, 0.42, -1.25]));
    crownAt = t >= 1 ? null : from.clone().lerp(to, t).add(new THREE.Vector3(0, Math.sin(Math.PI * t) * 0.6, 0));
  }
  // her own light: glow_pulse ('beats') kicks on every beat, glow_out (frame) punches it out
  const o = shot.opts;
  let glowGain = 1;
  if (o.glow_pulse === 'beats') glowGain *= 1 + 0.9 * flare(props.beats, f, 6);
  if (typeof o.glow_out === 'number' && f >= o.glow_out) glowGain *= Math.max(0, 1 - (f - o.glow_out) / 4);
  glowGain *= 1 + 2.5 * dotBoost;
  glowGain *= Number(o.glow_gain ?? 1);                              // a soft dot pulse in the chorus (timeline effects)
  // a blackout (sets Shoot / Corner / Exhibit "dark" / "dark_at"): her own key goes with the set's light and her dots
  // become the light of the picture - the lamp in the dark (Watch Me, boards run 1: she stayed lit as by day)
  const darkNow = Math.max(0, Math.min(1, runTo(Number(o.dark ?? 0), o.dark_at, Number(o.dark_s ?? 0.25), f)));
  // in the dark her glow LIGHT would paint her and the set in its colour (boards runs 2 + 3: the black studio turned teal,
  // her skin saturated blue) - the light goes down and her own painted texture glows instead (colour lock, below)
  glowGain *= 1 - 0.8 * darkNow;
  // the rays: a ring around her head (swarm_ring 'head'), rising and widening into a beam after swarm_beam (frame)
  let rays: React.ReactNode = null;
  const headTop = pose ? figurePoint(shot, f, fps, camPos, ...crownUV(pose.key)) : null;
  if (headTop && (o.swarm_ring === 'head' || o.swarm === true)) {
    const b = typeof o.swarm_beam === 'number' && f >= o.swarm_beam ? Math.min(1, (f - o.swarm_beam) / 40) : 0;
    const ring = o.swarm_ring === 'head';
    const c = ring ? headTop.clone().add(new THREE.Vector3(0, 0.12 + b * 3, 0)) : headTop.clone().add(new THREE.Vector3(0, -0.6, 0));
    rays = <RaySwarm center={[c.x, c.y, c.z]} r={(ring ? 0.32 : 0.9) * (1 + b * 4)} n={ring ? 7 : 11} f={f} size={ring ? 0.12 : 0.22} c="#9b5cff" />;
  }
  // ride_card: the card under her feet that carries her (she stands on it, KING 50)
  const ride = o.ride_card && pose ? <Card pos={[pose.pos[0], pose.pos[1] + pose.lift + 0.02, pose.pos[2]]} rot={[-Math.PI / 2, 0, 0.3]} back /> : null;
  // something passes right in front of the lens on given frames: a playing card (card_pass_lens) or a ray (rays_pass_lens)
  let lensPass: React.ReactNode = null;
  for (const [key, ray] of [['card_pass_lens', false], ['shuffle', false], ['rays_pass_lens', true]] as const) {
    const d = since(o[key], f);
    if (d < 10) {
      const fw = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
      const rt = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
      const p = cam.position.clone().addScaledVector(fw, 0.7).addScaledVector(rt, 0.9 - (d / 10) * 1.8).add(new THREE.Vector3(0, 0.15 - d * 0.03, 0));
      lensPass = ray
        ? <RaySwarm center={[p.x, p.y, p.z]} r={0.01} n={1} f={f} size={0.35} c="#9b5cff" />
        : <Card pos={[p.x, p.y, p.z]} rot={[0.3, d * 0.4, d * 0.25]} scale={0.32} back={frames(o[key]).indexOf(f - d) % 2 === 1} sprite={o.king ? String(o.king) : undefined} rank="K" />;
    }
  }
  // things anchored to a point of HER sprite (u across, v from the top): the flame in her palm, the barb's gold glow,
  // a strike's sparks at the barb, the whip smear round her hip - they move with her (fire.tsx, Puppet3D WhipSmear)
  const toLens = (v: THREE.Vector3, d = 0.06) => v.clone().add(new THREE.Vector3(camPos[0] - v.x, 0, camPos[2] - v.z).normalize().multiplyScalar(d));
  const anchored: React.ReactNode[] = [];
  if (pose) {
    (Array.isArray(o.fires) ? (o.fires as FireSpec[]) : []).forEach((s, k) => {
      if (!s.uv) return;
      const sc = fireScale(s, f);
      if (sc <= 0) return;
      const a = figurePoint(shot, f, fps, camPos, s.uv[0], s.uv[1]);
      if (!a) return;
      const p = toLens(a);
      const size = (s.size ?? 0.3) * sc;
      if (s.uv2 && s.toss !== undefined) {
        const b = figurePoint(shot, f, fps, camPos, s.uv2[0], s.uv2[1]);
        if (b) { anchored.push(<TossedFlame key={`tf${k}`} a={p} b={toLens(b)} tosses={frames(s.toss)} f={f} size={size} c={s.c} core={s.core} seed={k * 17 + 3} />); return; }
      }
      anchored.push(<Flame key={`af${k}`} pos={[p.x, p.y - size * 0.15, p.z]} f={f} size={size} c={s.c} core={s.core} seed={k * 17 + 3} light={s.light ?? 1} dim={s.dim ?? 1} embers={3} />);
    });
    (Array.isArray(o.sparks) ? (o.sparks as SparkSpec[]) : []).forEach((s, k) => {
      if (!s.uv || f < s.at) return;
      const q = puppetAt(shot.puppets, s.at, fps);                     // the sparks fly from where the barb WAS
      if (!q) return;
      const a = figurePoint(shot, s.at, fps, camPos, s.uv[0], s.uv[1]);
      if (a) anchored.push(<SparkBurst key={`as${k}`} s={{seed: k * 13 + 2, ...s}} f={f} at={[toLens(a).x, toLens(a).y, toLens(a).z]} />);
    });
    if (o.whip !== undefined && Array.isArray(o.whip_pivot) && Array.isArray(o.whip_tip)) {
      const d = since(o.whip, f);
      if (d <= 10) {
        const t0 = f - d;
        const pv = figurePoint(shot, t0, fps, camPos, ...(o.whip_pivot as [number, number]));
        const tp = figurePoint(shot, t0, fps, camPos, ...(o.whip_tip as [number, number]));
        if (pv && tp) anchored.push(<WhipSmear key="whip" pivot={pv} tip={tp} camPos={camPos} d={d} sweep={Number(o.whip_sweep ?? 140)} dir={Number(o.whip_dir ?? 1)} c={String(o.whip_c ?? '#c98bff')} />);
      }
    }
  }
  let icon: React.ReactNode = null;
  if (pose?.key.icon && head) {
    const n = head.clone().project(cam);
    if (n.z < 1) icon = <ReactionIcon kind={pose.key.icon} x={(n.x * 0.5 + 0.5) * W + W * 0.04} y={(-n.y * 0.5 + 0.5) * H} local={pose.local} accent="#b56bff" />;
  } else if (herKey?.icon && headNdc && headNdc.z < 1) {    // the 3D Raymi: an icon beside her head for 1.5 s
    const local = f - herKey.f;
    if (local < 45) icon = <ReactionIcon kind={herKey.icon} x={herHead[0] * W + W * 0.12} y={herHead[1] * H - H * 0.03} local={local} accent="#b56bff" />;
  }
  return (
    <AbsoluteFill style={{backgroundColor: twoOn ? ink : '#0b0818', overflow: 'hidden'}}>
      <Fx2DDefs fx={fx} f={f} center={herScreen} aspect={aspect} />
      {fin > 0 ? (
        // the fin wave (a turn whips the water behind a fin): a short watery distortion of the picture
        <svg width={0} height={0} style={{position: 'absolute'}}><defs>
          <filter id="raymi-finwave"><feTurbulence type="fractalNoise" baseFrequency="0.008 0.022" numOctaves={2} seed={f % 97} />
            <feDisplacementMap in="SourceGraphic" scale={(fin * 34).toFixed(1)} xChannelSelector="R" yChannelSelector="G" /></filter>
        </defs></svg>
      ) : null}
      {blur ? (
        <svg width={0} height={0} style={{position: 'absolute'}}><defs>
          <filter id="raymi-mblur" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={`${blur.sx.toFixed(2)} ${blur.sy.toFixed(2)}`} /></filter>
        </defs></svg>
      ) : null}
      <AbsoluteFill style={{...whipStyle(props.shots, f, W), filter: mask ? 'none' : [whipStyle(props.shots, f, W).filter, twoOn ? '' : gradeAt(shot, f).filter, fxFilter(fx, f), povFilter(fx, f), blur ? 'url(#raymi-mblur)' : '', fin > 0 ? 'url(#raymi-finwave)' : ''].filter(Boolean).join(' ')}}>
        {ready ? (
          <ThreeCanvas width={W} height={H} shadows flat gl={{antialias: true, preserveDrawingBuffer: true}}
            camera={{fov: cam.fov, near: 0.05, far: 200, position: camPos}}>
            <CameraRig cam={cam} />
            {/* the world around her may leave / arrive piece by piece (three/world.tsx, Watch Me) */}
            {Set ? <WorldMotion spec={worldSpec(shot.opts.world, fps)} f={f} centre={(actorKeys[0]?.pos as [number, number, number] | undefined) ?? [0, 0, 0]}>
              {/* freeze: the set's own time stops at the shot's first frame (she still moves) */}
              <TwoTone on={twoOn} bg={shot.opts.two_tone_bg === 'ink' ? 'ink' : 'paper'}
                light={paper} dark={shot.opts.two_tone_dark ? String(shot.opts.two_tone_dark) : undefined}>
              <Set f={shot.opts.freeze ? shot.from : f} fps={fps} opts={shot.opts} hits={props.hits} beats={props.beats} camPos={camPos} />
              </TwoTone>
              <SetFx opts={{wet: SET_WET[shot.set] ?? 0, ...shot.opts}} f={f} fps={fps} camPos={camPos} plain={Boolean(mask)}
                her={(actorKeys[0]?.pos as [number, number, number] | undefined) ?? [0, 0, 0]} />
            </WorldMotion> : null}
            {props.vrm ? (
              <TwoTone on={floodOn} light={ink} dark={ink}>
              <VrmPuppet url={staticFile(props.vrm)} keys={actorKeys} f={f} fps={fps} from={shot.from} camPos={camPos}
                mouthKeys={shotMouth} lock={Number(shot.opts.lock ?? (shot.actor ? 0.1 : 0.38)) * (1 - darkNow) + 0.32 * darkNow} shadow={String(shot.opts.shadow ?? '#120b2b')}
                glow={glowColor(shot.opts.glow, f)} glowGain={0.12 * glowGain}
                materialStyle={String(shot.opts.material ?? (shot.actor ? 'routine' : 'firestarter'))}
                step={shot.step ?? 1} outline={shot.outline ?? 0} battery={battery}
                keyLight={Number(shot.opts.her_key ?? shot.opts.depth ?? 0) * (1 - 0.85 * darkNow)}
                trails={Number(shot.opts.trails ?? 0)} lampLight={Number(shot.opts.her_light ?? 0)}
                rimColor={shot.opts.her_rim ? String(shot.opts.her_rim) : undefined} rimGain={Number(shot.opts.her_rim_i ?? 1)} />
              </TwoTone>
            ) : (
              <Puppet3D keys={shot.puppets} f={f} fps={fps} camPos={camPos} shadow={String(shot.opts.shadow ?? '#1d0b38')}
                glow={glowColor(shot.opts.glow, f)} glowGain={glowGain} />
            )}
            {/* the strings read her posed wrists: drawn after her */}
            {props.vrm ? <group userData={{noSupport: true}}><Strings list={shot.opts.strings} vrm={staticFile(props.vrm)} f={f} /></group> : null}
            {/* lyrics, light rays, lens passes, effects: drawn in the space, never stood on or pushed against (support.ts) */}
            <group userData={{noSupport: true}}>{rays}{ride}{lensPass}{anchored}</group>
            {crownAt ? (
              <group position={[crownAt.x, crownAt.y, crownAt.z]} rotation={[0, Math.atan2(camPos[0] - crownAt.x, camPos[2] - crownAt.z), 0]}>
                <CapCrown pos={[0, 0.0, 0]} rot={[0.12, 0, -0.18]} scale={0.62} />
              </group>
            ) : null}
            {shot.lyrics ? <group userData={{noSupport: true, qc: 'text'}}><Words3D L={shot.lyrics} words={shot.words} f={f} fps={fps} tone={gradeAt(shot, f).lyric} beats={props.beats} cam={camPos} lens={cam} /></group> : null}
            {/* after effects (toki 2026-10-23): AO + bloom on every 3D-Raymi film shot, DoF where a shot asks for it */}
            {props.vrm && !mask ? <PostFX spec={twoOn ? {...postFor(shot.opts.post as PostSpec | undefined, herKey, camPos), bloom: 0, glow: 0, vignette: 0} : postFor(shot.opts.post as PostSpec | undefined, herKey, camPos)} /> : null}
            {props.probe ? <Probe f={f} F={fNow} vrm={props.vrm ? staticFile(props.vrm) : null} shot={shot.id} /> : null}
            {mask ? <QcMask her={props.vrm ? vrmBones(staticFile(props.vrm))?.root ?? null : null} mode={mask} /> : null}
          </ThreeCanvas>
        ) : null}
      </AbsoluteFill>
      {mask ? null : (<>
      {/* the A+ last hit (toki 2026-10-26): the pre-drop dip - near black, only her dots; then 2 frames of the lamp in her
          pupils (opts.dip / opts.pupil_lamp on those pictures, 4_SCRIPT final build 176.9 / 177.167) */}
      {shot.opts.dip ? <AbsoluteFill style={{backgroundColor: '#05040a', opacity: 0.9}} /> : null}
      {shot.opts.pupil_lamp ? (
        <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', mixBlendMode: 'screen'}}>
          {[-1, 1].map((k) => <g key={k} transform={`translate(${80 + k * 19} 47)`}>
            <circle r={3.2} fill="#ffd9a0" opacity={0.55} /><circle r={1.5} fill="#fff0cd" />
            {[0, 45, 90, 135].map((a) => <rect key={a} x={-0.25} y={-7} width={0.5} height={14} fill="#fff0cd" transform={`rotate(${a})`} />)}
          </g>)}
        </svg>
      ) : null}
      <Fx2D fx={fx} f={fNow} center={herScreen} head={herHead} aspect={aspect} />
      <PovLayer fx={fx as never} f={fNow} W={W} H={H} />
      {battery && shot.opts.battery_sign ? <BatterySign {...battery} x={herHead[0] * W} y={herHead[1] * H} h={H} f={f} side={shot.opts.battery_sign === 'left' ? -1 : 1} /> : null}
      {icon}
      <Transitions shots={props.shots} f={fNow} />
      {twoOn ? <Grade grain={props.grain} tone={{...gradeAt(shot, f), split: 0, vignette: 0}} /> : <Grade grain={props.grain} tone={gradeAt(shot, f)} />}
      {props.overlay ? (
        <>
          <Stamp text={props.overlay.hook.text} from={props.overlay.hook.from} to={props.overlay.hook.to} top={H * OVERLAY.hookTop} accent="#b56bff" size={96} />
          {props.overlay.cta ? <Stamp text={props.overlay.cta.text} from={props.overlay.cta.from} to={props.durationInFrames + 1} top={H * OVERLAY.ctaTop} accent="#b56bff" size={84} bubble /> : null}
        </>
      ) : null}
      </>)}
      {props.audio ? <Audio src={staticFile(props.audio.file)} trimBefore={Math.round(props.audio.from * fps)} /> : null}
    </AbsoluteFill>
  );
};

/** The 2D battery sign beside her head: a flat graphic battery with five violet cells (the same count as her chest
 *  lights). A cell that goes out blinks twice, then stays dark; the last cell turns red-violet. */
const BatterySign: React.FC<{n: number; prev: number; t: number; x: number; y: number; h: number; f: number; side: number}> = ({n, prev, t, x, y, h, f, side}) => {
  const w = h * 0.16, hh = w * 0.42;
  const left = Math.min(Math.max(x + side * h * 0.16 - (side < 0 ? w : 0), h * 0.05), h * 1.7 - w);
  const top = Math.max(y - hh * 1.6, h * 0.06);
  const pop = t < 1 ? 1 + 0.12 * Math.sin(Math.PI * t) : 1;
  return (
    <svg viewBox="0 0 100 42" style={{position: 'absolute', left, top, width: w, height: hh, transform: `scale(${pop}) rotate(${side * -4}deg)`, overflow: 'visible'}}>
      <rect x={2} y={3} width={88} height={36} rx={7} fill="#140c26" stroke="#f2ecff" strokeWidth={4} />
      <rect x={91} y={14} width={7} height={14} rx={2} fill="#f2ecff" />
      {[0, 1, 2, 3, 4].map((i) => {
        const on = i < n, dying = !on && i < prev && t < 1;
        const blink = dying ? (Math.floor(f / 3) % 2 === 0 ? 1 : 0.15) : on ? 1 : 0.12;
        const c = n === 1 && on ? '#ff5a8a' : '#b98cff';
        return <circle key={i} cx={14 + i * 16} cy={21} r={6.2} fill={c} opacity={blink} />;
      })}
    </svg>
  );
};

/** The shot's post spec; dof_auto focuses the depth of field on HER (chest height) at this frame - she sharp, the room soft
 *  (film look, toki 2026-10-25 "sehr flach und cartoon"). */
function postFor(spec: PostSpec | undefined, her: {pos: number[]; height?: number} | null, camPos: [number, number, number]): PostSpec {
  const s = spec ?? {};
  if (!s.dof_auto || !her || typeof s.dof === 'number') return s;
  const y = her.pos[1] + (her.height ?? 1.55) * 0.7;
  const d = Math.hypot(camPos[0] - her.pos[0], camPos[1] - y, camPos[2] - her.pos[2]);
  return {...s, dof: Number(d.toFixed(2)), dofRange: Math.max(0.5, d * 0.35)};
}

// The colour grade: the library + per-act choice live in grade.ts (the studio's look step).
export function gradeOf(shot: Shot): Tone {
  return TONES[gradeName(shot.opts, shot.set)];
}

/** The grade at frame f: a shot can turn into another grade on an event (grade_to + grade_at frame + grade_s seconds,
 *  e.g. the red wave reaching the lens: own -> night). */
export function gradeAt(shot: Shot, f: number): Tone & {lyric: LyricTone} {
  const a = TONES[gradeName(shot.opts, shot.set)];
  const to = shot.opts.grade_to, at = shot.opts.grade_at;
  if (typeof to !== 'string' || !(to in TONES) || typeof at !== 'number') return a;
  const t = (f - at) / Math.max(1, Number(shot.opts.grade_s ?? 0.5) * 30);
  return mixTone(a, TONES[to], Math.max(0, Math.min(1, t)));
}

/** Her glow colour: one colour, or [[frame, colour], ...] - the colour RUNS from one to the next over ~1 s (her dots
 *  turning from UV-blue to fire-violet: "chaos running wild in my veins"). */
export function glowColor(v: unknown, f: number): string | undefined {
  if (!v) return undefined;
  if (typeof v === 'string') return v;
  const {from, to, t} = stepValue<string>(v, f, 30);
  if (!to) { const first = (Array.isArray(v) && Array.isArray(v[0]) ? v[0][1] : null) as string | null; return first ?? undefined; }
  if (!from) return to;
  return `#${new THREE.Color(from).lerp(new THREE.Color(to), t).getHexString()}`;
}

export const Grade: React.FC<{grain: number; tone: Tone}> = ({grain, tone}) => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${tone.top} 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0) 55%, ${tone.bottom} 100%)`,
        mixBlendMode: 'soft-light', opacity: tone.split}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(8,2,24,${tone.vignette}) 100%)`}} />
      <AbsoluteFill style={{opacity: grain, mixBlendMode: 'overlay', backgroundImage: grainTile,
        backgroundPosition: `${Math.floor(random(`gx${f % 24}`) * 256)}px ${Math.floor(random(`gy${f % 24}`) * 256)}px`}} />
    </>
  );
};
