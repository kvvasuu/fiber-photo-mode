import { createWithEqualityFn } from "zustand/traditional";
import { EffectKey, EffectName } from "../types";
import { EFFECT_DEFINITIONS, ENABLED_EFFECTS } from "../utils/constants";

export type PhotoModeEffectsStore = {
  // Individual effect settings
  hue: number;
  saturation: number;
  brightness: number;
  contrast: number;
  chromaticAberration: number;
  bloom: number;
  vignette: number;
  grain: number;

  enabledEffects: Record<EffectName, boolean>;

  setEnabledEffects: (effects: Record<EffectName, boolean>) => void;

  // Method to update effect settings
  setEffect: (effectName: EffectKey, value: number) => void;

  // Method to reset all effects to default values
  resetEffects: () => void;
};

// Equality check to prevent unnecessary re-renders
const equalityFn = <T>(a: T, b: T) => a === b;

// Throttle updates to max 60fps
let lastSetTime: number = 0;

export const usePhotoModeEffectsStore = createWithEqualityFn<PhotoModeEffectsStore>(
  (set) => ({
    hue: 0, // -PI to PI
    saturation: 0, // -PI to PI
    brightness: 0, // -1 to 1
    contrast: 0, // -1 to 1
    chromaticAberration: 0, // 0 to 1
    bloom: 0, // 0 to 1
    vignette: 0, // 0 to 1
    grain: 0, // 0 to 1

    enabledEffects: {
      hueSaturation: ENABLED_EFFECTS.hueSaturation,
      brightnessContrast: ENABLED_EFFECTS.brightnessContrast,
      chromaticAberration: ENABLED_EFFECTS.chromaticAberration,
      bloom: ENABLED_EFFECTS.bloom,
      vignette: ENABLED_EFFECTS.vignette,
      grain: ENABLED_EFFECTS.grain,
    },

    setEnabledEffects: (effects) => set({ enabledEffects: effects }),

    setEffect: (effectName, value) => {
      const now = performance.now();
      if (now - lastSetTime < 16) return; // max 60fps update
      lastSetTime = now;

      const def = EFFECT_DEFINITIONS[effectName];
      const clamped = Math.min(def.max, Math.max(def.min, value));
      set({ [effectName]: clamped });
    },

    resetEffects: () =>
      set(
        Object.fromEntries(
          Object.entries(EFFECT_DEFINITIONS).map(([key, def]) => [key, def.default]),
        ) as Partial<PhotoModeEffectsStore>,
      ),
  }),
  equalityFn,
);
