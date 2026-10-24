// What carries a body in the real scene (toki 2026-10-24: "clippt überall rein, fällt aus dem Himmel" - the scene probe
// found the cause: her feet and every thing stood on a HAND-GUESSED height - a desk 0.79, a bed 0.48, the dream floor
// 0.24 - not on the surface that is really there). One downward ray in the frame's scene graph finds the upward-facing
// surface under a point; she and the things are set onto it. Pure in the frame (the same in every render worker).
import * as THREE from 'three';

const ray = new THREE.Raycaster();
const DOWN = new THREE.Vector3(0, -1, 0);
const n = new THREE.Vector3();

function inside(o: THREE.Object3D, roots: THREE.Object3D[]): boolean {
  for (let p: THREE.Object3D | null = o; p; p = p.parent) if (roots.includes(p)) return true;
  return false;
}

function solid(o: THREE.Object3D): boolean {
  const m = o as THREE.Mesh;
  if (!m.isMesh || !m.visible) return false;
  if (o.userData?.noSupport) return false;
  const mat = m.material as THREE.Material | THREE.Material[];
  return !(Array.isArray(mat) ? mat : [mat]).every((x) => x.transparent && (x.opacity ?? 1) < 0.35);   // glows, light shafts
}

/** The y of the first upward-facing solid surface below (x, fromY, z), or null. `skip` = the body itself (her, a thing). */
export function supportBelow(scene: THREE.Object3D, x: number, z: number, fromY: number, skip: THREE.Object3D[] = [], far = 3): number | null {
  ray.set(new THREE.Vector3(x, fromY, z), DOWN);
  ray.far = far;
  for (const h of ray.intersectObject(scene, true)) {
    if (!solid(h.object) || inside(h.object, skip)) continue;
    if (h.face) {
      n.copy(h.face.normal).transformDirection(h.object.matrixWorld);
      if (n.y < 0.45) continue;                        // a wall or an underside: not something to stand on
    }
    return h.point.y;
  }
  return null;
}
