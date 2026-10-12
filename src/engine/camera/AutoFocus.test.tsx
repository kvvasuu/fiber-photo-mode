// @vitest-environment jsdom
import * as ReactThreeTestRenderer from "@react-three/test-renderer";
import { EffectPass } from "postprocessing";
import { PerspectiveCamera } from "three";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCameraStore } from "../../store/CameraStore";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { patchCanvasForPostprocessing } from "../../test-utils/mockWebGL";
import { PhotoMode } from "../PhotoMode";
import { AutoFocus } from "./AutoFocus";

const initialPhotoModeState = usePhotoModeStore.getInitialState();
const initialCameraState = useCameraStore.getInitialState();

beforeEach(() => {
  usePhotoModeStore.setState(initialPhotoModeState, true);
  useCameraStore.setState(initialCameraState, true);
});

let renderer: Awaited<ReturnType<typeof ReactThreeTestRenderer.create>> | undefined;

afterEach(async () => {
  await renderer?.unmount();
  renderer = undefined;
  vi.restoreAllMocks();
});

const autoFocusPasses = () => usePhotoModeStore.getState().composer!.passes.filter((p) => p.name === "AutoFocusPass");

const mount = async () => {
  renderer = await ReactThreeTestRenderer.create(
    <>
      <PhotoMode />
      <AutoFocus />
    </>,
    { beforeReturn: patchCanvasForPostprocessing },
  );
  await ReactThreeTestRenderer.waitFor(() => usePhotoModeStore.getState().composer != null);
  await ReactThreeTestRenderer.act(async () => {});
};

describe("AutoFocus", () => {
  it("adds its DOF pass to the composer on mount (regression: it was only added on a later re-render)", async () => {
    await mount();

    expect(autoFocusPasses()).toHaveLength(1);
  });

  it("replaces its DOF pass with a single live one when the camera changes", async () => {
    const disposeSpy = vi.spyOn(EffectPass.prototype, "dispose");
    await mount();
    const [oldPass] = autoFocusPasses();

    await ReactThreeTestRenderer.act(async () => {
      usePhotoModeStore.getState().setCamera(new PerspectiveCamera());
    });

    const passes = autoFocusPasses();
    expect(passes).toHaveLength(1);
    expect(passes[0]).not.toBe(oldPass);
    expect(disposeSpy.mock.contexts).toContain(oldPass);
    expect(disposeSpy.mock.contexts).not.toContain(passes[0]);
  });

  it("toggles its DOF pass with photo mode and the DOF setting", async () => {
    await mount();
    const [pass] = autoFocusPasses();
    expect(pass.enabled).toBe(false);

    await ReactThreeTestRenderer.act(async () => {
      usePhotoModeStore.getState().togglePhotoMode(true);
      useCameraStore.getState().toggleDOF(true);
    });
    expect(pass.enabled).toBe(true);

    await ReactThreeTestRenderer.act(async () => {
      useCameraStore.getState().toggleDOF(false);
    });
    expect(pass.enabled).toBe(false);
  });
});
