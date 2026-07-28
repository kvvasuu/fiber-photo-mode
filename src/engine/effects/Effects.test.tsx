// @vitest-environment jsdom
import * as ReactThreeTestRenderer from "@react-three/test-renderer";
import { BloomEffect } from "postprocessing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePhotoModeEffectsStore } from "../../store/EffectsStore";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { patchCanvasForPostprocessing } from "../../test-utils/mockWebGL";
import { PhotoMode } from "../PhotoMode";

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
