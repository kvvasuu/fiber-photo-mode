import { useEffect } from "react";

import { NoiseEffect } from "postprocessing";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { mapEffectValue } from "../../utils/functions";

export function Grain({ effect }: { effect: NoiseEffect }) {
  const grain = usePhotoModeEffectsStore((state) => state.grain);

  const photoModeOn = usePhotoModeStore((state) => state.photoModeOn);

  useEffect(() => {
    if (!effect) return;

    effect.blendMode.opacity.value = photoModeOn ? mapEffectValue(grain, "grain") : 0;
  }, [effect, grain, photoModeOn]);
  return null;
}
