import { useEffect, useMemo } from "react";

import { BloomEffect } from "postprocessing";
import { useDispose } from "../../hooks/useDispose";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { mapEffectValue } from "../../utils/functions";

export function Bloom() {
  const bloom = usePhotoModeEffectsStore((state) => state.bloom);
  const photoModeOn = usePhotoModeStore((state) => state.photoModeOn);

  const effect = useMemo(() => new BloomEffect({ intensity: 0 }), []);
  useDispose(effect);

  useEffect(() => {
    effect.intensity = photoModeOn ? mapEffectValue(bloom, "bloom") : 0;
  }, [effect, bloom, photoModeOn]);

  return <primitive object={effect} />;
}
