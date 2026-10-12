import { beforeEach, describe, expect, it } from "vitest";
import { EFFECT_DEFINITIONS } from "../utils/constants";
import { usePhotoModeEffectsStore } from "./EffectsStore";

const initialState = usePhotoModeEffectsStore.getInitialState();

beforeEach(() => {
  usePhotoModeEffectsStore.setState(initialState, true);
});

describe("usePhotoModeEffectsStore", () => {
  it("clamps effect values to their defined min/max", () => {
    const { setEffect } = usePhotoModeEffectsStore.getState();

    setEffect("hue", EFFECT_DEFINITIONS.hue.max + 100);
    expect(usePhotoModeEffectsStore.getState().hue).toBe(EFFECT_DEFINITIONS.hue.max);

    setEffect("saturation", EFFECT_DEFINITIONS.saturation.min - 100);
    expect(usePhotoModeEffectsStore.getState().saturation).toBe(EFFECT_DEFINITIONS.saturation.min);
  });

  it("does not drop an update to a different effect made in the same tick (regression: throttle used to be global)", () => {
    const { setEffect } = usePhotoModeEffectsStore.getState();

    setEffect("brightness", 0.5);
    setEffect("contrast", 0.3);

    expect(usePhotoModeEffectsStore.getState().brightness).toBe(0.5);
    expect(usePhotoModeEffectsStore.getState().contrast).toBe(0.3);
  });

  it("keeps the last of rapid repeated updates to the same effect (regression: leading-edge throttle dropped it)", () => {
    const { setEffect } = usePhotoModeEffectsStore.getState();

    setEffect("bloom", 0.5);
    setEffect("bloom", 0.9);

    expect(usePhotoModeEffectsStore.getState().bloom).toBe(0.9);
  });

  it("resets all effects to their default values", () => {
    const { setEffect, resetEffects } = usePhotoModeEffectsStore.getState();

    setEffect("chromaticAberration", 0.5);
    setEffect("grain", 0.8);
    resetEffects();

    expect(usePhotoModeEffectsStore.getState().chromaticAberration).toBe(EFFECT_DEFINITIONS.chromaticAberration.default);
    expect(usePhotoModeEffectsStore.getState().grain).toBe(EFFECT_DEFINITIONS.grain.default);
  });

  it("replaces enabledEffects wholesale via setEnabledEffects", () => {
    const { setEnabledEffects } = usePhotoModeEffectsStore.getState();

    setEnabledEffects({
      hueSaturation: false,
      brightnessContrast: false,
      chromaticAberration: false,
      bloom: true,
      vignette: false,
      grain: false,
    });

    expect(usePhotoModeEffectsStore.getState().enabledEffects.bloom).toBe(true);
    expect(usePhotoModeEffectsStore.getState().enabledEffects.hueSaturation).toBe(false);
  });
});
