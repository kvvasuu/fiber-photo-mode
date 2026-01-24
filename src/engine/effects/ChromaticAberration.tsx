import { useEffect } from "react";

import { ChromaticAberrationEffect } from "postprocessing";
import { usePhotoModeEffectsStore } from "../../store/photoModeEffectsStore";
import { usePhotoModeStore } from "../../store/photoModeStore";
import { mapEffectValue } from "../../utils/functions";

export function ChromaticAberration({ effect }: { effect: ChromaticAberrationEffect }) {
  const chromaticAberration = usePhotoModeEffectsStore((state) => state.chromaticAberration);

  const photoModeOn = usePhotoModeStore((state) => state.photoModeOn);

  useEffect(() => {
    if (!effect) return;

    const chromaticAberrationValue = mapEffectValue(chromaticAberration, "chromaticAberration");

    effect.offset.x = photoModeOn ? chromaticAberrationValue : 0;
    effect.offset.y = photoModeOn ? chromaticAberrationValue : 0;
  }, [effect, chromaticAberration, photoModeOn]);

  return null;
}
