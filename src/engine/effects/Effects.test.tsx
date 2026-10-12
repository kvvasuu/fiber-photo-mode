// @vitest-environment jsdom
import * as ReactThreeTestRenderer from "@react-three/test-renderer";
import {
  BlendFunction,
  BloomEffect,
  Effect,
  EffectAttribute,
  EffectPass,
  NoiseEffect,
  VignetteEffect,
} from "postprocessing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { EffectName } from "../../types";
import { patchCanvasForPostprocessing } from "../../test-utils/mockWebGL";
import { PhotoMode } from "../PhotoMode";
import { PHOTO_MODE_EFFECTS_PASS_NAME } from "./Effects";

const initialPhotoModeState = usePhotoModeStore.getInitialState();
const initialEffectsState = usePhotoModeEffectsStore.getInitialState();

beforeEach(() => {
  usePhotoModeStore.setState(initialPhotoModeState, true);
  usePhotoModeEffectsStore.setState(initialEffectsState, true);
});

let renderer: Awaited<ReturnType<typeof ReactThreeTestRenderer.create>> | undefined;

afterEach(async () => {
  await renderer?.unmount();
  renderer = undefined;
});

describe("built-in effects lifecycle", () => {
  it("disposes an effect's postprocessing instance when it unmounts (regression: effects used to share one never-disposed instance)", async () => {
    const disposeSpy = vi.spyOn(BloomEffect.prototype, "dispose");

    renderer = await ReactThreeTestRenderer.create(
      <PhotoMode
        enabledEffects={{
          bloom: true,
          hueSaturation: false,
          brightnessContrast: false,
          chromaticAberration: false,
          vignette: false,
          grain: false,
        }}
      />,
      { beforeReturn: patchCanvasForPostprocessing },
    );

    await ReactThreeTestRenderer.waitFor(() => usePhotoModeStore.getState().composer != null);
    expect(disposeSpy).not.toHaveBeenCalled();

    await renderer.unmount();
    renderer = undefined;

    expect(disposeSpy).toHaveBeenCalledTimes(1);

    disposeSpy.mockRestore();
  });
});

const only = (...names: EffectName[]): Record<EffectName, boolean> => ({
  hueSaturation: false,
  brightnessContrast: false,
  chromaticAberration: false,
  bloom: false,
  vignette: false,
  grain: false,
  ...Object.fromEntries(names.map((name) => [name, true])),
});

const composerPasses = () => usePhotoModeStore.getState().composer!.passes;
const photoEffectsPass = () => composerPasses().find((p) => p.name === PHOTO_MODE_EFFECTS_PASS_NAME) as EffectPass;
const photoEffects = () => (photoEffectsPass() as unknown as { effects: Effect[] }).effects;

const mount = async (element: React.ReactElement) => {
  renderer = await ReactThreeTestRenderer.create(element, { beforeReturn: patchCanvasForPostprocessing });
  await ReactThreeTestRenderer.waitFor(() => usePhotoModeStore.getState().composer != null);
  await ReactThreeTestRenderer.act(async () => {});
};

describe("photo effects pass", () => {
  it("only contains effects that mergeMode='auto' would also keep in a single pass", async () => {
    await mount(
      <PhotoMode
        enabledEffects={only("chromaticAberration", "bloom", "vignette", "hueSaturation", "brightnessContrast", "grain")}
      />,
    );

    const effects = photoEffects();
    const convolution = effects.filter((e) => (e.getAttributes() & EffectAttribute.CONVOLUTION) !== 0);
    const mainUv = effects.filter((e) => /mainUv/.test(e.getFragmentShader() ?? ""));
    expect(effects).toHaveLength(6);
    expect(convolution.length).toBeLessThanOrEqual(1);
    expect(mainUv).toEqual([]);
  });

  it("runs only while photo mode is on, without rebuilding the pass on toggle", async () => {
    await mount(<PhotoMode />);
    const pass = photoEffectsPass();
    expect(pass.enabled).toBe(false);

    await ReactThreeTestRenderer.act(async () => usePhotoModeStore.getState().togglePhotoMode(true));
    expect(photoEffectsPass()).toBe(pass);
    expect(pass.enabled).toBe(true);

    await ReactThreeTestRenderer.act(async () => usePhotoModeStore.getState().togglePhotoMode(false));
    expect(photoEffectsPass()).toBe(pass);
    expect(pass.enabled).toBe(false);
  });

  it("still gets the frame to the screen while the photo effects pass is off", async () => {
    await mount(<PhotoMode enabledEffects={only("vignette")} />);

    const passes = composerPasses();
    const last = passes[passes.length - 1];
    expect(photoEffectsPass().enabled).toBe(false);
    expect(last.enabled).toBe(true);
    expect(last.renderToScreen).toBe(true);
  });

  it("rebuilds the pass when the enabledEffects prop changes at runtime (regression: kept the old, disposed effects)", async () => {
    await mount(<PhotoMode enabledEffects={only("vignette")} />);
    expect(photoEffects().map((e) => e.constructor)).toEqual([VignetteEffect]);

    await ReactThreeTestRenderer.act(async () => {
      await renderer!.update(<PhotoMode enabledEffects={only("grain")} />);
    });
    expect(photoEffects().map((e) => e.constructor)).toEqual([NoiseEffect]);
  });

  it("applies effect values with the same blending as the hand-built effects it replaced", async () => {
    await mount(<PhotoMode enabledEffects={only("vignette", "bloom", "grain")} />);

    await ReactThreeTestRenderer.act(async () => usePhotoModeEffectsStore.getState().setEffect("vignette", 0.5));

    const vignette = photoEffects().find((e) => e instanceof VignetteEffect) as VignetteEffect;
    expect(vignette.darkness).toBe(0.5);
    expect(vignette.offset).toBeCloseTo(0.1);

    const bloom = photoEffects().find((e) => e instanceof BloomEffect)!;
    const noise = photoEffects().find((e) => e instanceof NoiseEffect) as NoiseEffect;
    expect(bloom.blendMode.blendFunction).toBe(BlendFunction.SCREEN);
    expect(noise.blendMode.blendFunction).toBe(BlendFunction.SCREEN);
    expect(noise.premultiply).toBe(true);
  });
});
