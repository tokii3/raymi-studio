// The world in two tones while she keeps her own values - the impact / lamp-flash frame of Love is War (treatment v3,
// script-critic FIX 6; the 2D duo layer posterised her too: "her model is never posterised", look-designer boards3).
// While on, every mesh of the SET (not her - she is rendered outside this group) is drawn flat paper-white or ink-black
// by the value of its own material (light / additive = paper, dark = ink); off, the materials come back.
// shots.json opts.two_tone = [t, ...] (song seconds -> frames, TIME_OPTS) + opts.two_tone_n (frames per hit, default 2)
// + opts.two_tone_light / _dark (default paper #f1ebe0 / ink #0b0910) + opts.two_tone_bg ('paper' default | 'ink').
// The sky / backdrop (BackSide domes) is the bg value: a night set otherwise went ~all ink - the measured test frame had
// 28 % paper against the pros' 37-83 % (refs card two_tone_hit, 2026-10-26). Film.tsx turns the grade overlay, bloom
// and vignette off in a two-tone frame: they lifted the ink to navy (p05 0.07 against the pros' 0.00-0.01).
import React, {useLayoutEffect, useRef} from 'react';
import * as THREE from 'three';
import {frames} from '../three/events';

export function twoToneOn(v: unknown, f: number, n = 2): boolean {
  return frames(v).some((t) => f >= t && f < t + n);
}

type Orig = {material: THREE.Material | THREE.Material[]};
const flat = new Map<string, THREE.MeshBasicMaterial>();
function flatMat(c: string): THREE.MeshBasicMaterial {
  let m = flat.get(c);
  if (!m) { m = new THREE.MeshBasicMaterial({color: c, fog: false, toneMapped: false}); flat.set(c, m); }
  return m;
}

function value(m: THREE.Material): number {
  const tone = (m.userData as {tone?: string}).tone;                 // a painted card names its value (three/painted.tsx)
  if (tone === 'ink') return 0;
  if (tone === 'paper') return 1;
  const x = m as THREE.Material & {color?: THREE.Color; emissive?: THREE.Color; blending?: THREE.Blending};
  if (x.blending === THREE.AdditiveBlending) return 1;           // light, glow, beams: they are the paper in a flash
  const c = (x.color ?? new THREE.Color('#000')).clone();
  if (x.emissive) c.add(x.emissive);
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

export const TwoTone: React.FC<{on: boolean; light?: string; dark?: string; bg?: 'paper' | 'ink'; children: React.ReactNode}> = ({on, light = '#f1ebe0', dark = '#0b0910', bg = 'paper', children}) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    ref.current?.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const ud = mesh.userData as {twoTone?: Orig};
      if (on) {
        if (!ud.twoTone) ud.twoTone = {material: mesh.material};
        const first = Array.isArray(ud.twoTone.material) ? ud.twoTone.material[0] : ud.twoTone.material;
        const transparent = (first as THREE.Material).transparent && (first as THREE.Material).opacity < 0.15;
        mesh.visible = !transparent;
        const back = (first as THREE.Material).side === THREE.BackSide;   // the sky / backdrop dome
        mesh.material = flatMat(back ? (bg === 'ink' ? dark : light) : value(first) > 0.3 ? light : dark);
      } else if (ud.twoTone) {
        mesh.material = ud.twoTone.material;
        mesh.visible = true;
        delete ud.twoTone;
      }
    });
  });
  return <group ref={ref}>{children}</group>;
};
