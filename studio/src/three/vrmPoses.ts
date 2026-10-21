// Raymi's 3D key poses (VRM rig) as pure data: bone -> Euler XYZ (radians) on the NORMALIZED humanoid (VRM 1.0
// convention: rest = T-pose, she faces +Z, her left arm points to +X). The loader mirrors them for VRM 0.x models.
// A pose is a held key like a sprite was: the film blends between keys, breathes and blinks on top (VrmPuppet).
// Add a pose = add an entry here; every video can use it by name (shots: "pose": "point").
//
// Axis cheat sheet (normalized rig): arm down = z -1.2 (left) / +1.2 (right); arm forward = y -1.2 (left) / +1.2
// (right); elbow / knee / spine bend forward: lower arm y, upper leg x < 0 (knee up), lower leg x > 0, spine x > 0;
// head up = x < 0; head tilt = z; finger curl = z -1 (left) / +1 (right).

export type Euler3 = [number, number, number];
export type VrmPose = Record<string, Euler3>;

const curl = (side: 'left' | 'right', a: number, fingers = ['Index', 'Middle', 'Ring', 'Little']): VrmPose => {
  const s = side === 'left' ? -1 : 1;
  const out: VrmPose = {};
  for (const n of fingers) for (const seg of ['Proximal', 'Intermediate', 'Distal']) out[`${side}${n}${seg}`] = [0, 0, s * a];
  out[`${side}ThumbProximal`] = [0, s * 0.35 * Math.min(1, a / 0.9), 0];
  return out;
};

const relaxedHands: VrmPose = {...curl('left', 0.35), ...curl('right', 0.35)};

export const POSES: Record<string, VrmPose> = {
  // the rest pose, only for debugging the rig
  tpose: {},
  // standing, weight on one leg, arms loose (her idle)
  stand: {
    ...relaxedHands,
    hips: [0, 0, 0.03], spine: [0.03, 0, -0.02], chest: [0.02, 0, 0], neck: [0, 0, 0.03], head: [0.04, -0.05, 0.05],
    leftUpperArm: [0, -0.12, -1.22], rightUpperArm: [0, 0.12, 1.22],
    leftLowerArm: [0, -0.32, 0], rightLowerArm: [0, 0.32, 0],
    leftHand: [0, 0, -0.1], rightHand: [0, 0, 0.1],
    leftUpperLeg: [-0.04, 0, 0.04], rightUpperLeg: [0.02, 0, -0.02], leftLowerLeg: [0.08, 0, 0],
  },
  // pointing at the lens / at something to her left of frame, other hand on her hip
  point: {
    ...curl('left', 0.7), ...curl('right', 1.15, ['Middle', 'Ring', 'Little']),
    rightIndexProximal: [0, 0, 0.05], rightIndexIntermediate: [0, 0, 0.02], rightIndexDistal: [0, 0, 0],
    spine: [0.02, 0.12, 0], chest: [0, 0.1, 0], head: [0.02, 0.18, -0.06],
    rightUpperArm: [0, 1.15, -0.12], rightLowerArm: [0, 0.12, 0], rightHand: [0, 0, -0.1],
    leftUpperArm: [0, 0.3, -0.95], leftLowerArm: [0, -1.7, 0], leftHand: [0, 0, 0.3],
    leftUpperLeg: [-0.02, 0, 0.06], rightUpperLeg: [0.05, 0, -0.04],
  },
  // crouching low, forearms on her knees (hiding, peeking, about to pounce)
  crouch: {
    ...relaxedHands,
    hips: [0.1, 0, 0], spine: [0.42, 0, 0], chest: [0.2, 0, 0], neck: [-0.25, 0, 0], head: [-0.3, 0, 0.08],
    leftUpperLeg: [-1.9, 0, 0.18], rightUpperLeg: [-1.9, 0, -0.18],
    leftLowerLeg: [2.25, 0, 0], rightLowerLeg: [2.25, 0, 0],
    leftFoot: [-0.45, 0, 0], rightFoot: [-0.45, 0, 0],
    leftUpperArm: [0, -0.9, -1.05], rightUpperArm: [0, 0.9, 1.05],
    leftLowerArm: [0, -0.7, 0], rightLowerArm: [0, 0.7, 0],
  },
  // both arms up, cheering (the drop, the win)
  arms_up: {
    ...curl('left', 0.25), ...curl('right', 0.25),
    spine: [-0.06, 0, 0], chest: [-0.08, 0, 0], neck: [-0.06, 0, 0], head: [-0.16, 0, 0.04],
    leftShoulder: [0, 0, 0.25], rightShoulder: [0, 0, -0.25],
    leftUpperArm: [0, -0.25, 1.05], rightUpperArm: [0, 0.25, -1.05],
    leftLowerArm: [0, -0.35, 0.15], rightLowerArm: [0, 0.35, -0.15],
    leftUpperLeg: [0, 0, 0.08], rightUpperLeg: [0, 0, -0.08],
  },
  // a playful ignition cue: one hand presents the spark, the other opens to the side
  ignite: {
    ...curl('left', 0.35), ...curl('right', 0.25),
    hips: [0, 0.06, -0.08], spine: [0.03, -0.12, -0.04], chest: [0, -0.08, 0.02],
    neck: [0, 0.03, 0], head: [-0.03, -0.12, 0.06],
    leftUpperArm: [0, -0.35, -0.72], leftLowerArm: [0.08, -0.8, 0.05], leftHand: [0, 0, -0.12],
    rightUpperArm: [-0.08, 0.35, -0.32], rightLowerArm: [0, 0.25, 0], rightHand: [0, 0, 0.1],
    leftUpperLeg: [-0.06, 0, 0.1], rightUpperLeg: [0.04, 0, -0.04],
  },
  // a small rhythmic weight shift with one hand high and one hand near her waist
  sway: {
    ...curl('left', 0.3), ...curl('right', 0.45),
    hips: [0.02, -0.09, 0.1], spine: [0.04, 0.08, 0.06], chest: [-0.02, 0.06, -0.03],
    neck: [0, 0, -0.03], head: [0.02, 0.08, -0.08],
    leftUpperArm: [0, -0.18, 0.75], leftLowerArm: [0, -0.28, 0], leftHand: [0, 0, 0.1],
    rightUpperArm: [0, 0.38, 0.65], rightLowerArm: [0, -0.55, 0], rightHand: [0, 0, -0.1],
    leftUpperLeg: [-0.05, 0, 0.09], rightUpperLeg: [0.08, 0, -0.07], rightLowerLeg: [0.12, 0, 0],
  },
};

/** Expression names: the VRM 0.x names (her VRoid export) -> three-vrm's preset names; anything else is custom. */
export const EXPRESSION_ALIAS: Record<string, string> = {
  joy: 'happy', fun: 'relaxed', sorrow: 'sad', a: 'aa', i: 'ih', u: 'ou', e: 'ee', o: 'oh',
  blink_l: 'blinkLeft', blink_r: 'blinkRight', surprised: 'Surprised',
};

/** One held key of the 3D Raymi (like PuppetKey for the sprite): from frame f on she holds this pose. */
export type VrmKey = {
  f: number;
  pose: string;              // POSES name
  expr?: Record<string, number> | string | null;   // 'joy' or {joy: 0.7, a: 0.4}
  pos: [number, number, number];   // feet on the set floor
  rotY?: number | 'lens';    // degrees (0 = faces +Z), 'lens' = turns to the camera
  height?: number;           // figure height incl. ears (m), default 1.55
  blend?: number;            // frames the pose blends in from the previous key (default 8)
  look?: 'lens' | null;      // eyes follow the camera (default 'lens')
};

export function exprOf(k: VrmKey): Record<string, number> {
  if (!k.expr) return {};
  return typeof k.expr === 'string' ? {[k.expr]: 1} : k.expr;
}
