import { beforeEach, describe, expect, it } from "vitest";
import { MAX_APERTURE, MAX_FOCAL_LENGTH, MIN_APERTURE, MIN_FOCAL_LENGTH } from "../utils/constants";
import { useCameraStore } from "./CameraStore";

const initialState = useCameraStore.getInitialState();

beforeEach(() => {
  useCameraStore.setState(initialState, true);
});

describe("useCameraStore", () => {
  it("clamps aperture to [MIN_APERTURE, MAX_APERTURE]", () => {
    useCameraStore.getState().setAperture(MAX_APERTURE + 100);
    expect(useCameraStore.getState().aperture).toBe(MAX_APERTURE);

    useCameraStore.getState().setAperture(MIN_APERTURE - 100);
    expect(useCameraStore.getState().aperture).toBe(MIN_APERTURE);
  });

  it("clamps focal length to [MIN_FOCAL_LENGTH, MAX_FOCAL_LENGTH]", () => {
    useCameraStore.getState().setFocalLength(MAX_FOCAL_LENGTH + 100);
    expect(useCameraStore.getState().focalLength).toBe(MAX_FOCAL_LENGTH);

    useCameraStore.getState().setFocalLength(MIN_FOCAL_LENGTH - 100);
    expect(useCameraStore.getState().focalLength).toBe(MIN_FOCAL_LENGTH);
  });

  it("toggles DOF and autoFocus, with and without an explicit value", () => {
    const { toggleDOF, toggleAutoFocus } = useCameraStore.getState();

    toggleDOF();
    expect(useCameraStore.getState().DOFEnabled).toBe(true);
    toggleDOF();
    expect(useCameraStore.getState().DOFEnabled).toBe(false);
    toggleDOF(true);
    expect(useCameraStore.getState().DOFEnabled).toBe(true);

    toggleAutoFocus(true);
    expect(useCameraStore.getState().autoFocus).toBe(true);
  });

  it("resets focalLength, aperture and focusDistance to their initial values", () => {
    const { setFocalLength, setAperture, setFocusDistance, resetCamera } = useCameraStore.getState();

    setFocalLength(200);
    setAperture(2.8);
    setFocusDistance(50);
    resetCamera();

    expect(useCameraStore.getState().focalLength).toBe(initialState.focalLength);
    expect(useCameraStore.getState().aperture).toBe(initialState.aperture);
    expect(useCameraStore.getState().focusDistance).toBe(initialState.focusDistance);
  });
});
