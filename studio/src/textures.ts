// Static noise textures as SVG data URIs. The browser rasterises an <img>/background SVG once and caches it,
// whereas an inline <filter><feTurbulence> is recomputed on every frame (that made renders ~50x slower on CPU).
const svg = (body: string, w: number, h: number) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>${body}</svg>`)}")`;

export const grainTile = svg(
  `<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter>` +
  `<rect width='100%' height='100%' filter='url(#n)'/>`, 256, 256);

export const causticTile = (seed: number) => svg(
  `<filter id='c'><feTurbulence type='fractalNoise' baseFrequency='0.012 0.03' numOctaves='2' seed='${seed}' stitchTiles='stitch'/>` +
  `<feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.9  0 0 0 0 1  0 0 0 2.6 -1.5'/></filter>` +
  `<rect width='100%' height='100%' filter='url(#c)'/>`, 540, 480);

export const paperTile = svg(
  `<filter id='p'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' seed='3' stitchTiles='stitch'/>` +
  `<feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.48  0 0 0 0 0.4  0 0 0 0.5 0'/></filter>` +
  `<rect width='100%' height='100%' filter='url(#p)'/>`, 256, 256);
