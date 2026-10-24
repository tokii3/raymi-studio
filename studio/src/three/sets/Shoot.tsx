// SET shoot - Watch Me idea A "The Shoot": a photo studio at night. A white paper cyclorama (floor sweeping up into the
// back wall without an edge) at the centre, her mark on the paper (origin); around it the dark working studio: concrete
// floor, two softboxes on stands, C-stands with sandbags, cables on the floor, a camera on
// a tripod, a rolling rack with clothes, a work light far back. The paper takes the colour of the gel light.
// Options:
//   gel: "#hex"        the backdrop light's colour (the paper turns that colour; default warm white)
//   flash: [t, ...]    studio flashes (song seconds -> frames): the whole set blinks white and decays in 5 frames
//   dark: 0..1 | dark_at: [[t, v]] + dark_s   the studio blows a fuse - only her own light stays
//   stage / fish / salmon / props   three/staging.tsx, creatures.tsx (the Salmon as her photographer)
import React from 'react';
import * as THREE from 'three';
import {RBox} from '../parts';
import {SetLight, runTo, toon, toonSurface} from '../look';
import {DeepLife} from '../creatures';
import {Stagings} from '../staging';
import type {SetProps} from './index';

const num = (v: unknown, d = 0) => (typeof v === 'number' ? v : d);

/** The paper sweep: floor (z 0..2.2), a quarter circle (r 1.6), the wall up to 4.5 m - one bent sheet, no edge. */
function sweepGeometry(w: number): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [];
  const R = 1.6, floor = 2.4, wallH = 4.6;
  pts.push(new THREE.Vector2(floor, 0));
  for (let i = 0; i <= 16; i++) { const a = (i / 16) * (Math.PI / 2); pts.push(new THREE.Vector2(-Math.sin(a) * R, R - Math.cos(a) * R)); }
  pts.push(new THREE.Vector2(-R, wallH));
  const g = new THREE.BufferGeometry();
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  let len = 0;
  pts.forEach((p, i) => {
    if (i) len += p.distanceTo(pts[i - 1]);
    for (const s of [-1, 1]) { pos.push((s * w) / 2, p.y, p.x); uv.push((s + 1) / 2, len / 8); }
  });
  for (let i = 0; i < pts.length - 1; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  g.setIndex(idx);
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

const Stand: React.FC<{pos: [number, number, number]; h: number}> = ({pos, h}) => (
  <group position={pos}>
    <mesh position={[0, h / 2, 0]} material={toon('#1d1e28')} castShadow><cylinderGeometry args={[0.02, 0.025, h, 8]} /></mesh>
    {[0, 2.1, 4.2].map((a) => <mesh key={a} position={[Math.cos(a) * 0.25, 0.12, Math.sin(a) * 0.25]} rotation={[0, -a, 0.95]} material={toon('#1d1e28')}>
      <cylinderGeometry args={[0.012, 0.012, 0.6, 6]} /></mesh>)}
    <RBox size={[0.22, 0.1, 0.12]} pos={[0.2, 0.05, 0.2]} r={0.03} c="#4a3a2a" t="fabric" />
  </group>
);

export const Shoot: React.FC<SetProps> = ({f, fps, opts, camPos}) => {
  const dark = Math.max(0, Math.min(1, runTo(num(opts.dark), opts.dark_at, num(opts.dark_s, 0.2), f)));
  const on = 1 - dark;
  // blackout: the set's whole light goes, not only its lamps (boards run 1: 'dark' left her lit as by day)
  const dim = 0.16 + 0.84 * on;   // blackout: the place stays readable (look-critic boards 1: 'a black void')
  const dimC = (c: string) => new THREE.Color(c).lerp(new THREE.Color('#010103'), dark).getStyle();
  const flashes = (Array.isArray(opts.flash) ? opts.flash : []) as number[];
  const fl = flashes.reduce((m, t) => (f >= t && f - t < 6 ? Math.max(m, 1 - (f - t) / 6) : m), 0) * on;
  const gel = typeof opts.gel === 'string' ? opts.gel : '#fff1e0';
  const geo = React.useMemo(() => sweepGeometry(7.5), []);
  const paper = React.useMemo(() => new THREE.MeshToonMaterial({color: '#f4f1ec', side: THREE.DoubleSide}), []);
  paper.color.set('#d6d1c9').lerp(new THREE.Color(gel), 0.5);   // never a white wall: boards run 1 read flat and washed
  paper.emissive.set(gel);
  paper.emissiveIntensity = 0.03 * on + 0.3 * fl;
  const spot = React.useMemo(() => { const l = new THREE.SpotLight('#ffffff', 0, 12, 0.7, 0.6, 1.2); l.castShadow = true; l.shadow.mapSize.set(1024, 1024); return l; }, []);
  spot.color.set(gel);
  spot.intensity = (18 + 45 * fl) * on;   // a flash you see, not a white-out (boards run 2: A1 burnt)
  spot.position.set(0.4, 4.6, 2.6);
  spot.target.position.set(0, 0.9, -0.4);
  const concrete = toonSurface('#2a2a33', 'plaster', [10, 10]);
  return (
    <group>
      <SetLight sky="#30304a" ground="#121218" fill={(0.7 + 0.5 * fl) * dim} key="#ffffff" keyI={(0.8 + 1.1 * fl) * dim} keyPos={[3, 6, 5]} target={[0, 1, 0]}
        shadowSize={6} fog={dimC('#0b0b12')} fogNear={8} fogFar={26} bg={dimC('#0b0b12')} depth={num(opts.depth, 0.8)} />
      <primitive object={spot} />
      <primitive object={spot.target} />
      {/* the dark studio floor, the paper sweep on it (her mark on the paper) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} material={concrete} receiveShadow><planeGeometry args={[26, 26]} /></mesh>
      <mesh geometry={geo} material={paper} position={[0, 0.003, -1.0]} receiveShadow />
      {/* the paper roll on its bar above the wall */}
      <mesh position={[0, 4.62, -2.65]} rotation={[0, 0, Math.PI / 2]} material={toon('#e8e3da')}><cylinderGeometry args={[0.12, 0.12, 7.8, 16]} /></mesh>
      {/* softboxes left and right (the beauty dish on its boom hung into every frame as a stray pole - boards 1) */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 2.4, 0, 0.9]} rotation={[0, s * 0.75, 0]}>
          <Stand pos={[0, 0, 0]} h={1.9} />
          <RBox size={[0.9, 1.2, 0.5]} pos={[0, 2.1, 0]} r={0.04} c="#141418" />
          <mesh position={[0, 2.1, -0.26]} rotation={[0, Math.PI, 0]}><planeGeometry args={[0.82, 1.1]} />
            <meshBasicMaterial color={new THREE.Color('#fff8ee').multiplyScalar(0.25 + 0.75 * on + fl)} toneMapped={false} /></mesh>
        </group>
      ))}
      {/* the camera on a tripod, off to the side (the lens of the film is the viewer, not this one) */}
      <group position={[1.9, 0, 2.6]} rotation={[0, -2.6, 0]}>
        {[0, 2.1, 4.2].map((a) => <mesh key={a} position={[Math.cos(a) * 0.22, 0.7, Math.sin(a) * 0.22]} rotation={[Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3]} material={toon('#1a1a22')}>
          <cylinderGeometry args={[0.015, 0.015, 1.45, 6]} /></mesh>)}
        <RBox size={[0.2, 0.15, 0.12]} pos={[0, 1.45, 0]} r={0.02} c="#20202a" />
        <mesh position={[0, 1.45, 0.13]} rotation={[Math.PI / 2, 0, 0]} material={toon('#121218')}><cylinderGeometry args={[0.05, 0.055, 0.16, 16]} /></mesh>
        <mesh position={[0.06, 1.55, 0]}><sphereGeometry args={[0.012, 6, 4]} /><meshBasicMaterial color={on > 0.1 ? '#ff3b4e' : '#3a1a1e'} toneMapped={false} /></mesh>
      </group>
      {/* the clothes rack + a work light far back, cables on the floor */}
      <group position={[-3.6, 0, -1.6]} rotation={[0, 0.5, 0]}>
        <mesh position={[0, 1.6, 0]} rotation={[0, 0, Math.PI / 2]} material={toon('#8a8a96')}><cylinderGeometry args={[0.015, 0.015, 1.4, 8]} /></mesh>
        {[-0.7, 0.7].map((x) => <mesh key={x} position={[x, 0.8, 0]} material={toon('#8a8a96')}><cylinderGeometry args={[0.015, 0.015, 1.6, 8]} /></mesh>)}
        {Array.from({length: 7}, (_, i) => <RBox key={i} size={[0.05, 0.85, 0.45]} pos={[-0.55 + i * 0.18, 1.12, 0]} r={0.02} c={['#ff3d7f', '#1d1d2a', '#7fd8ff', '#f4efe6', '#b98cff', '#ffd166', '#2a2a3a'][i]} t="fabric" />)}
      </group>
      <mesh position={[4.5, 1.6, -4]}><sphereGeometry args={[0.12, 10, 8]} /><meshBasicMaterial color={on > 0.1 ? '#ffcf8a' : '#2a2420'} toneMapped={false} /></mesh>
      {[[-2.4, 0.9, 2.2], [2.4, 0.9, 1.8]].map(([x, z0, z1], i) => (
        <mesh key={i} position={[x * 0.5, 0.012, (z0 + z1) / 2]} rotation={[-Math.PI / 2, 0, i ? 0.4 : -0.3]} material={toon('#0e0e12')}>
          <planeGeometry args={[0.025, 2.6]} /></mesh>
      ))}
      <DeepLife opts={opts} f={f} fps={fps} camPos={camPos} />
      <Stagings opts={opts} f={f} camPos={camPos} />
    </group>
  );
};
