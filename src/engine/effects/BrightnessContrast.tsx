import { useEffect } from "react";

import { BrightnessContrastEffect } from "postprocessing";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { mapEffectValue } from "../../utils/functions";

export function BrightnessContrast({ effect }: { effect: BrightnessContrastEffect }) {
  const brightness = usePhotoModeEffectsStore((state) => state.brightness);
  const contrast = usePhotoModeEffectsStore((state) => state.contrast);

  const photoModeOn = usePhotoModeStore((state) => state.photoModeOn);

  useEffect(() => {
    if (!effect) return;

    effect.brightness = photoModeOn ? mapEffectValue(brightness, "brightness") : 0;
    effect.contrast = photoModeOn ? mapEffectValue(contrast, "contrast") : 0;
  }, [effect, brightness, contrast, photoModeOn]);

  return null;
}
