// Undersea data cables on the sea floor with light pulses running through them (Love is War idea C, 2026-10-25;
// reusable in any floor set). Real cables are armoured black lines across the abyss - here a pulse of light runs
// along them on a beat: the signal she can feel with her electro-sense (canvas T02). Built, never generated.
// opts.cable_r = tube radius (m, default 0.11); opts.cables = n (number of cables, 0 = none) | opts.cable_seed; opts.cable_pulse = [frame, ...] (song seconds in
// shots.json) or 'beats'; opts.cable_speed (m/s, default 40); opts.cable_glow 0..1 (the whole line lit, a held moment)
import React from 'react';
import * as THREE from 'three';
import {rnd, toon, toonPaint} from './look';
import {add, glowTex} from './fire';
import {frames} from './events';

const CYAN0 = '#5ef2ff';

export function cablePath(i: number, seed: number): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = [];
  const x0 = (rnd(seed + i * 7) - 0.5) * 30, x1 = (rnd(seed + i * 11) - 0.5) * 8 + (i - 1) * 1.6;
  for (let k = 0; k <= 8; k++) {
    const u = k / 8, z = -70 + u * 78;                     // from the far dark to just past the lens side
    const x = x0 + (x1 - x0) * u + Math.sin(u * 7 + i) * 1.2;
    pts.push(new THREE.Vector3(x, 0.1 + 0.03 * Math.sin(k * 2.3 + i), z));   // half sunk in the sand (seabed.tsx berms)
  }
  return new THREE.CatmullRomCurve3(pts);
}

export const SeaCables: React.FC<{opts: Record<string, unknown>; f: number; fps: number; beats: number[]}> = ({opts, f, fps, beats}) => {
  const n = Number(opts.cables ?? 0);
  if (n <= 0) return null;
  const seed = Number(opts.cable_seed ?? 3);
  const speed = Number(opts.cable_speed ?? 40);
  const glow = Number(opts.cable_glow ?? 0);
  const pulses = opts.cable_pulse === 'beats' ? beats : frames(opts.cable_pulse);
  const CYAN = String(opts.cable_color ?? CYAN0);
  // ridged armour; lit, only a thin seam glows along its top - the whole tube lit read as a flat cyan plank
  // (toki 2026-10-28 take 14 "kabel unter see ... langweilig, leer")
  const skin = toonPaint('#1a1c28', 'rubber', '#0b1424', [60, 1]);   // no colour in the armour: lit it read as green or pink pipes (take 19)
  const r = Number(opts.cable_r ?? 0.11);
  return (
    <group userData={{noSupport: true}}>
      {Array.from({length: n}, (_, i) => {
        const c = cablePath(i, seed);
        const L = c.getLength();
        return (
          <group key={i}>
            <mesh material={skin} castShadow receiveShadow><tubeGeometry args={[c, 160, r, 10, false]} /></mesh>
            {glow > 0 ? <mesh position={[0, r * 0.82, 0]}><tubeGeometry args={[c, 160, r * 0.16, 6, false]} />
              <meshBasicMaterial color={CYAN} transparent opacity={0.35 + 0.6 * glow} toneMapped={false} /></mesh> : null}
            {/* armour joints every few metres: the cable reads as a real thing, not a line */}
            {Array.from({length: Math.floor(L / 3)}, (_, k) => {
              const u = (k + 0.5) / Math.floor(L / 3), p = c.getPointAt(u), tg = c.getTangentAt(u);
              const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tg);
              return <mesh key={k} position={p} quaternion={q} material={glow > 0.3 ? skin : toon('#262836')}><cylinderGeometry args={[r * 1.45, r * 1.45, 0.22, 12]} /></mesh>;
            })}
            {pulses.map((t, k) => {
              const d = (f - t) / fps;                      // seconds since the pulse left the far end
              const u = (d * speed + i * 3) / L;
              if (d < 0 || u > 1) return null;
              const p = c.getPointAt(Math.min(1, u));
              return <group key={`p${k}`} position={p}>
                <mesh scale={[0.12, 0.12, 0.12]}><sphereGeometry args={[1, 10, 8]} /><meshBasicMaterial color="#e9fdff" toneMapped={false} /></mesh>
                <mesh scale={1.5} renderOrder={9}><planeGeometry args={[1, 1]} /><meshBasicMaterial map={glowTex(CYAN)} {...add} opacity={0.9} /></mesh>
                {i === 0 ? <pointLight color={CYAN} intensity={6} distance={7} decay={1.6} /> : null}
              </group>;
            })}
          </group>
        );
      })}
    </group>
  );
};
