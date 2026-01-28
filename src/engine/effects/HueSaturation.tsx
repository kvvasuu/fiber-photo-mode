import { useEffect } from "react";

import { HueSaturationEffect } from "postprocessing";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { mapEffectValue } from "../../utils/functions";

export function HueSaturation({ effect }: { effect: HueSaturationEffect }) {
  const hue = usePhotoModeEffectsStore((state) => state.hue);
  const saturation = usePhotoModeEffectsStore((state) => state.saturation);

  const photoModeOn = usePhotoModeStore((state) => state.photoModeOn);

  useEffect(() => {
    if (!effect) return;

    effect.hue = photoModeOn ? mapEffectValue(hue, "hue") : 0;
    effect.saturation = photoModeOn ? mapEffectValue(saturation, "saturation") : 0;
  }, [effect, hue, saturation, photoModeOn]);

  return null;
}
