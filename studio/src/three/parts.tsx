// Reusable built props (hard rule 8: places, props and creatures are BUILT and identical between videos). Every part
// is deterministic (seeded), matte toon-shaded and animated by the frame only, so all render workers agree.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {blobTexture, canvasTexture, rnd, toon} from './look';

type P3 = [number, number, number];

const geoCache = new Map<string, THREE.BufferGeometry>();
function cachedGeo(key: string, make: () => THREE.BufferGeometry): THREE.BufferGeometry {
  let g = geoCache.get(key);
  if (!g) { g = make(); geoCache.set(key, g); }
  return g;
}

export const RBox: React.FC<{size: P3; pos?: P3; rot?: P3; r?: number; c: string; e?: string; ei?: number; cast?: boolean; receive?: boolean}> = ({
  size, pos = [0, 0, 0], rot = [0, 0, 0], r = 0.04, c, e, ei, cast = true, receive = true,
}) => {
  const geo = cachedGeo(`rb${size}${r}`, () => new RoundedBoxGeometry(size[0], size[1], size[2], 3, Math.min(r, Math.min(...size) / 2 - 0.001)));
  return <mesh geometry={geo} material={toon(c, e, ei)} position={pos} rotation={rot} castShadow={cast} receiveShadow={receive} />;
};

/** A lumpy rock: a seeded, squashed icosphere (flat-ish bottom so it sits on the floor). */
export const Rock: React.FC<{pos: P3; size: P3; seed: number; c: string; rotY?: number}> = ({pos, size, seed, c, rotY = 0}) => {
  const geo = cachedGeo(`rock${seed}`, () => {
    const g = new THREE.IcosahedronGeometry(1, 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = 1 + 0.18 * Math.sin(v.x * 3.1 + seed) * Math.cos(v.z * 2.7 + seed * 1.3) + 0.08 * Math.sin(v.y * 5 + seed * 2);
      v.multiplyScalar(n);
      if (v.y < -0.35) v.y = -0.35 + (v.y + 0.35) * 0.3;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  });
  return <mesh geometry={geo} material={toon(c)} position={pos} scale={size} rotation={[0, rotY, 0]} castShadow receiveShadow />;
};

/** Kelp: a ribbon of segments that sways with the water (frame-driven). */
export const Kelp: React.FC<{pos: P3; h: number; f: number; seed: number; c: string; w?: number}> = ({pos, h, f, seed, c, w = 0.16}) => {
  const n = 9;
  const segs = [] as React.ReactNode[];
  let x = 0, y = 0, a = 0;
  for (let i = 0; i < n; i++) {
    const sway = 0.11 * Math.sin(f / 34 + seed + i * 0.55) * (i / n);
    a += sway;
    const len = h / n;
    const cx = x + Math.sin(a) * len / 2, cy = y + Math.cos(a) * len / 2;
    segs.push(
      <mesh key={i} position={[cx, cy, 0]} rotation={[0, 0, -a]} material={toon(c)} castShadow>
        <boxGeometry args={[w * (1 - i / (n * 1.6)), len * 1.08, 0.02]} />
      </mesh>,
    );
    x += Math.sin(a) * len; y += Math.cos(a) * len;
  }
  return <group position={pos} rotation={[0, rnd(seed) * Math.PI, 0]}>{segs}</group>;
};

/** Branching coral (cylinders + round tips), seeded. */
export const Coral: React.FC<{pos: P3; scale?: number; seed: number; c: string; tip?: string}> = ({pos, scale = 1, seed, c, tip}) => {
  const parts: React.ReactNode[] = [];
  const grow = (p: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, depth: number, id: string) => {
    const end = p.clone().addScaledVector(dir, len);
    const mid = p.clone().add(end).multiplyScalar(0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    parts.push(<mesh key={id} position={mid} quaternion={q} material={toon(c)} castShadow><cylinderGeometry args={[r * 0.75, r, len, 7]} /></mesh>);
    if (depth === 0) {
      parts.push(<mesh key={`${id}t`} position={end} material={toon(tip ?? c)} castShadow><sphereGeometry args={[r * 1.25, 10, 8]} /></mesh>);
      return;
    }
    const k = 2 + Math.floor(rnd(seed + depth * 7 + id.length) * 2);
    for (let i = 0; i < k; i++) {
      const s = seed + i * 13 + depth * 5 + id.length * 3;
      const d2 = dir.clone().add(new THREE.Vector3(rnd(s) - 0.5, 0.2, rnd(s + 1) - 0.5).multiplyScalar(1.4)).normalize();
      grow(end, d2, len * 0.72, r * 0.7, depth - 1, `${id}${i}`);
    }
  };
  grow(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 0.35, 0.06, 2, 'c');
  return <group position={pos} scale={scale}>{parts}</group>;
};

/** Rising bubbles from a source (aerator, a mouth, a vent); loops seamlessly. */
export const Bubbles: React.FC<{pos: P3; f: number; n?: number; h?: number; spread?: number; seed?: number; c?: string; size?: number}> = ({
  pos, f, n = 18, h = 4, spread = 0.25, seed = 1, c = '#cfefff', size = 0.05,
}) => {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({color: c, transparent: true, opacity: 0.55, toneMapped: false}), [c]);
  const geo = cachedGeo('bubble', () => new THREE.SphereGeometry(1, 12, 10));
  return (
    <group position={pos}>
      {Array.from({length: n}, (_, i) => {
        const speed = 0.012 + rnd(seed + i) * 0.012;
        const y = ((f * speed + rnd(seed + i * 3) * h) % h);
        const r = size * (0.5 + rnd(seed + i * 5));
        return <mesh key={i} geometry={geo} material={mat} scale={[r, r * (1 + 0.1 * Math.sin(f / 4 + i)), r]}
          position={[(rnd(seed + i * 7) - 0.5) * spread + 0.04 * Math.sin(f / 12 + i), y, (rnd(seed + i * 11) - 0.5) * spread]} />;
      })}
    </group>
  );
};

/** Sand / ground with soft dunes; receives shadows. */
export const Ground: React.FC<{size: [number, number]; c: string; pos?: P3; dunes?: number; seed?: number}> = ({size, c, pos = [0, 0, 0], dunes = 0.08, seed = 3}) => {
  const geo = cachedGeo(`ground${size}${dunes}${seed}`, () => {
    const g = new THREE.PlaneGeometry(size[0], size[1], 64, 48);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      p.setY(i, dunes * (Math.sin(x * 0.9 + seed) * Math.cos(z * 0.7 + seed) + 0.5 * Math.sin(x * 2.3 + z * 1.7)) - dunes);
    }
    g.computeVertexNormals();
    return g;
  });
  return <mesh geometry={geo} material={toon(c)} position={pos} receiveShadow />;
};

/** Moving caustic light on a floor (additive, unlit) - water above, without a single generated pixel. */
export const Caustics: React.FC<{size: [number, number]; pos: P3; f: number; c?: string; opacity?: number}> = ({size, pos, f, c = '#9ff6ff', opacity = 0.35}) => {
  const tex = useMemo(() => {
    const t = canvasTexture(`caustic${c}`, 512, 512, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = c; ctx.lineCap = 'round';
      for (let i = 0; i < 70; i++) {
        const x = rnd(i) * w, y = rnd(i + 100) * h, r = 20 + rnd(i + 200) * 46;
        ctx.lineWidth = 1.2 + rnd(i + 300) * 2.2;
        ctx.globalAlpha = 0.25 + rnd(i + 400) * 0.4;
        ctx.beginPath();
        for (let k = 0; k <= 7; k++) {
          const a = (k / 7) * Math.PI * 2, rr = r * (0.7 + 0.5 * rnd(i * 9 + k));
          const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
          if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }).clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(size[0] / 1.6, size[1] / 1.6);
    t.needsUpdate = true;
    return t;
  }, [c, size]);
  tex.offset.set(Math.sin(f / 70) * 0.08 + f * 0.0008, Math.cos(f / 85) * 0.08);
  return (
    <mesh position={pos} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={tex} transparent opacity={opacity * (0.85 + 0.15 * Math.sin(f / 9))} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

/** A visitor / audience member: a built silhouette (no faces, no generated people), optionally holding a phone. */
export const Visitor: React.FC<{pos: P3; h?: number; c: string; seed: number; phone?: number; f: number; flash?: number}> = ({pos, h = 1.7, c, seed, phone = 0, f, flash = 0}) => {
  const lean = (rnd(seed) - 0.5) * 0.08 + 0.02 * Math.sin(f / 40 + seed);
  const w = 0.42 + rnd(seed + 1) * 0.12;
  const headR = 0.12 + rnd(seed + 2) * 0.02;
  const hair = rnd(seed + 3) > 0.5;
  const ph = phone > 0;
  return (
    <group position={pos} rotation={[0, 0, lean]}>
      <RBox size={[w, h * 0.5, 0.26]} pos={[0, h * 0.5, 0]} r={0.12} c={c} />
      <RBox size={[w * 0.75, h * 0.32, 0.22]} pos={[0, h * 0.16, 0]} r={0.08} c={c} />
      <mesh position={[0, h * 0.84, 0]} material={toon(c)} castShadow><sphereGeometry args={[headR, 14, 12]} /></mesh>
      {hair ? <mesh position={[0, h * 0.86, -0.02]} material={toon(c)} castShadow><sphereGeometry args={[headR * 1.15, 12, 10, 0, Math.PI * 2, 0, Math.PI / 1.8]} /></mesh> : null}
      {ph ? (
        <group position={[0.12, h * 0.78 + 0.08 * phone, -0.22]} rotation={[0.1, 0, 0]}>
          <RBox size={[0.09, 0.16, 0.012]} r={0.006} c="#16121f" e={flash > 0 ? '#ffffff' : '#7fd8ff'} ei={flash > 0 ? 2.5 : 0.7} cast={false} />
          {flash > 0 ? (
            <mesh position={[0, 0, -0.05]}>
              <planeGeometry args={[1.4 * flash, 1.4 * flash]} />
              <meshBasicMaterial map={blobTexture('#ffffff')} transparent opacity={0.9 * flash} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
            </mesh>
          ) : null}
        </group>
      ) : null}
    </group>
  );
};

/** A sign / plaque / screen with painted text in Raymi's font (or a drawing callback). */
export const Sign: React.FC<{pos: P3; rot?: P3; size: [number, number]; id: string; paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  glow?: boolean; frame?: string; px?: number}> = ({pos, rot = [0, 0, 0], size, id, paint, glow = false, frame, px = 512}) => {
  const tex = canvasTexture(`sign${id}`, px, Math.round((px * size[1]) / size[0]), paint);
  return (
    <group position={pos} rotation={rot}>
      {frame ? <RBox size={[size[0] + 0.08, size[1] + 0.08, 0.05]} pos={[0, 0, -0.03]} r={0.02} c={frame} /> : null}
      <mesh position={[0, 0, 0.002]} receiveShadow={!glow}>
        <planeGeometry args={size} />
        {glow ? <meshBasicMaterial map={tex} toneMapped={false} /> : <meshToonMaterial map={tex} />}
      </mesh>
    </group>
  );
};

/** A visible light cone (spotlight beam in water / haze), additive. */
export const Beam: React.FC<{pos: P3; rot?: P3; len: number; r: number; c: string; opacity?: number}> = ({pos, rot = [0, 0, 0], len, r, c, opacity = 0.16}) => {
  const tex = canvasTexture(`beam${c}`, 64, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  return (
    <mesh position={pos} rotation={rot} renderOrder={8}>
      <coneGeometry args={[r, len, 32, 1, true]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
  );
};

/** Raymi's font on a canvas: draw text that fits a box (used by signs). */
export function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, px: number, color: string, opts: {align?: CanvasTextAlign; outline?: string; ow?: number; maxW?: number} = {}) {
  ctx.font = `${px}px Raymi`;
  ctx.textAlign = opts.align ?? 'center';
  ctx.textBaseline = 'middle';
  if (opts.maxW) {
    const w = ctx.measureText(text).width;
    if (w > opts.maxW) { px = (px * opts.maxW) / w; ctx.font = `${px}px Raymi`; }
  }
  if (opts.outline) { ctx.lineJoin = 'round'; ctx.strokeStyle = opts.outline; ctx.lineWidth = opts.ow ?? px * 0.12; ctx.strokeText(text, x, y); }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}
