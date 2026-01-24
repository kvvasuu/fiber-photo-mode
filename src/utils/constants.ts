import { EffectDefinition, EffectKey, EffectName } from "../types";

export const EFFECT_DEFINITIONS: Record<EffectKey, EffectDefinition> = {
  brightness: {
    label: "Brightness",
    min: -1,
    max: 1,
    default: 0,
    effectMin: -0.75,
    effectMax: 0.75,
  },
  contrast: {
    label: "Contrast",
    min: -1,
    max: 1,
    default: 0,
    effectMin: -0.75,
    effectMax: 0.75,
  },
  hue: {
    label: "Hue",
    min: -1,
    max: 1,
    default: 0,
    effectMin: -Math.PI,
    effectMax: Math.PI,
  },
  saturation: {
    label: "Saturation",
    min: -1,
    max: 1,
    default: 0,
  },
  vignette: {
    label: "Vignette",
    min: 0,
    max: 1,
    default: 0,
  },
  chromaticAberration: {
    label: "Chromatic Aberration",
    min: 0,
    max: 1,
    default: 0,
    effectMin: 0,
    effectMax: 0.01,
  },
  bloom: {
    label: "Bloom",
    min: 0,
    max: 1,
    default: 0,
    effectMin: 0,
    effectMax: 5,
  },
  grain: {
    label: "Grain",
    min: 0,
    max: 1,
    default: 0,
  },
};

export const ENABLED_EFFECTS: Record<EffectName, boolean> = {
  brightnessContrast: true,
  hueSaturation: true,
  vignette: true,
  chromaticAberration: true,
  bloom: false,
  grain: true,
};
