import { beforeEach, describe, expect, it } from "vitest";
import { usePhotoModeStore } from "./PhotoModeStore";

const initialState = usePhotoModeStore.getInitialState();

beforeEach(() => {
  usePhotoModeStore.setState(initialState, true);
});

describe("usePhotoModeStore", () => {
  it("toggles photoModeOn with an explicit value or flips it with none", () => {
    const { togglePhotoMode } = usePhotoModeStore.getState();

    togglePhotoMode(true);
    expect(usePhotoModeStore.getState().photoModeOn).toBe(true);

    togglePhotoMode();
    expect(usePhotoModeStore.getState().photoModeOn).toBe(false);

    togglePhotoMode();
    expect(usePhotoModeStore.getState().photoModeOn).toBe(true);
  });

  it("registers the rendering context via the setters", () => {
    const fakeRenderer = {} as never;
    const fakeScene = {} as never;
    const fakeCamera = {} as never;
    const fakeComposer = {} as never;
    const fakeTakeScreenshot = () => Promise.resolve("url");

    const { setRenderer, setScene, setCamera, setComposer, setTakeScreenshot } = usePhotoModeStore.getState();

    setRenderer(fakeRenderer);
    setScene(fakeScene);
    setCamera(fakeCamera);
    setComposer(fakeComposer);
    setTakeScreenshot(fakeTakeScreenshot);

    const state = usePhotoModeStore.getState();
    expect(state.renderer).toBe(fakeRenderer);
    expect(state.scene).toBe(fakeScene);
    expect(state.camera).toBe(fakeCamera);
    expect(state.composer).toBe(fakeComposer);
    expect(state.takeScreenshot).toBe(fakeTakeScreenshot);
  });
});
