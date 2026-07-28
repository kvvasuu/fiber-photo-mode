// @vitest-environment jsdom
import * as ReactThreeTestRenderer from "@react-three/test-renderer";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { usePhotoModeStore } from "../store/PhotoModeStore";
import { patchCanvasForPostprocessing } from "../test-utils/mockWebGL";
import { PhotoMode } from "./PhotoMode";

const initialState = usePhotoModeStore.getInitialState();

beforeEach(() => {
  usePhotoModeStore.setState(initialState, true);
});

let renderer: Awaited<ReturnType<typeof ReactThreeTestRenderer.create>> | undefined;

afterEach(async () => {
  await renderer?.unmount();
  renderer = undefined;
});

describe("PhotoMode", () => {
  it("registers the rendering context and a working takeScreenshot in the store on mount", async () => {
    renderer = await ReactThreeTestRenderer.create(<PhotoMode />, { beforeReturn: patchCanvasForPostprocessing });

    await ReactThreeTestRenderer.waitFor(() => usePhotoModeStore.getState().composer != null);

    const state = usePhotoModeStore.getState();
    expect(state.renderer).toBeDefined();
    expect(state.scene).toBeDefined();
    expect(state.camera).toBeDefined();
    expect(state.composer).toBeDefined();
    expect(state.takeScreenshot).toBeTypeOf("function");
  });
});
