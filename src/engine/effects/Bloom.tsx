import { Bloom as BloomImpl } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { mapEffectValue } from "../../utils/functions";

export function Bloom() {
  const bloom = usePhotoModeEffectsStore((state) => state.bloom);

  // <Bloom> defaults to ADD
  return <BloomImpl blendFunction={BlendFunction.SCREEN} intensity={mapEffectValue(bloom, "bloom")} />;
}
