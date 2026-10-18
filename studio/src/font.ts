import {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

// The brand font must load or the render fails loudly - never a silent fallback font (hard rule 5).
// Returns true once it is ready: text textures are painted only after that (a canvas painted earlier would cache the
// browser's fallback font). heavy = also her heavy weight (Raymi-Heavy.ttf, built from Regular by raymi/font.py) for
// lyrics v2 - the same font pressed harder, never another family.
export const useRaymiFont = (heavy = false): boolean => {
  const [handle] = useState(() => delayRender('Raymi font'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const faces = [new FontFace('Raymi', `url(${staticFile('fonts/Raymi-Regular.ttf')})`)];
    if (heavy) faces.push(new FontFace('RaymiHeavy', `url(${staticFile('fonts/Raymi-Heavy.ttf')})`));
    Promise.all(faces.map((x) => x.load())).then((fs) => {
      for (const f of fs) (document.fonts as unknown as {add: (x: FontFace) => void}).add(f);
      setReady(true);
      continueRender(handle);
    }).catch((e) => cancelRender(e));
  }, [handle, heavy]);
  return ready;
};
