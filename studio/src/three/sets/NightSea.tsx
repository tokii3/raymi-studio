// SET nightsea - the open sea at night (FIRESTARTER act 9, reusable: any surface-at-night moment). A calm sea to the
// horizon, a low moon, stars, a real cloud that can drift over the moon; the sea can glow FROM BELOW (a pool of light
// around her, gold dots of fish that surfaced, a path of light to the horizon, the whole sea pulsing); rain whose every
// drop lights a ring on the glowing water; fireworks shot up from under the surface. Under the surface: dark water,
// the heat column that carried her, her fish. Built, never generated (hard rule 8). The surface is opaque from above,
// so anything below the waterline (her legs while she treads water) is hidden like under a floor - except for a lens
// AT the waterline (|y| < 0.3, split_waterline): then the frame is half sky, half under water.
// Options (times song s -> frames; *_s seconds):
//   pool 0..1 | pool_at + pool_s       the violet pool of light around `pool_pos` (default the `pool` mark)
//   sea_glow 0..1 | sea_glow_at + _s   the whole sea glows from below; pulse_at [t] = a brighter ring runs outward
//   deep_glow 0..1                     far below, the vent field glows like a city (seen from under the surface)
//   dots_at [t, ...]                   one gold fish light surfaces per time (seeded spots behind her)
//   path 0..1 | path_at + path_s; path_dir (rad, 0 = toward -z)   the path of light to the horizon
//   cloud 0..1 | cloud_at + cloud_s    the cloud edge drifts over the moon
//   rain_at + rain_end_at              rain: streaks + a light ring per drop on the glowing water
//   fireworks [t, ...] + fw_from [[x, z], ...]   shells rise from under the water and burst in the sky (+ reflections)
//   column 0..1 | column_at; column_bend ...      the heat column under her (sets/Deep HeatColumn)
//   stars 0..1, moon false
//   fires / sparks / fish / school / salmon / props as in sets/Deep
import React from 'react';
import * as THREE from 'three';
import {SetLight, canvasTexture, rnd, toon} from '../look';
import {Fires, Sparks, add, glowTex} from '../fire';
import {DeepLife} from '../creatures';
import {HeatColumn, prog} from './Deep';
import {flare, frames} from '../events';
import type {SetProps} from './index';

type P3 = [number, number, number];
const VIOLET = '#b45cff', GOLD = '#ffc15a';
const MOON_DIR = new THREE.Vector3(-0.42, 0.13, -1).normalize();
const SKY_R = 160;

function skyTex(): THREE.CanvasTexture {
  return canvasTexture('nightsky', 16, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#03040f'); g.addColorStop(0.42, '#0a1036'); g.addColorStop(0.5, '#1d2a6a'); g.addColorStop(0.53, '#0b1236'); g.addColorStop(1, '#02030a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
}

function ringTex(c: string): THREE.CanvasTexture {
  return canvasTexture(`ring${c}`, 128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.75, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
}

/** The sea's glow pattern from below: soft cells of light (the fire under the water seen through it). */
function seaGlowTex(): THREE.CanvasTexture {
  return canvasTexture('seaglow', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 140; i++) {
      const x = rnd(i * 3 + 7) * w, y = rnd(i * 5 + 7) * h, r = 20 + rnd(i * 7) * 70;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const c = i % 4 === 0 ? '255,190,90' : '180,92,255';
      g.addColorStop(0, `rgba(${c},${0.25 + rnd(i) * 0.35})`); g.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  });
}

/** The lit sea floor seen from far above: crack lines and seven bright vent points (a city at night from a plane). */
function cityTex(): THREE.CanvasTexture {
  return canvasTexture('deepcity', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
    ctx.lineCap = 'round';
    for (let r = 0; r < 40; r++) {
      let x = w / 2 + (rnd(r * 3) - 0.5) * 60, y = h / 2 + (rnd(r * 5) - 0.5) * 60, a = rnd(r * 7) * Math.PI * 2;
      ctx.strokeStyle = r % 3 ? 'rgba(200,110,255,0.7)' : 'rgba(255,170,90,0.7)';
      ctx.lineWidth = 1 + rnd(r) * 1.5;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let i = 0; i < 30; i++) { a += (rnd(r * 31 + i) - 0.5) * 0.9; x += Math.cos(a) * 8; y += Math.sin(a) * 8; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    for (let i = 0; i < 7; i++) {
      const x = w / 2 + (rnd(i * 13) - 0.5) * 220, y = h / 2 + (rnd(i * 17) - 0.5) * 220;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 22);
      g.addColorStop(0, 'rgba(255,230,190,1)'); g.addColorStop(1, 'rgba(255,140,60,0)');
      ctx.fillStyle = g; ctx.fillRect(x - 22, y - 22, 44, 44);
    }
  });
}

/** Where a light point (x, y, z) above the water shows its reflection on the surface for a lens at C. */
function reflectionOnWater(p: THREE.Vector3, C: THREE.Vector3): THREE.Vector3 | null {
  if (C.y <= 0.05 || p.y <= 0) return null;
  const m = new THREE.Vector3(p.x, -p.y, p.z);
  const t = C.y / (C.y + p.y);
  return C.clone().lerp(m, t);
}

/** A shell from under the water that bursts in the sky into a sphere of sparks (and its reflection on the sea). */
const Firework: React.FC<{from: [number, number]; at: number; f: number; seed: number; cam: THREE.Vector3; top?: number}> = ({from, at, f, seed, cam, top = 16}) => {
  const d = f - at, rise = 26, life = 50;
  if (d < 0 || d > rise + life) return null;
  const c = seed % 2 ? GOLD : VIOLET;
  const halo = glowTex(c);
  if (d < rise) {
    const u = d / rise, y = -5 + (top + 5) * (1 - (1 - u) ** 2);
    return (
      <group position={[from[0], y, from[1]]}>
        <mesh scale={0.12}><sphereGeometry args={[1, 8, 6]} /><meshBasicMaterial color="#fff2dc" toneMapped={false} /></mesh>
        <mesh scale={[0.05, 1.4, 0.05]} position={[0, -0.7, 0]}><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color={c} {...add} opacity={0.5} /></mesh>
        {y < 0 ? <pointLight color={c} intensity={4} distance={6} decay={1.5} /> : null}
      </group>
    );
  }
  const b = (d - rise) / life, R = 1 + 6.5 * (1 - (1 - b) ** 3);
  const pts = Array.from({length: 44}, (_, i) => {
    const a = rnd(seed + i) * Math.PI * 2, e = Math.acos(2 * rnd(seed + i * 3) - 1);
    return new THREE.Vector3(Math.sin(e) * Math.cos(a) * R, Math.cos(e) * R - b * b * 2.5, Math.sin(e) * Math.sin(a) * R).add(new THREE.Vector3(from[0], top, from[1]));
  });
  return (
    <group>
      {b < 0.25 ? <mesh position={[from[0], top, from[1]]} scale={6 * (1 + b * 4)} renderOrder={11}><sphereGeometry args={[0.5, 12, 8]} />
        <meshBasicMaterial map={halo} {...add} opacity={0.8 * (1 - b * 4)} side={THREE.BackSide} /></mesh> : null}
      {pts.map((p, i) => (
        <mesh key={i} position={p} scale={0.09 * (1 - b * 0.6)} renderOrder={11}><sphereGeometry args={[1, 6, 5]} />
          <meshBasicMaterial color={i % 3 ? c : '#fff2dc'} {...add} opacity={1 - b} /></mesh>
      ))}
      {pts.filter((_, i) => i % 3 === 0).map((p, i) => {
        const r = reflectionOnWater(p, cam);
        return r ? <mesh key={`r${i}`} position={[r.x, 0.03, r.z]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.25, 0.9, 1]} renderOrder={6}>
          <planeGeometry args={[1, 1]} /><meshBasicMaterial map={halo} {...add} opacity={0.45 * (1 - b)} /></mesh> : null;
      })}
      <pointLight position={[from[0], top, from[1]]} color={c} intensity={30 * (1 - b)} distance={60} decay={1.2} />
    </group>
  );
};

export const NightSea: React.FC<SetProps> = ({f, fps, opts, camPos}) => {
  const o = opts;
  const C = new THREE.Vector3(...(camPos ?? [0, 1.5, 6]));
  const under = C.y < 0;
  const split = Math.abs(C.y) < 0.3;              // the lens AT the waterline: half sky, half under water (split_waterline)
  const pool = prog(o, 'pool', f, fps, 1);
  const glow = prog(o, 'sea_glow', f, fps, 2);
  const path = prog(o, 'path', f, fps, 3);
  const cloud = prog(o, 'cloud', f, fps, 4);
  const poolPos = (o.pool_pos as P3) ?? [0, 0, 0];
  const stars = Number(o.stars ?? 1);
  const moonP = MOON_DIR.clone().multiplyScalar(SKY_R * 0.8);
  const pulses = frames(o.pulse_at);
  const halo = glowTex(VIOLET);
  const pathDir = Number(o.path_dir ?? 0);
  const rainOn = typeof o.rain_at === 'number' && f >= o.rain_at && !(typeof o.rain_end_at === 'number' && f >= o.rain_end_at);
  const rainT = typeof o.rain_at === 'number' ? f - o.rain_at : -1;
  const seaGlow = seaGlowTex();
  seaGlow.wrapS = seaGlow.wrapT = THREE.RepeatWrapping;
  seaGlow.repeat.set(10, 10);
  seaGlow.offset.set(f * 0.0004, f * 0.0002);
  return (
    <group>
      <SetLight sky="#2a3a8a" ground="#05040e" fill={0.35 + 0.3 * glow} key="#b9c8ff" keyI={0.55} keyPos={[moonP.x * 0.1, 12, moonP.z * 0.1]}
        target={[0, 0, 0]} shadowSize={8} fog={under ? '#070a24' : '#16205a'} fogNear={under ? 3 : 12} fogFar={under ? 26 : 130} />
      {/* the sky: gradient dome, stars, the low moon (+ its halo and its path on the water), the cloud */}
      <mesh scale={SKY_R} renderOrder={-10}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial map={skyTex()} side={THREE.BackSide} fog={false} depthWrite={false} toneMapped={false} />
      </mesh>
      {stars > 0 ? Array.from({length: 520}, (_, i) => {
        const a = rnd(i * 3 + 1) * Math.PI * 2, e = 0.03 + Math.pow(rnd(i * 5 + 2), 0.7) * 1.45;
        const p = new THREE.Vector3(Math.cos(e) * Math.cos(a), Math.sin(e), Math.cos(e) * Math.sin(a)).multiplyScalar(SKY_R * 0.9);
        const tw = 0.6 + 0.4 * Math.sin(f / (6 + rnd(i) * 9) + i);
        const hidden = cloud > 0 && p.clone().normalize().angleTo(MOON_DIR) < 0.25 * cloud;
        return hidden ? null : <mesh key={i} position={p} scale={(0.12 + rnd(i * 7) * 0.28) * (rnd(i) > 0.97 ? 2.2 : 1)}>
          <sphereGeometry args={[1, 5, 4]} /><meshBasicMaterial color={rnd(i * 11) > 0.85 ? '#ffe6c4' : '#dfe6ff'} transparent opacity={tw * stars} fog={false} toneMapped={false} />
        </mesh>;
      }) : null}
      {o.moon !== false ? (
        <group position={moonP}>
          <mesh scale={6.5}><sphereGeometry args={[1, 32, 20]} /><meshBasicMaterial color="#fff6e2" fog={false} toneMapped={false} /></mesh>
          <mesh scale={30} renderOrder={-5}><sphereGeometry args={[0.5, 16, 12]} /><meshBasicMaterial map={glowTex('#9fb2ff')} {...add} opacity={0.5 * (1 - 0.6 * cloud)} fog={false} side={THREE.BackSide} /></mesh>
        </group>
      ) : null}
      {/* the cloud: dark lumps that drift in front of the moon */}
      <group position={MOON_DIR.clone().multiplyScalar(SKY_R * 0.7).add(new THREE.Vector3(-28 + 26 * cloud, 2, 0))}>
        {Array.from({length: 9}, (_, i) => (
          <mesh key={i} position={[(i - 4) * 4.2 + rnd(i) * 2, Math.sin(i * 1.3) * 1.6, rnd(i + 3) * 3]} scale={[6 + rnd(i * 5) * 4, 3 + rnd(i * 7) * 2, 3]}>
            <sphereGeometry args={[1, 14, 10]} /><meshBasicMaterial color="#0d1230" fog={false} transparent opacity={0.96} />
          </mesh>
        ))}
        {Array.from({length: 7}, (_, i) => (
          <mesh key={`rim${i}`} position={[(i - 3) * 5 + rnd(i) * 2, 1.4 + Math.sin(i) * 1.2, 3.2]} scale={[5, 1.2, 1]}>
            <sphereGeometry args={[1, 10, 8]} /><meshBasicMaterial color="#7f8fd6" fog={false} transparent opacity={0.22 * cloud} />
          </mesh>
        ))}
      </group>
      {/* the sea surface: opaque from above (hides what is under the waterline), a silvery skin from below */}
      {!split ? (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -60]} material={toon('#0a1030')} receiveShadow>
            <planeGeometry args={[400, 400, 1, 1]} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.005, -60]}>
            <planeGeometry args={[400, 400]} />
            <meshBasicMaterial color="#26306a" transparent opacity={0.85} side={THREE.FrontSide} />
          </mesh>
        </group>
      ) : (
        // at the waterline: no surface sheet - the bright skin of the water is one line across the frame
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[C.x, 0, C.z - 55]} renderOrder={6}>
          <planeGeometry args={[200, 80]} />
          <meshBasicMaterial color="#9fb2ff" {...add} opacity={0.3} fog={false} />
        </mesh>
      )}
      {/* moonlight on the water: a shimmering path toward the moon */}
      {!under && !split ? Array.from({length: 70}, (_, i) => {
        const t = rnd(i * 3), dist = 8 + t * 90;
        const p = new THREE.Vector3(MOON_DIR.x, 0, MOON_DIR.z).normalize().multiplyScalar(dist);
        const w = 0.6 + dist * 0.06;
        return <mesh key={`m${i}`} position={[p.x + (rnd(i * 5) - 0.5) * w * 2, 0.02, p.z]} rotation={[-Math.PI / 2, 0, 0]}
          scale={[w * (0.6 + 0.4 * Math.sin(f / 7 + i)), 0.5 + dist * 0.03, 1]} renderOrder={4}>
          <planeGeometry args={[1, 1]} /><meshBasicMaterial color="#cfd8ff" {...add} opacity={0.55 * (1 - 0.7 * cloud)} />
        </mesh>;
      }) : null}
      {/* the sea glows from below: its pattern, the pool around her, pulses, the gold fish, the path */}
      {glow > 0 && !under ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, -60]} renderOrder={5}>
          <planeGeometry args={[400, 400]} />
          <meshBasicMaterial map={seaGlow} {...add} opacity={0.75 * glow} />
        </mesh>
      ) : null}
      {pool > 0 ? (
        <group position={[poolPos[0], 0.02, poolPos[2]]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={7 * pool} renderOrder={5}><planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={halo} {...add} opacity={0.95} /></mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={2.6 * pool} renderOrder={5}><planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={glowTex('#ffd9b0')} {...add} opacity={0.6} /></mesh>
          <pointLight position={[0, -0.4, 0]} color={VIOLET} intensity={9 * pool} distance={6} decay={1.4} />
        </group>
      ) : null}
      {pulses.map((t, k) => {
        const d = f - t;
        if (d < 0 || d > 90) return null;
        const R = 1 + d * 0.9;
        return <mesh key={`pl${k}`} position={[poolPos[0], 0.025, poolPos[2]]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={6}>
          <ringGeometry args={[R * 0.82, R, 96]} /><meshBasicMaterial color="#e6b8ff" {...add} opacity={0.7 * (1 - d / 90)} /></mesh>;
      })}
      {frames(o.dots_at).map((t, k) => {
        if (f < t) return null;
        const a = 2.4 + rnd(k * 7) * 1.4 - k * 0.35, d = 2.2 + k * 0.9 + rnd(k) * 1.2;
        const p: P3 = [poolPos[0] + Math.cos(a) * d, 0.04, poolPos[2] - Math.abs(Math.sin(a)) * d];
        const pop = Math.min(1, (f - t) / 6);
        return <group key={`dot${k}`} position={p}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={1.6 * pop} renderOrder={6}><planeGeometry args={[1, 1]} /><meshBasicMaterial map={glowTex(GOLD)} {...add} opacity={0.9} /></mesh>
          <mesh scale={0.07 * pop}><sphereGeometry args={[1, 8, 6]} /><meshBasicMaterial color="#fff0c8" toneMapped={false} /></mesh>
          <pointLight color={GOLD} intensity={2 * pop} distance={3} decay={1.6} />
        </group>;
      })}
      {path > 0 ? Array.from({length: 60}, (_, i) => {
        const u = i / 60;
        if (u > path) return null;
        const dist = 2 + u * u * 140;
        const x = poolPos[0] + Math.sin(pathDir) * -dist + Math.sin(u * 9) * 0.6, z = poolPos[2] - Math.cos(pathDir) * dist;
        const w = 1.4 + dist * 0.05;
        return <mesh key={`pa${i}`} position={[x, 0.022, z]} rotation={[-Math.PI / 2, 0, 0]} scale={[w, w * 0.8, 1]} renderOrder={5}>
          <planeGeometry args={[1, 1]} /><meshBasicMaterial map={ringTex(i % 3 ? '#c98bff' : '#ffcf7a')} {...add} opacity={0.9 * (1 - u * 0.5) * (0.8 + 0.2 * Math.sin(f / 6 + i))} />
        </mesh>;
      }) : null}
      {/* rain: streaks around the lens + a ring of light where each drop lands */}
      {rainOn ? (
        <group>
          {Array.from({length: 120}, (_, i) => {
            const T = 18, t = ((f + rnd(i * 3) * T) % T) / T;
            const x = C.x + (rnd(i * 5) - 0.5) * 12, z = C.z - 1 - rnd(i * 7) * 12, y = 7 * (1 - t);
            return <mesh key={`rs${i}`} position={[x, y, z]} scale={[0.008, 0.38, 0.008]} renderOrder={8}>
              <boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color="#bfcaff" transparent opacity={0.4 * Math.min(1, rainT / 10)} depthWrite={false} />
            </mesh>;
          })}
          {Array.from({length: 90}, (_, i) => {
            const T = 26, ph = rnd(i * 13) * T, d = (f + ph) % T, cyc = Math.floor((f + ph) / T);
            const x = C.x + (rnd(i * 5 + cyc * 17) - 0.5) * 14, z = C.z - 1.5 - rnd(i * 7 + cyc * 29) * 14;
            const R = 0.05 + (d / T) * 0.8;
            return <mesh key={`rr${i}`} position={[x, 0.03, z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={6}>
              <ringGeometry args={[R * 0.78, R, 32]} /><meshBasicMaterial color={i % 3 ? '#d7a6ff' : '#ffd38a'} {...add} opacity={0.9 * (1 - d / T) * Math.min(1, rainT / 10) * (0.4 + 0.6 * Math.max(glow, pool))} />
            </mesh>;
          })}
        </group>
      ) : null}
      {/* fireworks from under the water */}
      {frames(o.fireworks).map((t, k) => {
        const from = (Array.isArray(o.fw_from) ? (o.fw_from as [number, number][])[k % (o.fw_from as unknown[]).length] : null)
          ?? [(rnd(k * 9) - 0.5) * 24, -14 - rnd(k * 3) * 30] as [number, number];
        return <Firework key={`fw${k}`} from={from} at={t} f={f} seed={k * 7 + 1} cam={C} top={14 + rnd(k * 5) * 8} />;
      })}
      {/* far below: the vent field she lit, glowing like a city at night */}
      {Number(o.deep_glow ?? 0) > 0 ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -38, -10]} renderOrder={-3}>
          <planeGeometry args={[90, 90]} />
          <meshBasicMaterial map={cityTex()} {...add} opacity={Number(o.deep_glow)} fog={false} />
        </mesh>
      ) : null}
      {/* under the surface: the dark water box and the heat column that carried her */}
      {under || split ? (
        <mesh position={[0, -20.02, -20]} renderOrder={-4}>
          <boxGeometry args={[120, 39.96, 120]} />
          <meshBasicMaterial color="#0c1442" side={THREE.BackSide} depthWrite={false} fog={false} />
        </mesh>
      ) : null}
      <HeatColumn base={(o.column_pos as P3) ?? [poolPos[0], -46, poolPos[2]]} f={f} grow={prog(o, 'column', f, fps, 1)} bend={prog(o, 'column_bend', f, fps, 0.6)} dir={1}
        pulse={flare(o.column_pulse, f, 10)} height={46} r={0.9} />
      <Fires list={o.fires} f={f} />
      <Sparks list={o.sparks} f={f} />
      <DeepLife opts={o} f={f} fps={fps} camPos={camPos} />
    </group>
  );
};
