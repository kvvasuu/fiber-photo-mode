import { useEffect, useMemo } from "react";

import { NoiseEffect } from "postprocessing";
import { useDispose } from "../../hooks/useDispose";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { mapEffectValue } from "../../utils/functions";

export function Grain() {
  const grain = usePhotoModeEffectsStore((state) => state.grain);

  const photoModeOn = usePhotoModeStore((state) => state.photoModeOn);

  const effect = useMemo(() => new NoiseEffect({ premultiply: true }), []);
  useDispose(effect);

  useEffect(() => {
    effect.blendMode.opacity.value = photoModeOn ? mapEffectValue(grain, "grain") : 0;
  }, [effect, grain, photoModeOn]);

  return <primitive object={effect} />;
}
