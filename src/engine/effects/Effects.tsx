import {
  BloomEffect,
  BrightnessContrastEffect,
  ChromaticAberrationEffect,
  HueSaturationEffect,
  NoiseEffect,
  VignetteEffect,
} from "postprocessing";
import { useRef } from "react";
import { Vector2 } from "three";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { Bloom } from "./Bloom";
import { BrightnessContrast } from "./BrightnessContrast";
import { ChromaticAberration } from "./ChromaticAberration";
import { Grain } from "./Grain";
import { HueSaturation } from "./HueSaturation";
import { Vignette } from "./Vignette";

export function Effects() {
  const enabledEffects = usePhotoModeEffectsStore((state) => state.enabledEffects);

  const effectsRef = useRef({
    hueSaturation: new HueSaturationEffect({ hue: 0, saturation: 0 }),
    brightnessContrast: new BrightnessContrastEffect({ brightness: 0, contrast: 0 }),
    chromaticAberration: new ChromaticAberrationEffect({
      offset: new Vector2(0, 0),
      radialModulation: true,
      modulationOffset: 0.15,
    }),
    bloom: new BloomEffect({
      intensity: 0,
    }),
    vignette: new VignetteEffect({ offset: 0, darkness: 0 }),
    grain: new NoiseEffect({ premultiply: true }),
  });

  return (
    <>
      {enabledEffects.hueSaturation && <HueSaturation effect={effectsRef.current.hueSaturation} />}
      {enabledEffects.brightnessContrast && <BrightnessContrast effect={effectsRef.current.brightnessContrast} />}
      {enabledEffects.vignette && <Vignette effect={effectsRef.current.vignette} />}
      {enabledEffects.chromaticAberration && <ChromaticAberration effect={effectsRef.current.chromaticAberration} />}
      {enabledEffects.bloom && <Bloom effect={effectsRef.current.bloom} />}
      {enabledEffects.grain && <Grain effect={effectsRef.current.grain} />}
    </>
  );
}
