import { EffectGroup } from "@react-three/postprocessing";
import { EffectPass } from "postprocessing";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { Bloom } from "./Bloom";
import { BrightnessContrast } from "./BrightnessContrast";
import { ChromaticAberration } from "./ChromaticAberration";
import { Grain } from "./Grain";
import { HueSaturation } from "./HueSaturation";
import { Vignette } from "./Vignette";

export const PHOTO_MODE_EFFECTS_PASS_NAME = "PhotoModeEffectsPass";

const namePass = (pass: EffectPass | null) => {
  if (pass) pass.name = PHOTO_MODE_EFFECTS_PASS_NAME;
};

export function Effects() {
  const enabledEffects = usePhotoModeEffectsStore(
    (state) => state.enabledEffects,
  );
  const photoModeOn = usePhotoModeStore((state) => state.photoModeOn);

  return (
    <EffectGroup enabled={photoModeOn} ref={namePass}>
      {enabledEffects.chromaticAberration && <ChromaticAberration />}
      {enabledEffects.bloom && <Bloom />}
      {enabledEffects.vignette && <Vignette />}
      {enabledEffects.hueSaturation && <HueSaturation />}
      {enabledEffects.brightnessContrast && <BrightnessContrast />}
      {enabledEffects.grain && <Grain />}
    </EffectGroup>
  );
}
