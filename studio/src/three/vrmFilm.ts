import type {PuppetKey} from '../film/types';
import type {VrmKey} from './vrmPoses';

/** The full Firestarter edition keeps the existing 2D key timing/placement, translating each held sprite action into a rig pose. */
export function vrmFilmKeys(keys: PuppetKey[]): VrmKey[] {
  return keys.map((k) => {
    const name = k.sprite.split('/').pop()?.toUpperCase() ?? '';
    const pose = poseFor(name, k.act);
    const expr = expressionFor(name);
    const lying = /CALM_PRONE|SLEEP/.test(name);
    return {
      f: k.f,
      pose,
      ...(expr ? {expr} : {}),
      pos: k.pos,
      rotY: /BK_NA|FLY_UV_081/.test(name) ? 'away' : 'lens',
      rollZ: k.rot ? -k.rot * Math.PI / 180 : (lying ? -78 * Math.PI / 180 : 0),
      height: lying ? Math.max(1.2, k.height) : k.height,
      blend: Math.max(6, Math.min(18, k.move || 8)),
      act: k.act,
      motion: motionFor(name, k.act),
      move: k.move,
      arc: k.arc,
      ease: k.ease,
    };
  });
}

function motionFor(name: string, act: PuppetKey['act']): string | undefined {
  // Keep floor work and sleep poses clear of a standing dance rig. Performances and
  // energetic beats use the retargeted Mixamo routine; standing holds use the idle take.
  if (/CALM_PRONE|SLEEP|_FLY_|BK_NA|FOCUS_CROUCH/.test(name)) return undefined;
  if (/SHOUT_WET|HAPPY|ANGRY_KICK|PANIC_LUNGE/.test(name) || act === 'hop' || act === 'bounce' || act === 'stomp') return 'dance';
  if (/CALM_REST|FOCUS_PUSH|FOCUS_PULL|SMUG_WINK/.test(name)) return 'idle';
  return undefined;
}

function poseFor(name: string, act: PuppetKey['act']): string {
  if (name.includes('FOCUS_CROUCH')) return 'crouch';
  if (name.includes('FOCUS_PUSH')) return 'focus';
  if (name.includes('FOCUS_PULL')) return 'pull';
  if (name.includes('PANIC_LUNGE')) return 'lunge';
  if (name.includes('PAIN_CLUTCH')) return 'clutch';
  if (name.includes('ANGRY_KICK')) return 'kick';
  if (name.includes('HAPPY_JUMP')) return 'jump';
  if (name.includes('HAPPY_SPIN')) return 'spin';
  if (name.includes('HAPPY_SURF') || name.includes('_SURF_')) return 'surf';
  if (name.includes('_FLY_')) return 'glide';
  if (name.includes('CALM_PRONE') || name.includes('_SLEEP_')) return 'recline';
  if (name.includes('SMUG_WINK')) return 'smug';
  if (name.includes('SHOUT_WET')) return 'sing';
  if (name.includes('CALM_REST')) return 'stand';
  if (name.includes('BK_NA')) return 'glide';
  if (act === 'hop' || act === 'bounce') return 'jump';
  if (act === 'float') return 'glide';
  if (act === 'stomp' || act === 'shake') return 'focus';
  return 'stand';
}

function expressionFor(name: string): VrmKey['expr'] {
  if (name.includes('HAPPY') || name.includes('SHOUT_WET')) return {joy: name.includes('SHOUT_WET') ? 0.28 : 0.68};
  if (name.includes('SMUG_WINK')) return {fun: 0.45, blink_r: 0.8};
  if (name.includes('PANIC')) return {surprised: 0.5};
  if (name.includes('PAIN')) return {sorrow: 0.45};
  if (name.includes('_SLEEP_')) return {sorrow: 0.25};
  return null;
}

export function vrmFilmWords(shots: {words: {w: string; from: number; to: number}[]}[], fps: number) {
  const byInterval = new Map<string, {w: string; t0: number; t1: number}>();
  for (const shot of shots) for (const word of shot.words) {
    const key = `${word.from}:${word.to}:${word.w}`;
    byInterval.set(key, {w: word.w, t0: word.from / fps, t1: word.to / fps});
  }
  return [...byInterval.values()].sort((a, b) => a.t0 - b.t0);
}
