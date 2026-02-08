import {
  BloomEffect,
  BrightnessContrastEffect,
  ChromaticAberrationEffect,
  EffectPass,
  HueSaturationEffect,
  NoiseEffect,
  VignetteEffect,
} from "postprocessing";
import { useEffect, useRef } from "react";
import { Vector2 } from "three";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { Bloom } from "./Bloom";
import { BrightnessContrast } from "./BrightnessContrast";
import { ChromaticAberration } from "./ChromaticAberration";
import { Grain } from "./Grain";
import { HueSaturation } from "./HueSaturation";
import { Vignette } from "./Vignette";

export function Effects() {
  const composer = usePhotoModeStore((state) => state.composer);
  const camera = usePhotoModeStore((state) => state.camera);
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

  useEffect(() => {
    if (!composer || !camera) return;

    // Effects order: - from postprocessing docs and common practices, this should be not changed to prevent issues.
    // Hue/Saturation
    // Brightness/Contrast
    // SMAA
    // SSR (NYI)
    // SSAO
    // DoF
    // Motion Blur (NYI)
    // Chromatic Aberration
    // Bloom
    // God Rays
    // Vignette
    // Tone Mapping
    // LUT / Color Grading
    // Noise / Film Grain
    // PixelationEffect

    const effects = [
      effectsRef.current.hueSaturation,
      effectsRef.current.brightnessContrast,
      effectsRef.current.chromaticAberration,
      ...(enabledEffects.bloom ? [effectsRef.current.bloom] : []),
      effectsRef.current.vignette,
      effectsRef.current.grain,
    ];

    const effectPass = new EffectPass(camera, ...effects);

    effectPass.name = "PhotoModeEffectsPass";

    composer.addPass(effectPass);

    return () => {
      composer.removePass(effectPass);

      effectPass.dispose();
    };
  }, [composer, camera, enabledEffects]);

  if (!composer || !camera) return null;

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
