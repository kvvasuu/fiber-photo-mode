import { describe, expect, it } from "vitest";
import { EFFECT_DEFINITIONS } from "../constants";
import { mapEffectValue } from "./misc";

describe("mapEffectValue", () => {
  it("maps the UI range to the effect range for keys with a distinct effectMin/effectMax", () => {
    // brightness: UI range [-1, 1] maps to effect range [-0.75, 0.75]
    expect(mapEffectValue(0, "brightness")).toBe(0);
    expect(mapEffectValue(1, "brightness")).toBe(EFFECT_DEFINITIONS.brightness.effectMax);
    expect(mapEffectValue(-1, "brightness")).toBe(EFFECT_DEFINITIONS.brightness.effectMin);
  });

  it("falls back to min/max when no effectMin/effectMax is defined", () => {
    // vignette has no effectMin/effectMax, so the mapped value equals the input
    expect(mapEffectValue(0.5, "vignette")).toBe(0.5);
  });

  it("clamps the input to the UI range before mapping", () => {
    expect(mapEffectValue(100, "brightness")).toBe(EFFECT_DEFINITIONS.brightness.effectMax);
    expect(mapEffectValue(-100, "brightness")).toBe(EFFECT_DEFINITIONS.brightness.effectMin);
  });

  it("rounds the result to 3 decimal places", () => {
    const result = mapEffectValue(0.3333333, "hue");
    expect(result).toBe(Math.round(result * 1000) / 1000);
  });
});
