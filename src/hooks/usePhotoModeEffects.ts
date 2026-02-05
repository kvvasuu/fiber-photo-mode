import { usePhotoModeEffectsStore } from "../store/EffectsStore";
import type { EffectKey } from "../types";

/**
 * Return type for usePhotoModeEffects
 * All effect values may be undefined if not enabled in ENABLED_EFFECTS config
 */
export type UsePhotoModeEffectsReturn = {
  /** Hue adjustment value (-PI to PI) - undefined if hueSaturation disabled */
  hue: number | undefined;
  /** Saturation adjustment value (-1 to 1) - undefined if hueSaturation disabled */
  saturation: number | undefined;
  /** Brightness adjustment value (-0.75 to 0.75) - undefined if brightnessContrast disabled */
  brightness: number | undefined;
  /** Contrast adjustment value (-0.75 to 0.75) - undefined if brightnessContrast disabled */
  contrast: number | undefined;
  /** Chromatic aberration offset (0 to 0.01) - undefined if chromaticAberration disabled */
  chromaticAberration: number | undefined;
  /** Bloom intensity (0 to 5) - undefined if bloom disabled */
  bloom: number | undefined;
  /** Vignette darkness (0 to 1) - undefined if vignette disabled */
  vignette: number | undefined;
  /** Film grain amount (0 to 1) - undefined if grain disabled */
  grain: number | undefined;
  /** Update effect value by key */
  setEffect: (effectName: EffectKey, value: number) => void;
  /** Reset all effects to default values */
  resetEffects: () => void;
};

/**
 * Hook to access and control photo mode effects
 * @returns Object with effect values and control functions
 */
export function usePhotoModeEffects() {
  const hue = usePhotoModeEffectsStore((state) => state.hue);
  const saturation = usePhotoModeEffectsStore((state) => state.saturation);
  const brightness = usePhotoModeEffectsStore((state) => state.brightness);
  const contrast = usePhotoModeEffectsStore((state) => state.contrast);
  const chromaticAberration = usePhotoModeEffectsStore((state) => state.chromaticAberration);
  const bloom = usePhotoModeEffectsStore((state) => state.bloom);
  const vignette = usePhotoModeEffectsStore((state) => state.vignette);
  const grain = usePhotoModeEffectsStore((state) => state.grain);

  const enabledEffects = usePhotoModeEffectsStore((state) => state.enabledEffects);
  const setEffect = usePhotoModeEffectsStore((state) => state.setEffect);
  const resetEffects = usePhotoModeEffectsStore((state) => state.resetEffects);

  return {
    hue: enabledEffects.hueSaturation ? hue : undefined,
    saturation: enabledEffects.hueSaturation ? saturation : undefined,
    brightness: enabledEffects.brightnessContrast ? brightness : undefined,
    contrast: enabledEffects.brightnessContrast ? contrast : undefined,
    chromaticAberration: enabledEffects.chromaticAberration ? chromaticAberration : undefined,
    bloom: enabledEffects.bloom ? bloom : undefined,
    vignette: enabledEffects.vignette ? vignette : undefined,
    grain: enabledEffects.grain ? grain : undefined,
    setEffect: setEffect as UsePhotoModeEffectsReturn["setEffect"],
    resetEffects,
  };
}
