import type {Beat, Box} from './types';

export type Placement = {x: number; y: number; scale: number; head: Box; feetVisible: boolean};

// Wide shots: figure 66 % of frame height so the hair stays below the hook band (S0 draft: hook covered her face).
// Head height as a share of the frame per shot size (wide = whole figure).
const HEAD_SHARE: Record<Beat['shot'], number> = {wide: 0, medium: 0.17, close: 0.3, extreme: 0.46};
const SIDE_X: Record<Beat['side'], number> = {center: 0.5, left: 0.38, right: 0.62};
const HEAD_TOP = 0.2; // head top sits just under the hook band
const FEET_Y = 0.885; // wide shots: feet on the lower third line

/**
 * Where the sprite goes for a shot. Positions come from the measured anatomy, never guessed, and every edge
 * where the source image cut her figure is pushed past the frame edge (old engine fault: visible cut edges).
 */
export function place(b: Beat, W: number, H: number): Placement {
  const [sw, sh] = b.size;
  const head: Box = b.anatomy.head ?? b.faceBox ?? [0.3, 0.02, 0.7, 0.3];
  const cut = new Set(b.cuts);
  const share = b.anatomy.head ? HEAD_SHARE[b.shot] : 0;
  const wide = share === 0;
  let scale = wide ? Math.min((0.66 * H) / sh, (0.96 * W) / sw) : (share * H) / ((head[3] - head[1]) * sh);
  const cover = cut.has('left') && cut.has('right') && W / sw > scale;
  if (cut.has('left') && cut.has('right')) scale = Math.max(scale, W / sw);
  if (cut.has('top') && cut.has('bottom')) scale = Math.max(scale, H / sh);
  // a cut bottom must reach below the frame: anchor the head and grow until it does
  // a wide figure scaled up to cover its cut sides is anchored at the head too (S0 draft: JUMP_133 lost its head)
  const anchorHead = !wide || cut.has('bottom') || cover;
  if (cut.has('bottom')) {
    const headTopY = HEAD_TOP * H;
    scale = Math.max(scale, (H - headTopY) / (sh * (1 - head[1])));
  }
  let y = anchorHead ? HEAD_TOP * H - head[1] * sh * scale : FEET_Y * H - sh * scale;
  const headCx = ((head[0] + head[2]) / 2) * sw * scale;
  let x = SIDE_X[b.side] * W - headCx;
  const w = sw * scale, h = sh * scale;
  if (cut.has('left') && x > 0) x = 0;
  if (cut.has('right') && x + w < W) x = W - w;
  if (cut.has('top') && y > 0) y = 0;
  if (cut.has('bottom') && y + h < H) y = H - h;
  const feetVisible = !cut.has('bottom') && y + h < H * 0.97;
  return {x, y, scale, head, feetVisible};
}

/** Screen-space head box (px) for collision checks with text and icon placement. */
export function headOnScreen(p: Placement, b: Beat): Box {
  const [sw, sh] = b.size;
  return [p.x + p.head[0] * sw * p.scale, p.y + p.head[1] * sh * p.scale, p.x + p.head[2] * sw * p.scale, p.y + p.head[3] * sh * p.scale];
}
