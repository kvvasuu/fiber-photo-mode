import { useEffect } from "react";

import { VignetteEffect } from "postprocessing";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { mapEffectValue } from "../../utils/functions";

export function Vignette({ effect }: { effect: VignetteEffect }) {
  const vignette = usePhotoModeEffectsStore((state) => state.vignette);

  const photoModeOn = usePhotoModeStore((state) => state.photoModeOn);

  useEffect(() => {
    if (!effect) return;

    const vignetteValue = mapEffectValue(vignette, "vignette");

    effect.offset = photoModeOn ? 0.4 * Math.pow(1 - vignetteValue, 2) : 0;
    effect.darkness = photoModeOn ? vignetteValue : 0;
  }, [effect, vignette, photoModeOn]);

  return null;
}
