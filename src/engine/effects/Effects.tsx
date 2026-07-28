import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { Bloom } from "./Bloom";
import { BrightnessContrast } from "./BrightnessContrast";
import { ChromaticAberration } from "./ChromaticAberration";
import { Grain } from "./Grain";
import { HueSaturation } from "./HueSaturation";
import { Vignette } from "./Vignette";

export function Effects() {
  const enabledEffects = usePhotoModeEffectsStore((state) => state.enabledEffects);

  return (
    <>
      {enabledEffects.hueSaturation && <HueSaturation />}
      {enabledEffects.brightnessContrast && <BrightnessContrast />}
      {enabledEffects.vignette && <Vignette />}
      {enabledEffects.chromaticAberration && <ChromaticAberration />}
      {enabledEffects.bloom && <Bloom />}
      {enabledEffects.grain && <Grain />}
    </>
  );
}
