import { EffectKey } from "../../types";
import { EFFECT_DEFINITIONS } from "../constants";

/**
 * Map effect value from UI range to actual effect range
 * @param normalizedValue - Value in UI range (typically -100 to 100 or 0 to 100)
 * @param effectKey - Effect key to determine target range
 * @returns Mapped value in target range (effectMin-effectMax if defined, otherwise min-max), rounded to 3 decimal places
 *
 * @example
 * // Maps using effectMin/effectMax if available
 * mapEffectValue(50, "brightness") // Maps 50 from UI range to actual effect range
 *
 * // Falls back to min/max if effectMin/effectMax not defined
 * mapEffectValue(100, "vignette") // Uses min-max range
 */
export function mapEffectValue(normalizedValue: number, effectKey: EffectKey): number {
  const effectDefinition = EFFECT_DEFINITIONS[effectKey];

  // Determine the UI range (min/max from definition)
  const uiMin = effectDefinition.min;
  const uiMax = effectDefinition.max;

  // Clamp value to UI range
  const clamped = Math.max(uiMin, Math.min(uiMax, normalizedValue));

  // Determine target range: use effectMin/effectMax if available, otherwise min/max
  const targetMin = effectDefinition.effectMin ?? effectDefinition.min;
  const targetMax = effectDefinition.effectMax ?? effectDefinition.max;

  // Map from UI range to target range
  const mapped = ((clamped - uiMin) / (uiMax - uiMin)) * (targetMax - targetMin) + targetMin;

  // Round to 3 decimal places
  return Math.round(mapped * 1000) / 1000;
}
