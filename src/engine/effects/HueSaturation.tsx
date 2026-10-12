import { HueSaturation as HueSaturationImpl } from "@react-three/postprocessing";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { mapEffectValue } from "../../utils/functions";

export function HueSaturation() {
  const hue = usePhotoModeEffectsStore((state) => state.hue);
  const saturation = usePhotoModeEffectsStore((state) => state.saturation);

  return <HueSaturationImpl hue={mapEffectValue(hue, "hue")} saturation={mapEffectValue(saturation, "saturation")} />;
}
