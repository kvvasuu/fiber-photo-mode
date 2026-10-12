import { ChromaticAberration as ChromaticAberrationImpl } from "@react-three/postprocessing";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { mapEffectValue } from "../../utils/functions";

export function ChromaticAberration() {
  const chromaticAberration = usePhotoModeEffectsStore((state) => state.chromaticAberration);

  const chromaticAberrationValue = mapEffectValue(chromaticAberration, "chromaticAberration");

  return (
    <ChromaticAberrationImpl
      offset={[chromaticAberrationValue, chromaticAberrationValue]}
      radialModulation
      modulationOffset={0.15}
    />
  );
}
