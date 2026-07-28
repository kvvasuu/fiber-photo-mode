import { useEffect, useMemo } from "react";

import { BrightnessContrastEffect } from "postprocessing";
import { useDispose } from "../../hooks/useDispose";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { mapEffectValue } from "../../utils/functions";

export function BrightnessContrast() {
  const brightness = usePhotoModeEffectsStore((state) => state.brightness);
  const contrast = usePhotoModeEffectsStore((state) => state.contrast);

  const photoModeOn = usePhotoModeStore((state) => state.photoModeOn);

  const effect = useMemo(() => new BrightnessContrastEffect({ brightness: 0, contrast: 0 }), []);
  useDispose(effect);

  useEffect(() => {
    effect.brightness = photoModeOn ? mapEffectValue(brightness, "brightness") : 0;
    effect.contrast = photoModeOn ? mapEffectValue(contrast, "contrast") : 0;
  }, [effect, brightness, contrast, photoModeOn]);

  return <primitive object={effect} />;
}
