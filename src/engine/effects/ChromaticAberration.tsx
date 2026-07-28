import { useEffect, useMemo } from "react";

import { ChromaticAberrationEffect } from "postprocessing";
import { Vector2 } from "three";
import { useDispose } from "../../hooks/useDispose";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { mapEffectValue } from "../../utils/functions";

export function ChromaticAberration() {
  const chromaticAberration = usePhotoModeEffectsStore((state) => state.chromaticAberration);

  const photoModeOn = usePhotoModeStore((state) => state.photoModeOn);

  const effect = useMemo(
    () =>
      new ChromaticAberrationEffect({
        offset: new Vector2(0, 0),
        radialModulation: true,
        modulationOffset: 0.15,
      }),
    [],
  );
  useDispose(effect);

  useEffect(() => {
    const chromaticAberrationValue = mapEffectValue(chromaticAberration, "chromaticAberration");

    effect.offset.x = photoModeOn ? chromaticAberrationValue : 0;
    effect.offset.y = photoModeOn ? chromaticAberrationValue : 0;
  }, [effect, chromaticAberration, photoModeOn]);

  return <primitive object={effect} />;
}
