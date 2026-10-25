// Set effects every set can take (Watch Me build 2026-10-24, reusable): weather and floor events around her spot,
// her light writing a word into the air, her tail passing the lens, the floor sliding under a walk on the spot, a wet
// mirror floor. Film draws <SetFx> after the set inside the same world group (a world that flies away takes its rain
// with it). Built, never generated (hard rule 8); deterministic and frame-driven.
// Options (times in song s, compiled to frames by raymi/timeline.py TIME_OPTS; `her` = her spot from the shot's actor):
//   rain: [[t, v], ...]       rain RUNS to strength v (0..1) from t: streaks round her, rings on the ground
//   wind: [[t, v], ...]       wind runs to v (0..2): streaks and paper scraps cross the frame (wind_dir: 1 | -1)
//   splash: t | [t, ...]      water bursts up from the ground at her feet
//   tail_slap: t | [t, ...]   her tail hits the floor: a ring runs out from her feet, dust jumps
//   lightwriting: t           her light writes `lightwriting_text` ("WATCH ME") in the air in front of her, 1.6 s
//   treadmill: m/s            the floor slides under her away from the lens: tape marks + pins scroll, she walks on the spot
//   freeze: true              the set's own time stops (Film); dust hangs in the air around her
//   letters_off: t            gold letters (`letters_text`, "HURRICANE") tear off the back wall and blow past her
//   tail_lens: t              her tail (thin, the barb at its end) sweeps right through the lens - a cover moment
//   barb_lens: t              the barb crosses one corner of the lens (a plant, not a cover)
//   tail_twitch: t            the barb twitches up into the lower corner for half a second
//   haze: 0..1                deep-sea murk (K/DA FIRESTARTER study, in her world): soft water haze in front of and behind
//                             her + marine snow drifting down - depth without walls (haze_c: the water's colour)
//   sonar: t | [t, ...]       a ray senses with electricity: an ultraviolet ping rings out from her over the floor and the
//                             room (on "radar")
//   sense: 0..1               her electro-sense: thin flickering field lines between her and the Salmon guard
//   caustics: 0..1            under-sea light patterns drifting over the floor round her (the street / the museum lie under
//                             the sea)
//   paparazzi: t | [t, ...]   a salvo of camera flashes from the dark round her (fame moments only)
//   wet: 0..1                 the floor is a wet mirror (a set passes its own default; 0 = dry)
//   fold: t                   the centerfold: a magazine page behind her folds open and down onto the floor over 0.8 s
//                             (`fold_title`, "WATCH ME") - the cover becomes the sidewalk (Watch Me 25)
import React from 'react';
import * as THREE from 'three';
import {Reflector} from 'three/examples/jsm/objects/Reflector.js';
import {blobTexture, canvasTexture, rnd, runTo, toon} from './look';
import {Caustics, drawText} from './parts';
import {ease} from '../film/motion';

type P3 = [number, number, number];
const num = (v: unknown, d = 0) => (typeof v === 'number' ? v : d);
const times = (v: unknown): number[] => (typeof v === 'number' ? [v] : Array.isArray(v) ? (v.filter((x) => typeof x === 'number') as number[]) : []);
/** Frames since the latest of the times that already happened (-1 = none yet). */
const since = (v: unknown, f: number) => times(v).reduce((m, t) => (f >= t && (m < 0 || f - t < m) ? f - t : m), -1);

// ---------------------------------------------------------------- the wet mirror floor
const WET_SHADER = {
  name: 'WetFloorShader',
  uniforms: {color: {value: null}, tDiffuse: {value: null}, textureMatrix: {value: null}, opacity: {value: 0.3}},
  vertexShader: /* glsl */ `
    uniform mat4 textureMatrix;
    varying vec4 vUv;
    void main() { vUv = textureMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform vec3 color; uniform sampler2D tDiffuse; uniform float opacity;
    varying vec4 vUv;
    void main() {
      // a soft 5-tap reflection: wet stone, never a sharp mirror
      vec2 uv = vUv.xy / vUv.w; float s = 0.004;
      vec4 b = texture2D(tDiffuse, uv) * 0.4 + (texture2D(tDiffuse, uv + vec2(s, 0.0)) + texture2D(tDiffuse, uv - vec2(s, 0.0))
             + texture2D(tDiffuse, uv + vec2(0.0, s * 2.0)) + texture2D(tDiffuse, uv - vec2(0.0, s * 2.0))) * 0.15;
      gl_FragColor = vec4(b.rgb * color, opacity);
      #include <colorspace_fragment>
    }`,
};

/** A wet floor: a translucent soft reflection laid over the set's own floor (the floor's texture stays readable). */
export const WetFloor: React.FC<{size: [number, number]; pos?: P3; amount: number; tint?: string}> = ({size, pos = [0, 0.004, 0], amount, tint = '#9aa8c8'}) => {
  const mesh = React.useMemo(() => {
    const r = new Reflector(new THREE.PlaneGeometry(size[0], size[1]), {textureWidth: 1024, textureHeight: 1024, clipBias: 0.003, color: new THREE.Color(tint), shader: WET_SHADER});
    const m = r.material as THREE.ShaderMaterial;
    m.transparent = true; m.depthWrite = false;
    r.rotation.x = -Math.PI / 2;
    r.renderOrder = 1;
    r.userData.noSupport = true;
    return r;
  }, [size[0], size[1], tint]);
  (mesh.material as THREE.ShaderMaterial).uniforms.opacity.value = Math.max(0, Math.min(0.6, amount));
  mesh.position.set(...pos);
  return amount > 0.01 ? <primitive object={mesh} /> : null;
};

// ---------------------------------------------------------------- rain + wind
const Rain: React.FC<{v: number; her: P3; f: number; wind: number; dir: number}> = ({v, her, f, wind, dir}) => {
  const n = Math.round(200 * v);   // stills 1: 160 read as nothing; look-critic stills 4: 280 buried her
  return (
    <group>
      {Array.from({length: n}, (_, i) => {
        const fall = 0.35;                                         // m per frame: fast streaks
        const x0 = her[0] + (rnd(i * 1.7) - 0.5) * 7, z0 = her[2] + (rnd(i * 2.3) - 0.5) * 7;
        const y = 5 - ((f * fall + rnd(i * 3.1) * 5) % 5);
        const drift = dir * wind * 0.25 * (5 - y);
        return <mesh key={i} position={[x0 + drift, her[1] + y, z0]} rotation={[0, 0, -dir * wind * 0.25]} renderOrder={6}>
          <boxGeometry args={[0.011, 0.42, 0.011]} />
          <meshBasicMaterial color="#d8ebff" transparent opacity={0.62} depthWrite={false} toneMapped={false} /></mesh>;
      })}
      {/* rings where drops land */}
      {Array.from({length: Math.round(26 * v)}, (_, i) => {
        const t = ((f / 14 + rnd(i * 5.9)) % 1);
        return <mesh key={`r${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[her[0] + (rnd(i * 4.4) - 0.5) * 4, her[1] + 0.008, her[2] + (rnd(i * 6.2) - 0.5) * 4]} scale={0.02 + 0.16 * t} renderOrder={4}>
          <ringGeometry args={[0.8, 1, 20]} />
          <meshBasicMaterial color="#d8ecff" transparent opacity={0.5 * (1 - t)} depthWrite={false} toneMapped={false} /></mesh>;
      })}
    </group>
  );
};

const Wind: React.FC<{v: number; her: P3; f: number; dir: number}> = ({v, her, f, dir}) => (
  <group>
    {Array.from({length: Math.round(22 * Math.min(2, v))}, (_, i) => {
      const t = ((f * (0.05 + 0.03 * v) + rnd(i * 2.9)) % 1);
      const x = her[0] - dir * 4 + dir * 8 * t;
      return <mesh key={i} position={[x, her[1] + 0.3 + rnd(i * 3.7) * 2.6, her[2] + (rnd(i * 1.3) - 0.5) * 3]} rotation={[0, 0, 0]} renderOrder={6}>
        <boxGeometry args={[0.5 + 0.6 * v, 0.008, 0.008]} />
        <meshBasicMaterial color="#e8f0ff" transparent opacity={0.28 * Math.sin(Math.PI * t)} depthWrite={false} toneMapped={false} /></mesh>;
    })}
    {/* paper scraps tumbling across */}
    {Array.from({length: Math.round(8 * Math.min(2, v))}, (_, i) => {
      const t = ((f * (0.025 + 0.015 * v) + rnd(i * 7.1)) % 1);
      return <mesh key={`p${i}`} position={[her[0] - dir * 4 + dir * 8 * t, her[1] + 0.2 + rnd(i * 5.5) * 1.8 + 0.3 * Math.sin(f / 5 + i), her[2] + (rnd(i * 8.8) - 0.3) * 2.4]}
        rotation={[f / 4 + i, f / 6 + i * 2, f / 5]} material={toon(i % 3 ? '#efe9de' : '#ff9fc4', '#000000', 1, {side: THREE.DoubleSide})}>
        <planeGeometry args={[0.09, 0.12]} /></mesh>;
    })}
  </group>
);

// ---------------------------------------------------------------- floor events at her feet
const Splash: React.FC<{d: number; her: P3}> = ({d, her}) => d < 0 || d > 24 ? null : (
  <group position={her}>
    {Array.from({length: 34}, (_, i) => {   // a splash stays at her feet (look-critic stills 4: drops up to her chest read as bubble stickers)
      const a = rnd(i * 3.3) * Math.PI * 2, sp = 0.08 + rnd(i * 1.9) * 0.06, up = 0.06 + rnd(i * 4.1) * 0.05;
      const t = d;
      return <mesh key={i} position={[Math.cos(a) * sp * t * 0.5, up * t - 0.0045 * t * t, Math.sin(a) * sp * t * 0.5]} renderOrder={6}>
        <sphereGeometry args={[0.02 + rnd(i) * 0.022, 6, 5]} />
        <meshBasicMaterial color="#cfe8ff" transparent opacity={0.8 * (1 - d / 24)} depthWrite={false} toneMapped={false} /></mesh>;
    })}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} scale={0.1 + d * 0.06} renderOrder={4}>
      <ringGeometry args={[0.75, 1, 28]} /><meshBasicMaterial color="#e6f3ff" transparent opacity={0.7 * (1 - d / 24)} depthWrite={false} toneMapped={false} /></mesh>
  </group>
);

const Slap: React.FC<{d: number; her: P3}> = ({d, her}) => d < 0 || d > 20 ? null : (
  <group position={her}>
    {[0, 5].map((k) => {
      const t = Math.max(0, d - k) / 20;
      return t <= 0 ? null : <mesh key={k} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]} scale={0.15 + 1.6 * ease('out', t)} renderOrder={4}>
        <ringGeometry args={[0.9, 1, 40]} /><meshBasicMaterial color="#fff6ea" transparent opacity={0.65 * (1 - t)} depthWrite={false} toneMapped={false} /></mesh>;
    })}
    {Array.from({length: 14}, (_, i) => {
      const a = rnd(i * 2.2) * Math.PI * 2, t = d / 20;
      return <mesh key={i} position={[Math.cos(a) * 0.6 * t, 0.04 + 0.25 * Math.sin(Math.PI * t) * rnd(i * 5.1), Math.sin(a) * 0.6 * t]} scale={0.06 + 0.1 * t} renderOrder={5}>
        <sphereGeometry args={[0.5, 8, 6]} /><meshBasicMaterial map={blobTexture('#e9e0d2')} transparent opacity={0.5 * (1 - t)} depthWrite={false} /></mesh>;
    })}
  </group>
);

// ---------------------------------------------------------------- the floor sliding under her (a walk on the spot)
const Treadmill: React.FC<{speed: number; her: P3; f: number; fps: number; camPos: P3}> = ({speed, her, f, fps, camPos}) => {
  // the floor runs from her toward behind her (away from the lens): she walks toward us without arriving
  const dir = new THREE.Vector2(her[0] - camPos[0], her[2] - camPos[2]).normalize();
  const gap = 0.6, run = ((speed * f) / fps) % gap;
  const marks: React.ReactNode[] = [];
  for (let i = -5; i <= 5; i++) for (let j = -3; j <= 3; j++) {
    if (j === 0 && Math.abs(i) <= 1) continue;                  // never a mark right under her feet's first frames
    const along = i * gap + run, side = j * 0.55 + (rnd(i * 13 + j) - 0.5) * 0.2;
    const x = her[0] + dir.x * along - dir.y * side, z = her[2] + dir.y * along + dir.x * side;
    const fade = 1 - Math.min(1, Math.abs(along) / 3.2);
    const pin = rnd(i * 7 + j * 3) > 0.6;
    marks.push(pin
      ? <mesh key={`${i}_${j}`} position={[x, her[1] + 0.012, z]}><sphereGeometry args={[0.018, 8, 6]} /><meshToonMaterial color="#ff3d7f" transparent opacity={fade} /></mesh>
      : <mesh key={`${i}_${j}`} rotation={[-Math.PI / 2, 0, Math.atan2(dir.x, dir.y) + (rnd(i + j * 5) > 0.5 ? Math.PI / 2 : 0)]} position={[x, her[1] + 0.006, z]}>
        <planeGeometry args={[0.05, 0.22]} /><meshBasicMaterial color="#f2c14a" transparent opacity={0.85 * fade} depthWrite={false} toneMapped={false} /></mesh>);
  }
  return <group>{marks}</group>;
};

// ---------------------------------------------------------------- her light writing a word into the air
const LightWriting: React.FC<{d: number; her: P3; camPos: P3; text: string; fps: number}> = ({d, her, camPos, text, fps}) => {
  const dur = 1.6 * fps;
  const tex = canvasTexture(`lightwrite${text}`, 1024, 256, (ctx, w, h) => {
    ctx.shadowColor = '#bfe6ff'; ctx.shadowBlur = 26;
    drawText(ctx, text, w / 2, h / 2, h * 0.62, '#eaf7ff', {maxW: w * 0.94});
    drawText(ctx, text, w / 2, h / 2, h * 0.62, '#ffffff', {maxW: w * 0.94});
  });
  if (d < 0) return null;
  const p = Math.min(1, d / dur);
  const fadeOut = d > dur + 2.2 * fps ? Math.max(0, 1 - (d - dur - 2.2 * fps) / 15) : 1;
  const toCam = new THREE.Vector3(camPos[0] - her[0], 0, camPos[2] - her[2]).normalize();
  const yaw = Math.atan2(toCam.x, toCam.z), W = 1.3, H = W / 4;
  // beside and above her head, never across her face (look-critic stills 3: WATCH ME parked on her eyes)
  const side = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  const c = new THREE.Vector3(her[0], her[1] + 1.5, her[2]).addScaledVector(toCam, 0.3).addScaledVector(side, 0.62);   // stills 4: above her head it left the MS frame
  tex.repeat.set(p, 1); tex.offset.set(0, 0);
  const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
  const mid = c.clone().addScaledVector(right, -W / 2 + (W * p) / 2);
  const pen = c.clone().addScaledVector(right, -W / 2 + W * p).add(new THREE.Vector3(0, 0.05 * Math.sin(d * 0.9), 0));
  return (
    <group renderOrder={9}>
      <mesh position={mid} rotation={[0, yaw, 0]} renderOrder={9}>
        <planeGeometry args={[W * Math.max(0.001, p), H]} />
        <meshBasicMaterial map={tex} transparent opacity={fadeOut} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {p < 1 ? <mesh position={pen} renderOrder={10}><sphereGeometry args={[0.04, 10, 8]} /><meshBasicMaterial map={blobTexture('#ffffff')} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh> : null}
    </group>
  );
};

// ---------------------------------------------------------------- dust hanging in the air (time stopped)
const FrozenDust: React.FC<{her: P3}> = ({her}) => (
  <group>
    {Array.from({length: 46}, (_, i) => (
      <mesh key={i} position={[her[0] + (rnd(i * 2.1) - 0.5) * 3, her[1] + 0.2 + rnd(i * 3.3) * 2.2, her[2] + (rnd(i * 4.7) - 0.5) * 3]} renderOrder={6}>
        <sphereGeometry args={[0.008 + rnd(i) * 0.01, 6, 4]} /><meshBasicMaterial color="#fff4e0" transparent opacity={0.7} depthWrite={false} toneMapped={false} />
      </mesh>
    ))}
  </group>
);

// ---------------------------------------------------------------- gold letters torn off the wall
const LettersOff: React.FC<{d: number; her: P3; text: string; dir: number}> = ({d, her, text, dir}) => {
  if (d < 0 || d > 75) return null;
  return (
    <group>
      {text.split('').map((ch, i) => {
        const tex = canvasTexture(`goldletter${ch}`, 128, 160, (ctx, w, h) => drawText(ctx, ch, w / 2, h / 2, h * 0.8, '#e3b552', {outline: '#5a3a10', ow: 6}));
        const t = Math.max(0, d - i * 2) / 60, x0 = her[0] - dir * 0.9 * (i - text.length / 2) * 0.32;
        return <mesh key={i} position={[x0 + dir * 6 * ease('in', t), her[1] + 2.6 - 0.8 * t + 0.4 * Math.sin(t * 6 + i), her[2] - 3.6 + 5.5 * t]}
          rotation={[t * 4 + i, t * 6 * dir, t * 3]} renderOrder={7}>
          <planeGeometry args={[0.62, 0.78]} /><meshToonMaterial map={tex} transparent side={THREE.DoubleSide} />
        </mesh>;
      })}
    </group>
  );
};

// ---------------------------------------------------------------- her tail in front of the lens
/** Her tail: a thin dark-violet tube that ends in the stingray barb; `pts` in lens space (x right, y up, z forward). */
export const TailNearLens: React.FC<{camPos: P3; her: P3; pts: [number, number, number][]}> = ({camPos, her, pts}) => {
  const fw = new THREE.Vector3(her[0] - camPos[0], her[1] + 1.1 - camPos[1], her[2] - camPos[2]).normalize();
  const rt = new THREE.Vector3().crossVectors(fw, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(rt, fw);
  const W = (p: [number, number, number]) => new THREE.Vector3(...camPos).addScaledVector(rt, p[0]).addScaledVector(up, p[1]).addScaledVector(fw, p[2]);
  const ws = pts.map(W);
  const curve = new THREE.CatmullRomCurve3(ws);
  const geo = new THREE.TubeGeometry(curve, 24, 0.03, 10, false);   // stills 1: 1.2 cm read as a hair
  const tip = ws[ws.length - 1], dirTip = tip.clone().sub(ws[ws.length - 2]).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirTip);
  return (
    <group renderOrder={11} userData={{noSupport: true}}>
      <mesh geometry={geo} material={toon('#2a1f45')} />
      <mesh position={tip} quaternion={q} scale={[1, 1, 0.35]} material={toon('#7a3cf0', '#5a22c8', 0.5)}><coneGeometry args={[0.075, 0.22, 4]} /></mesh>
    </group>
  );
};

function tailPath(kind: 'sweep' | 'corner' | 'twitch', d: number): [number, number, number][] | null {
  if (kind === 'sweep') {                      // right through the lens: from low right, up across, out top left (10 frames)
    if (d < 0 || d > 12) return null;
    const t = d / 12, x = 0.5 - 1.0 * ease('inOut', t);
    return [[x + 0.6, -0.5, 0.5], [x + 0.25, -0.15, 0.28], [x, 0.05, 0.16], [x - 0.12, 0.18, 0.12]];
  }
  if (kind === 'corner') {                     // across the upper right corner (14 frames)
    if (d < 0 || d > 14) return null;
    const t = d / 14, x = 0.3 - 0.25 * ease('inOut', t);
    return [[x + 0.4, -0.1, 0.6], [x + 0.18, 0.1, 0.42], [x + 0.08, 0.17, 0.3], [x, 0.2, 0.26]];
  }
  if (d < 0 || d > 16) return null;            // the twitch: the barb flicks up into the lower right corner and back
  const k = Math.sin(Math.PI * Math.min(1, d / 16)) * (1 + 0.25 * Math.sin(d * 1.6));
  return [[0.32, -0.45, 0.7], [0.26, -0.3 + 0.06 * k, 0.55], [0.22, -0.24 + 0.1 * k, 0.48], [0.17, -0.2 + 0.12 * k, 0.44]];
}

// ---------------------------------------------------------------- the centerfold: a page folds down onto the floor
const Centerfold: React.FC<{d: number; her: P3; camPos: P3; title: string; fps: number}> = ({d, her, camPos, title, fps}) => {
  const tex = canvasTexture(`centerfold${title}`, 512, 704, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffe3ee'); g.addColorStop(1, '#f6c2d6');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    drawText(ctx, title, w / 2, h * 0.12, h * 0.11, '#ff3d7f', {outline: '#16121f', ow: 6, maxW: w * 0.92});
    ctx.fillStyle = '#16121f'; for (let i = 0; i < 9; i++) ctx.fillRect(w * 0.08, h * (0.72 + i * 0.028), w * (0.3 + 0.5 * rnd(i)), 5);   // columns of print
    ctx.strokeStyle = 'rgba(22,18,31,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();   // the fold
  });
  if (d < 0) return null;
  const t = ease('inOut', Math.min(1, d / (0.8 * fps)));
  // hinged on the floor just behind her: from standing up (0) it falls AWAY from the lens and lies flat (1) - never through her
  const away = new THREE.Vector3(her[0] - camPos[0], 0, her[2] - camPos[2]).normalize();
  const hinge = new THREE.Vector3(her[0], her[1] + 0.005, her[2]).addScaledVector(away, 0.55);
  const yaw = Math.atan2(-away.x, -away.z);
  const W = 1.7, H = 2.3;   // stills 1: a 2.4 x 3.3 page filled the frame as a white slab
  return (
    <group position={hinge} rotation={[0, yaw, 0]}>
      <group rotation={[-(Math.PI / 2) * t, 0, 0]}>
        <mesh position={[0, H / 2, 0]} renderOrder={2}><planeGeometry args={[W, H]} /><meshToonMaterial map={tex} color="#c9bcc4" side={THREE.DoubleSide} /></mesh>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- deep-sea murk and marine snow
const Haze: React.FC<{v: number; her: P3; camPos: P3; f: number; c: string}> = ({v, her, camPos, f, c}) => {
  const toCam = new THREE.Vector3(camPos[0] - her[0], 0, camPos[2] - her[2]);
  const dist = toCam.length() || 1;
  toCam.normalize();
  const side = new THREE.Vector3(toCam.z, 0, -toCam.x);
  const yaw = Math.atan2(toCam.x, toCam.z);
  // layers: two in front of her (between her and the lens, off to the sides), three behind her
  const layers: [number, number, number, number][] = [[0.45, -0.9, 1.1, 2.2], [0.6, 1.0, 0.7, 1.8], [-0.8, -1.2, 1.4, 3.4], [-1.6, 1.4, 0.9, 4.2], [-2.6, 0, 1.8, 6]];
  return (
    <group>
      {layers.map(([d, s, y, size], i) => {
        const along = d > 0 ? d * dist : d;                 // in front: a share of the way to the lens; behind: metres
        const drift = 0.25 * Math.sin(f / (90 + i * 23) + i);
        const pos = new THREE.Vector3(her[0], her[1] + y, her[2]).addScaledVector(toCam, along).addScaledVector(side, s + drift);
        return <mesh key={i} position={pos} rotation={[0, yaw, 0]} renderOrder={d > 0 ? 9 : 1}>
          <planeGeometry args={[size * 1.6, size]} />
          <meshBasicMaterial map={blobTexture(c)} transparent opacity={(d > 0 ? 0.1 : 0.16) * v} depthWrite={false} toneMapped={false} />
        </mesh>;
      })}
      {Array.from({length: Math.round(90 * v)}, (_, i) => {
        const t = ((f / 600) * (0.6 + rnd(i * 1.3)) + rnd(i * 2.9)) % 1;   // slow fall, each its own pace
        return <mesh key={`sn${i}`} position={[her[0] + (rnd(i * 3.7) - 0.5) * 4 + 0.08 * Math.sin(f / 40 + i), her[1] + 3 - t * 3.2, her[2] + (rnd(i * 5.1) - 0.5) * 4]} renderOrder={6}>
          <sphereGeometry args={[0.006 + rnd(i) * 0.008, 5, 4]} />
          <meshBasicMaterial color="#d6e6ff" transparent opacity={0.55 * Math.sin(Math.PI * t)} depthWrite={false} toneMapped={false} />
        </mesh>;
      })}
    </group>
  );
};

// ---------------------------------------------------------------- the four "her world" effects (toki 2026-10-25)
const Sonar: React.FC<{d: number; her: P3}> = ({d, her}) => {
  if (d < 0 || d > 42) return null;
  return (
    <group position={her}>
      {[0, 8].map((k) => {
        const t = Math.max(0, d - k) / 34;
        if (t <= 0 || t >= 1) return null;
        return <mesh key={k} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} scale={0.3 + 4.5 * ease('out', t)} renderOrder={4}>
          <ringGeometry args={[0.96, 1, 64]} /><meshBasicMaterial color="#b28cff" transparent opacity={0.8 * (1 - t)} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>;
      })}
      <mesh position={[0, 1.1, 0]} scale={0.3 + 3.2 * ease('out', d / 42)} renderOrder={4}>
        <sphereGeometry args={[1, 32, 20]} /><meshBasicMaterial color="#8f6bff" transparent opacity={0.14 * (1 - d / 42)} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

const Sense: React.FC<{v: number; her: P3; to: P3 | null; f: number}> = ({v, her, to, f}) => {
  if (!to || f % 6 > 3) return null;                       // it flickers: on for 4 frames of 6
  const a = new THREE.Vector3(her[0], her[1] + 1.1, her[2]), b = new THREE.Vector3(...to);
  return (<>
    {[0, 1, 2].map((k) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 10; i++) {
        const p = a.clone().lerp(b, i / 10);
        const j = i === 0 || i === 10 ? 0 : 0.07;
        p.add(new THREE.Vector3((rnd(f * 3 + i * 7 + k) - 0.5) * j, (rnd(f * 5 + i * 11 + k * 3) - 0.5) * j, (rnd(f * 7 + i * 13 + k * 5) - 0.5) * j));
        pts.push(p);
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({color: k ? '#9ff6ff' : '#c9a8ff', transparent: true, opacity: 0.6 * v, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false});
      return <primitive key={k} object={new THREE.Line(geo, mat)} />;
    })}
  </>);
};

const Paparazzi: React.FC<{d: number; her: P3; camPos: P3}> = ({d, her, camPos}) => {
  if (d < 0 || d > 22) return null;
  const pops = [0, 4, 9, 15];
  const k = pops.reduce((m, p) => (d >= p && d - p < 3 ? Math.max(m, 1 - (d - p) / 3) : m), 0);
  const toCam = new THREE.Vector3(camPos[0] - her[0], 0, camPos[2] - her[2]).normalize();
  const side = new THREE.Vector3(toCam.z, 0, -toCam.x);
  return (<>
    {k > 0 ? <pointLight position={[camPos[0] + side.x * 0.8, camPos[1] + 0.3, camPos[2] + side.z * 0.8]} color="#ffffff" intensity={9 * k} distance={7} decay={1.2} /> : null}
    {pops.map((p, i) => {
      const e = d >= p && d - p < 3 ? 1 - (d - p) / 3 : 0;
      if (e <= 0) return null;
      const pos = new THREE.Vector3(...her).addScaledVector(toCam, 1.2).addScaledVector(side, (i % 2 ? 1 : -1) * (1.4 + rnd(i) * 1.2)).add(new THREE.Vector3(0, 0.9 + rnd(i + 4) * 0.9, 0));
      return <mesh key={i} position={pos} renderOrder={10}><planeGeometry args={[0.5, 0.5]} />
        <meshBasicMaterial map={blobTexture('#ffffff')} transparent opacity={e} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>;
    })}
  </>);
};

/** Everything of this file a shot asks for. `her` = her spot; `frozenF` = the frame the set's time stopped at (freeze). */
export const SetFx: React.FC<{opts: Record<string, unknown>; f: number; fps: number; her: P3; camPos: P3; plain?: boolean}> = ({opts, f, fps, her, camPos, plain}) => {
  const rain = Math.max(0, Math.min(1, runTo(0, opts.rain, 0.4, f)));
  const wind = Math.max(0, Math.min(2, runTo(0, opts.wind, 0.3, f)));
  const dir = num(opts.wind_dir, 1) >= 0 ? 1 : -1;
  const tails = (['tail_lens', 'barb_lens', 'tail_twitch'] as const).map((k) => {
    const pts = tailPath(k === 'tail_lens' ? 'sweep' : k === 'barb_lens' ? 'corner' : 'twitch', since(opts[k], f));
    return pts ? <TailNearLens key={k} camPos={camPos} her={her} pts={pts} /> : null;
  });
  return (
    <group userData={{noSupport: true}}>
      {!plain && num(opts.wet) > 0 ? <WetFloor size={[16, 16]} pos={[her[0], (opts.wet_y as number | undefined) ?? 0.004, her[2]]} amount={num(opts.wet)} tint={String(opts.wet_tint ?? '#9aa8c8')} /> : null}
      <Sonar d={since(opts.sonar, f)} her={her} />
      {num(opts.sense) > 0 ? <Sense v={num(opts.sense)} her={her} to={(opts.salmon as {pos?: P3} | undefined)?.pos ?? null} f={f} /> : null}
      {num(opts.caustics) > 0 ? <Caustics size={[7, 7]} pos={[her[0], (her[1] > 0.3 ? 0 : her[1]) + 0.012, her[2]]} f={f} opacity={0.35 * num(opts.caustics)} /> : null}
      <Paparazzi d={since(opts.paparazzi, f)} her={her} camPos={camPos} />
      {num(opts.haze) > 0 ? <Haze v={num(opts.haze)} her={her} camPos={camPos} f={f} c={String(opts.haze_c ?? '#5b5aa8')} /> : null}
      {rain > 0.01 ? <Rain v={rain} her={her} f={f} wind={wind} dir={dir} /> : null}
      {wind > 0.01 ? <Wind v={wind} her={her} f={f} dir={dir} /> : null}
      <Splash d={since(opts.splash, f)} her={her} />
      <Slap d={since(opts.tail_slap, f)} her={her} />
      {num(opts.treadmill) > 0 ? <Treadmill speed={num(opts.treadmill)} her={her} f={f} fps={fps} camPos={camPos} /> : null}
      {opts.freeze ? <FrozenDust her={her} /> : null}
      <LightWriting d={since(opts.lightwriting, f)} her={her} camPos={camPos} text={String(opts.lightwriting_text ?? 'WATCH ME')} fps={fps} />
      <Centerfold d={since(opts.fold, f)} her={her} camPos={camPos} title={String(opts.fold_title ?? 'WATCH ME')} fps={fps} />
      <LettersOff d={since(opts.letters_off, f)} her={her} text={String(opts.letters_text ?? 'HURRICANE')} dir={dir} />
      {tails}
    </group>
  );
};

/** The wet floor each set has by default (Watch Me: one shared look - a wet mirror floor in all three worlds). */
export const SET_WET: Record<string, number> = {shoot: 0.15, corner: 0.42, exhibit: 0};   // look-critic stills 4: the museum mirror put her legs in front of the plinth as see-through ghosts - a wet street yes, a mirror under a plinth no;   // stills 1: too faint; look-critic stills 3: the museum's mirror made ghost legs, a reflected lyric and black floor patches
