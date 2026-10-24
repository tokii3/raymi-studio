// The QC mask pass (toki 2026-10-24: "der Code zeigt keine Fehler, aber visuell sieht man sie"). The probe measures the
// scene graph; this measures the PICTURE: the same frame drawn with flat ID colours, depth test on, no light, no post,
// no grade, no 2D layer - so raymi/qcv2.py can see what the viewer sees: a table edge sticking out through her body, a
// lyric across her face, her face cut by the frame edge, her figure popping between two frames. Only with
// props.qcMask (stills.yml "qc" pass, cloud); never in a delivered render.
import React, {useLayoutEffect} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';

/** The ID palette (sRGB, the python side classifies each pixel to the nearest of these). */
export const QC_COLORS = {
  body: '#ff0000',      // her body + clothes
  face: '#ff00ff',      // her face mesh
  hair: '#ff8000',      // her hair (and the tako ears when they sit in the hair mesh)
  text: '#00ff00',      // lyrics / words
  thing: '#00ffff',     // a prop (userData.thing)
  set: '#0000ff',       // furniture and set pieces
  room: '#404040',      // a room shell (floor, wall, dome, sky: >= 2.5 m in two axes) - what stands behind everything
} as const;

/** all = the frame as the viewer sees it; her = only her (what of her is HIDDEN in 'all' was covered by something);
 *  text = only the lyrics (what of a word is missing in 'all' hides behind her or a prop). */
export type QcMode = 'all' | 'her' | 'text';
const SHELL = 2.5;

const cache = new Map<string, THREE.Material>();

function flat(key: keyof typeof QC_COLORS, side: THREE.Side): THREE.Material {
  const k = `${key}|${side}`;
  if (!cache.has(k)) cache.set(k, new THREE.MeshBasicMaterial({color: new THREE.Color(QC_COLORS[key]), side, toneMapped: false}));
  return cache.get(k)!;
}

/** A word is a textured plane: only its letters count (alpha >= 0.5), the empty margin stays see-through. */
function textMat(map: THREE.Texture | null, side: THREE.Side): THREE.Material {
  const k = `text|${map?.uuid ?? 'none'}|${side}`;
  if (!cache.has(k)) {
    cache.set(k, new THREE.ShaderMaterial({
      uniforms: {map: {value: map}, color: {value: new THREE.Color(QC_COLORS.text)}, hasMap: {value: map ? 1 : 0}},
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform sampler2D map; uniform vec3 color; uniform float hasMap; varying vec2 vUv;' +
        'void main(){ if (hasMap > 0.5 && texture2D(map, vUv).a < 0.5) discard; gl_FragColor = vec4(color, 1.0); }',
      side, toneMapped: false,
    }));
  }
  return cache.get(k)!;
}

function flag(o: THREE.Object3D, key: string): boolean {
  for (let p: THREE.Object3D | null = o; p; p = p.parent) if (p.userData?.[key]) return true;
  return false;
}

function qcTag(o: THREE.Object3D): string | null {
  for (let p: THREE.Object3D | null = o; p; p = p.parent) if (p.userData?.qc) return String(p.userData.qc);
  return null;
}

function thing(o: THREE.Object3D): boolean {
  for (let p: THREE.Object3D | null = o; p; p = p.parent) if (p.userData?.thing) return true;
  return false;
}

/** her = the rig's root (VrmPuppet), when she is in this frame's scene. */
export const QcMask: React.FC<{her: THREE.Object3D | null; mode: QcMode}> = ({her, mode}) => {
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);
  useLayoutEffect(() => {
    scene.background = new THREE.Color('#000000');
    scene.fog = null;
    gl.setClearColor('#000000', 1);
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh && !(o as THREE.Points).isPoints && !(o as THREE.Line).isLine) return;
      if (!m.isMesh) { o.visible = false; return; }           // particles, lines: not a surface
      const mats = (Array.isArray(m.material) ? m.material : [m.material]) as THREE.Material[];
      const side = mats[0]?.side ?? THREE.FrontSide;
      let inHer = false;
      for (let p: THREE.Object3D | null = m; p; p = p.parent) if (p === her) { inHer = true; break; }
      let mat: THREE.Material | null;
      const cat = inHer ? 'her' : qcTag(m) === 'text' ? 'text' : 'other';
      if (mode !== 'all' && cat !== mode) { m.visible = false; return; }
      if (inHer) {
        const nm = (m.name + ' ' + (m.parent?.name ?? '')).toLowerCase();
        // her outline shells (MToon draws them as a second, inverted material) stay part of her body
        mat = flat(nm.includes('face') ? 'face' : nm.includes('hair') ? 'hair' : 'body', side);
      } else if (qcTag(m) === 'text') {
        mat = textMat(((mats[0] as THREE.MeshBasicMaterial).map) ?? null, side);
      } else if (flag(m, 'noSupport') || flag(m, 'float') && !thing(m)) {
        mat = null;                                            // light rays, lens passes, glows: not a surface
      } else if (mats.every((x) => x.transparent && (x.opacity ?? 1) < 0.35)) {
        mat = null;
      } else {
        const sz = new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3());
        mat = flat(thing(m) ? 'thing' : [sz.x, sz.y, sz.z].filter((v) => v > SHELL).length >= 2 ? 'room' : 'set', side);
      }
      if (!mat) { m.visible = false; return; }
      m.material = Array.isArray(m.material) ? m.material.map(() => mat!) : mat;
      m.castShadow = false;
      m.receiveShadow = false;
    });
  });
  return null;
};
