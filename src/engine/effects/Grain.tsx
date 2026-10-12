import { Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { mapEffectValue } from "../../utils/functions";

export function Grain() {
  const grain = usePhotoModeEffectsStore((state) => state.grain);

  // <Noise> defaults to COLOR_DODGE
  return <Noise blendFunction={BlendFunction.SCREEN} premultiply opacity={mapEffectValue(grain, "grain")} />;
}
