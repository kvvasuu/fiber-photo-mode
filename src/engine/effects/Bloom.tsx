import { useEffect } from "react";

import { BloomEffect } from "postprocessing";
import { usePhotoModeEffectsStore } from "../../store/photoModeEffectsStore";
import { usePhotoModeStore } from "../../store/photoModeStore";
import { mapEffectValue } from "../../utils/functions";

export function Bloom({ effect }: { effect: BloomEffect }) {
  const bloom = usePhotoModeEffectsStore((state) => state.bloom);

  const photoModeOn = usePhotoModeStore((state) => state.photoModeOn);

  useEffect(() => {
    if (!effect) return;

    effect.intensity = photoModeOn ? mapEffectValue(bloom, "bloom") : 0;
  }, [effect, bloom, photoModeOn]);

  return null;
}
