// The sea floor around the undersea cables (toki 2026-10-28 on Love is War take 14: "kabel unter see sieht sehr
// langweilig, leer und ohne tiefe aus"). Before, the cables were lit tubes in black fog over a 40 m patch of basalt:
// nothing in front, nothing behind, no floor past the patch. Now a place you could dive in, in depth layers:
//   near   - sand with ripples and silt specks, the cable half sunk in it on a berm, rocks and kelp clumps along it,
//            barnacle growth on the armour
//   middle - more rocks and kelp along every cable, light shafts from the surface swaying through the water
//   far    - three rows of low ridges, each further one paler and bluer in the fog (aerial perspective under water)
// Reusable in any set with cables (opts.seabed 0..1; Deep.tsx turns its fog blue and lifts its fill with it).
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {canvasTexture, rnd, toon} from './look';
import {Kelp, Rock} from './parts';
import {add, glowTex} from './fire';
import {cablePath} from './cables';

type P3 = [number, number, number];
const SAND = '#56628f', SAND_DARK = '#323b62', ROCKC = '#2b2f48', KELP = '#24453f', KELP2 = '#3a3f62', BARN = '#4d5677';

/** Rippled sand: soft light / dark bands plus silt specks, tiled. */
function sandTexture(): THREE.CanvasTexture {
  const t = canvasTexture('seabed_sand', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = SAND; ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 2) {                       // ripples: wavy bands, light on the crest, dark in the trough
      const v = Math.sin(y * 0.09 + 2.2 * Math.sin(y * 0.013)) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(${v > 0.5 ? '150,165,210' : '12,16,34'},${Math.abs(v - 0.5) * 0.22})`;
      ctx.fillRect(0, y, w, 2);
    }
    for (let i = 0; i < 2600; i++) {                       // silt and shell grit
      const x = rnd(i) * w, y = rnd(i + 7000) * h, s = 0.6 + rnd(i + 9000) * 1.8;
      ctx.fillStyle = rnd(i + 11000) > 0.7 ? 'rgba(190,200,235,0.35)' : 'rgba(8,10,24,0.35)';
      ctx.fillRect(x, y, s, s);
    }
  }).clone();
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(40, 40);
  t.needsUpdate = true;
  return t;
}

const floorGeo = (() => {
  let g: THREE.PlaneGeometry | null = null;
  return () => {
    if (g) return g;
    g = new THREE.PlaneGeometry(240, 240, 160, 160);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      // long dunes + small ripples; the floor falls away slowly into the distance (a slope reads as depth)
      p.setY(i, 0.35 * Math.sin(x * 0.11 + 1.3) * Math.cos(z * 0.08) + 0.06 * Math.sin(x * 0.7 + z * 0.4) - 0.08 + Math.min(0, z + 20) * 0.03);
    }
    g.computeVertexNormals();
    return g;
  };
})();

/** Barnacles / growth on the cable armour: one instanced mesh per cable. */
const Growth: React.FC<{curve: THREE.CatmullRomCurve3; r: number; seed: number}> = ({curve, r, seed}) => {
  const mesh = useMemo(() => {
    const n = 70;
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 7, 5), toon(BARN), n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      const u = rnd(seed + i * 3), p = curve.getPointAt(u), tg = curve.getTangentAt(u);
      const side = new THREE.Vector3(tg.z, 0, -tg.x).normalize();
      const a = (rnd(seed + i * 5) - 0.5) * Math.PI * 1.2;          // the upper side of the cable (the lower one is in the sand)
      o.position.copy(p).addScaledVector(side, Math.sin(a) * r).add(new THREE.Vector3(0, Math.cos(a) * r, 0));
      const s = r * (0.08 + rnd(seed + i * 7) * 0.14);
      o.scale.set(s, s * 0.6, s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }, [curve, r, seed]);
  return <primitive object={mesh} />;
};

export const Seabed: React.FC<{o: Record<string, unknown>; f: number; fps: number; camPos: P3}> = ({o, f, fps, camPos}) => {
  const amount = Number(o.seabed ?? 0);
  const sand = useMemo(() => sandTexture(), []);
  const n = Number(o.cables ?? 0), seed = Number(o.cable_seed ?? 3), r = Number(o.cable_r ?? 0.11);
  const curves = useMemo(() => Array.from({length: n}, (_, i) => cablePath(i, seed)), [n, seed]);
  if (amount <= 0) return null;
  // the sand carries a little of its own colour: under the war_night grade a toon floor lit only from above went black
  // (take 15 stills: the whole seabed read as a black void)
  const sandMat = toon(SAND, '#26305a', 1);
  sandMat.map = sand;
  const t = f / fps;
  // the floor follows the lens in whole tiles, so it never ends in the frame and its texture never slides
  const fx = Math.round(camPos[0] / 6) * 6, fz = Math.round(camPos[2] / 6) * 6;
  return (
    <group userData={{noSupport: false}}>
      {/* light from the surface: a cool sky above, the sand bouncing a little back */}
      <hemisphereLight args={['#9db4f0', '#2a3360', 1.6 * amount]} />
      <directionalLight position={[fx + 4, 30, fz - 6]} color='#b8c8ff' intensity={1.2 * amount} />
      <mesh geometry={floorGeo()} material={sandMat} position={[fx, 0, fz]} receiveShadow />
      {curves.map((c, i) => {
        const L = c.getLength(), items: React.ReactNode[] = [];
        for (let k = 0; k * 2.2 < L; k++) {
          const u = (k * 2.2 + rnd(i * 31 + k) * 1.2) / L;
          if (u > 1) break;
          const p = c.getPointAt(u), tg = c.getTangentAt(u);
          const side = new THREE.Vector3(tg.z, 0, -tg.x).normalize();
          const sgn = rnd(i * 13 + k) > 0.5 ? 1 : -1, off = r * 2.2 + 0.25 + rnd(i * 17 + k) * 1.6;
          const q: P3 = [p.x + side.x * off * sgn, 0, p.z + side.z * off * sgn];
          // the berm: sand pushed up along the cable, so it lies IN the floor, not on it
          items.push(<mesh key={`b${k}`} position={[p.x, -0.02, p.z]} rotation={[0, Math.atan2(tg.x, tg.z), 0]} scale={[r * 3.4, r * 1.1, 1.5]}
            material={toon(SAND_DARK)} receiveShadow><sphereGeometry args={[1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>);
          const roll = rnd(i * 7 + k * 3);
          if (roll < 0.45) {
            const s = 0.15 + rnd(i * 5 + k) * 0.55;
            items.push(<Rock key={`r${k}`} pos={[q[0], s * 0.2, q[2]]} size={[s * 1.4, s * 0.75, s]} seed={i * 50 + k} c={ROCKC} rotY={roll * 9} />);
            if (roll < 0.15) items.push(<Rock key={`r2${k}`} pos={[q[0] + 0.4, 0.04, q[2] + 0.3]} size={[s * 0.5, s * 0.3, s * 0.45]} seed={i * 50 + k + 7} c={ROCKC} />);
          } else if (roll < 0.75) {
            for (let j = 0; j < 3; j++) {
              items.push(<Kelp key={`k${k}_${j}`} pos={[q[0] + (rnd(k * 9 + j) - 0.5) * 0.6, 0, q[2] + (rnd(k * 11 + j) - 0.5) * 0.6]}
                h={0.9 + rnd(i * 3 + k + j) * 2.4} f={f} seed={i * 40 + k * 3 + j} c={j % 2 ? KELP2 : KELP} w={0.12} />);
            }
          }
        }
        return <group key={i}>{items}<Growth curve={c} r={r} seed={i * 97 + seed} /></group>;
      })}
      {/* the far rows: low ridges, each further one fainter in the fog (fog does the fading; no line art) */}
      {[38, 62, 95].map((d, row) => Array.from({length: 9}, (_, k) => {
        const s = 6 + rnd(row * 20 + k) * 9 + row * 4;
        return <Rock key={`far${row}_${k}`} pos={[fx + (k - 4) * 16 + rnd(row + k) * 8, s * 0.12 - 0.3, fz - d - rnd(k * 3 + row) * 10]}
          size={[s * 1.6, s * (0.35 + rnd(k + row * 7) * 0.4), s]} seed={row * 30 + k + 200} c={ROCKC} rotY={rnd(k) * 6} />;
      }))}
      {/* light shafts from the surface: long soft wedges that sway, more ahead of the lens than behind it */}
      {Array.from({length: 9}, (_, k) => {
        const x = fx + (rnd(k * 3 + 1) - 0.5) * 40, z = fz - 6 - rnd(k * 5 + 2) * 34;
        const sway = 0.06 * Math.sin(t * 0.4 + k * 1.7);
        const op = (0.12 + 0.08 * rnd(k)) * amount * (0.8 + 0.2 * Math.sin(t * 0.7 + k));
        return <mesh key={`sh${k}`} position={[x, 9, z]} rotation={[0, rnd(k * 9) * Math.PI, 0.18 + sway]} renderOrder={5}>
          <planeGeometry args={[1.6 + rnd(k * 7) * 2.4, 22]} />
          <meshBasicMaterial map={glowTex('#9fb8ff')} {...add} opacity={op} fog={false} />
        </mesh>;
      })}
    </group>
  );
};
