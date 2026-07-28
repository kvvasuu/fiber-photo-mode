import { beforeEach, describe, expect, it, vi } from "vitest";
import { EFFECT_DEFINITIONS } from "../utils/constants";
import { usePhotoModeEffectsStore } from "./EffectsStore";

const initialState = usePhotoModeEffectsStore.getInitialState();

beforeEach(() => {
  usePhotoModeEffectsStore.setState(initialState, true);
});

describe("usePhotoModeEffectsStore", () => {
  // Each test below uses effect keys not touched by any other test, since the
  // setEffect throttle is tracked in a module-level map that isn't reset between
  // tests (and some tests control performance.now() directly).

  it("clamps effect values to their defined min/max", () => {
    const { setEffect } = usePhotoModeEffectsStore.getState();

    setEffect("hue", EFFECT_DEFINITIONS.hue.max + 100);
    expect(usePhotoModeEffectsStore.getState().hue).toBe(EFFECT_DEFINITIONS.hue.max);

    setEffect("saturation", EFFECT_DEFINITIONS.saturation.min - 100);
    expect(usePhotoModeEffectsStore.getState().saturation).toBe(EFFECT_DEFINITIONS.saturation.min);
  });

  it("does not drop an update to a different effect made in the same tick (regression: throttle used to be global)", () => {
    const nowSpy = vi.spyOn(performance, "now").mockReturnValue(1000);
    const { setEffect } = usePhotoModeEffectsStore.getState();

    setEffect("brightness", 0.5);
    setEffect("contrast", 0.3);

    expect(usePhotoModeEffectsStore.getState().brightness).toBe(0.5);
    expect(usePhotoModeEffectsStore.getState().contrast).toBe(0.3);

    nowSpy.mockRestore();
  });

  it("throttles rapid repeated updates to the same effect to max ~60fps", () => {
    const nowSpy = vi.spyOn(performance, "now");
    const { setEffect } = usePhotoModeEffectsStore.getState();

    nowSpy.mockReturnValueOnce(1000);
    setEffect("bloom", 0.5); // first update for this key - always applies

    nowSpy.mockReturnValueOnce(1005); // 5ms later - within the 16ms window
    setEffect("bloom", 0.9);
    expect(usePhotoModeEffectsStore.getState().bloom).toBe(0.5);

    nowSpy.mockReturnValueOnce(1030); // 30ms later - past the window
    setEffect("bloom", 0.9);
    expect(usePhotoModeEffectsStore.getState().bloom).toBe(0.9);

    nowSpy.mockRestore();
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
