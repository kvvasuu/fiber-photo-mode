import { BrightnessContrast as BrightnessContrastImpl } from "@react-three/postprocessing";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { mapEffectValue } from "../../utils/functions";

export function BrightnessContrast() {
  const brightness = usePhotoModeEffectsStore((state) => state.brightness);
  const contrast = usePhotoModeEffectsStore((state) => state.contrast);

  return (
    <BrightnessContrastImpl
      brightness={mapEffectValue(brightness, "brightness")}
      contrast={mapEffectValue(contrast, "contrast")}
    />
  );
}
