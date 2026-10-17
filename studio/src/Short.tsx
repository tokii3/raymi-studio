import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, cancelRender, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {World} from './World';
import {Raymi} from './Raymi';
import {ReactionIcon} from './Icons';
import {Captions, Stamp} from './Text';
import {headOnScreen, place} from './framing';
import {grainTile} from './textures';
import type {ShortProps} from './types';

// The brand font must load or the render fails loudly - never a silent fallback font.
const useRaymiFont = () => {
  const [handle] = useState(() => delayRender('Raymi font'));
  useEffect(() => {
    const face = new FontFace('Raymi', `url(${staticFile('fonts/Raymi-Regular.ttf')})`);
    face.load().then((f) => { (document.fonts as unknown as {add: (x: FontFace) => void}).add(f); continueRender(handle); }).catch((e) => cancelRender(e));
  }, [handle]);
};

/** Top of a text block of height h: the preferred top unless it overlaps the head box (with camera-zoom margin). */
function freeTop(hb: number[], pref: number, h: number, H: number): number {
  const m = 0.06 * H;
  const head0 = hb[1] - m, head1 = hb[3] + m;
  if (pref + h < head0 || pref > head1) return pref;
  if (head1 + h <= H * 0.8) return Math.max(head1, H * 0.06);
  if (head0 - h >= H * 0.05) return head0 - h;
  return H * 0.8 - h;
}

export const Short: React.FC<ShortProps> = (p) => {
  useRaymiFont();
  const f = useCurrentFrame();
  const {fps, width: W, height: H} = useVideoConfig();
  const i = Math.max(0, p.beats.findIndex((b, k) => f >= b.from && (k + 1 >= p.beats.length || f < p.beats[k + 1].from)));
  const beat = p.beats[i];
  if (!beat) return <AbsoluteFill style={{background: '#000'}} />;
  const local = f - beat.from;
  const pl = place(beat, W, H);
  // camera: punch-in on every cut, slow push during the beat, a kick on key words
  const punch = spring({frame: local, fps, config: {damping: 14, stiffness: 140}});
  const len = Math.max(beat.to - beat.from, 1);
  let zoom = interpolate(punch, [0, 1], [1.07, 1]) * interpolate(local, [0, len], [1, 1.045]);
  const keyHits = p.words.filter((w) => w.key && w.from >= beat.from && w.from < beat.to).map((w) => w.from - beat.from);
  for (const k of keyHits) {
    const d = local - k;
    if (d >= 0 && d < 10) zoom *= 1 + 0.03 * Math.sin((d / 10) * Math.PI);
  }
  const shake = keyHits.some((k) => local - k >= 0 && local - k < 4) ? 6 : 0;
  const camX = (random(`cx${f}`) - 0.5) * shake + (beat.side === 'left' ? -20 : beat.side === 'right' ? 20 : 0) * (local / len);
  const camY = (random(`cy${f}`) - 0.5) * shake;
  const hb = headOnScreen(pl, beat);
  const iconX = Math.min(W - 90, hb[2] + 30), iconY = Math.max(260, hb[1] + 20);
  // Text never sits on her face (S0 draft: hook, CTA and captions covered it). Each text block keeps its preferred
  // band unless it overlaps the head; then it goes below the head, else above it, else as low as the safe zone allows.
  const hookTo = Math.min(p.hook.to, p.beats.length > 1 ? Math.max(p.beats[1].from, 40) : p.hook.to);
  const hookOn = f < hookTo;
  const hookTop = freeTop(hb, H * 0.075, 260, H);
  const ctaTop = freeTop(hb, H * 0.09, 230, H);
  let captionTop = freeTop(hb, H * 0.635, 150, H);
  if (hookOn && captionTop < hookTop + 280 && captionTop + 150 > hookTop) captionTop = Math.min(hookTop + 280, H * 0.8 - 150);
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
      <AbsoluteFill style={{transform: `translate(${-camX}px, ${-camY}px) scale(${zoom})`, transformOrigin: `${(hb[0] + hb[2]) / 2}px ${hb[1]}px`}}>
        <World world={p.world} camX={camX + f * 0.6} camY={camY} />
        <Raymi beat={beat} place={pl} local={local} accent={p.accent} keyHits={keyHits} />
        {beat.icon ? <ReactionIcon kind={beat.icon} x={iconX} y={iconY} local={local} accent={p.accent} /> : null}
      </AbsoluteFill>
      {/* flash frame on each cut (2 frames) keeps beat changes punchy without a strobe */}
      {local < 2 && i > 0 ? <AbsoluteFill style={{background: '#ffffff', opacity: 0.18 * (2 - local) / 2}} /> : null}
      <Grade />
      <Captions words={p.words} accent={p.accent} top={captionTop} hideFrom={p.cta.from} />
      <Stamp text={p.hook.text} from={0} to={hookTo} top={hookTop} accent={p.accent} size={112} />
      <Stamp text={p.cta.text} from={p.cta.from} to={p.durationInFrames + 1} top={ctaTop} accent={p.accent} size={84} bubble />
      {p.voice ? <Audio src={staticFile(p.voice)} /> : null}
    </AbsoluteFill>
  );
};

const Grade: React.FC = () => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  return (
    <>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(8,0,24,0.55) 100%)'}} />
      <AbsoluteFill style={{opacity: 0.07, mixBlendMode: 'overlay', backgroundImage: grainTile,
        backgroundPosition: `${Math.floor(random(`gx${f % 30}`) * 256)}px ${Math.floor(random(`gy${f % 30}`) * 256)}px`}} />
    </>
  );
};
