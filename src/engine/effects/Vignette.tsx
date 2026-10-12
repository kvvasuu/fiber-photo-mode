import { Vignette as VignetteImpl } from "@react-three/postprocessing";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { mapEffectValue } from "../../utils/functions";

export function Vignette() {
  const vignette = usePhotoModeEffectsStore((state) => state.vignette);

  const vignetteValue = mapEffectValue(vignette, "vignette");

  return <VignetteImpl offset={0.4 * Math.pow(1 - vignetteValue, 2)} darkness={vignetteValue} />;
}
