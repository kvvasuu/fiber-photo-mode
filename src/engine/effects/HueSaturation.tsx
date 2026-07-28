import { useEffect, useMemo } from "react";

import { HueSaturationEffect } from "postprocessing";
import { useDispose } from "../../hooks/useDispose";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { mapEffectValue } from "../../utils/functions";

export function HueSaturation() {
  const hue = usePhotoModeEffectsStore((state) => state.hue);
  const saturation = usePhotoModeEffectsStore((state) => state.saturation);

  const photoModeOn = usePhotoModeStore((state) => state.photoModeOn);

  const effect = useMemo(() => new HueSaturationEffect({ hue: 0, saturation: 0 }), []);
  useDispose(effect);

  useEffect(() => {
    effect.hue = photoModeOn ? mapEffectValue(hue, "hue") : 0;
    effect.saturation = photoModeOn ? mapEffectValue(saturation, "saturation") : 0;
  }, [effect, hue, saturation, photoModeOn]);

  return <primitive object={effect} />;
}
