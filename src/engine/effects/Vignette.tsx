import { useEffect, useMemo } from "react";

import { VignetteEffect } from "postprocessing";
import { useDispose } from "../../hooks/useDispose";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { mapEffectValue } from "../../utils/functions";

export function Vignette() {
  const vignette = usePhotoModeEffectsStore((state) => state.vignette);

  const photoModeOn = usePhotoModeStore((state) => state.photoModeOn);

  const effect = useMemo(() => new VignetteEffect({ offset: 0, darkness: 0 }), []);
  useDispose(effect);

  useEffect(() => {
    const vignetteValue = mapEffectValue(vignette, "vignette");

    effect.offset = photoModeOn ? 0.4 * Math.pow(1 - vignetteValue, 2) : 0;
    effect.darkness = photoModeOn ? vignetteValue : 0;
  }, [effect, vignette, photoModeOn]);

  return <primitive object={effect} />;
}
