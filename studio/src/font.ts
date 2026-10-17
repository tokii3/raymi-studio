import {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

// The brand font must load or the render fails loudly - never a silent fallback font (hard rule 5).
// Returns true once it is ready: text textures are painted only after that (a canvas painted earlier would cache the
// browser's fallback font).
export const useRaymiFont = (): boolean => {
  const [handle] = useState(() => delayRender('Raymi font'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const face = new FontFace('Raymi', `url(${staticFile('fonts/Raymi-Regular.ttf')})`);
    face.load().then((f) => {
      (document.fonts as unknown as {add: (x: FontFace) => void}).add(f);
      setReady(true);
      continueRender(handle);
    }).catch((e) => cancelRender(e));
  }, [handle]);
  return ready;
};
