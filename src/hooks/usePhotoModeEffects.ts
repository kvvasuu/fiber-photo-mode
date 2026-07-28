import { shallow } from "zustand/shallow";
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
 * Hook to access and control photo mode effects.
 *
 * Accepts an optional selector (like `useThree`) so consumers that only need e.g. a
 * single setter can subscribe to just that, instead of re-rendering on every effect
 * value change: `usePhotoModeEffects((state) => state.setEffect)`.
 *
 * @returns Selected slice of the derived effects state (the whole object if no selector is given)
 */
export function usePhotoModeEffects<T = UsePhotoModeEffectsReturn>(
  selector: (state: UsePhotoModeEffectsReturn) => T = (state) => state as unknown as T,
) {
  return usePhotoModeEffectsStore((state) => {
    const { enabledEffects } = state;

    return selector({
      hue: enabledEffects.hueSaturation ? state.hue : undefined,
      saturation: enabledEffects.hueSaturation ? state.saturation : undefined,
      brightness: enabledEffects.brightnessContrast ? state.brightness : undefined,
      contrast: enabledEffects.brightnessContrast ? state.contrast : undefined,
      chromaticAberration: enabledEffects.chromaticAberration ? state.chromaticAberration : undefined,
      bloom: enabledEffects.bloom ? state.bloom : undefined,
      vignette: enabledEffects.vignette ? state.vignette : undefined,
      grain: enabledEffects.grain ? state.grain : undefined,
      setEffect: state.setEffect,
      resetEffects: state.resetEffects,
    });
  }, shallow);
}
