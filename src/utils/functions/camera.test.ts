import { PerspectiveCamera, Quaternion, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { MAX_ZOOM } from "../constants";
import {
  apertureToDOFParams,
  focalLengthToFov,
  focalLengthToZoom,
  fovToFocalLength,
  makeCameraSnapshot,
  restoreCameraSnapshot,
  setCameraRoll,
} from "./camera";

describe("fovToFocalLength / focalLengthToFov", () => {
  it("are inverses of each other", () => {
    const fov = 40;
    const focalLength = fovToFocalLength(fov);
    expect(focalLengthToFov(focalLength)).toBeCloseTo(fov, 5);
  });
});

describe("focalLengthToZoom", () => {
  it("returns 1 when the target focal length matches the camera's base FOV", () => {
    const baseFov = 50;
    const matchingFocalLength = fovToFocalLength(baseFov);
    expect(focalLengthToZoom(baseFov, matchingFocalLength)).toBeCloseTo(1, 5);
  });

  it("clamps to [0.1, MAX_ZOOM]", () => {
    expect(focalLengthToZoom(50, 1000)).toBeLessThanOrEqual(MAX_ZOOM);
    expect(focalLengthToZoom(50, 1)).toBeGreaterThanOrEqual(0.1);
  });
});

describe("apertureToDOFParams", () => {
  it("returns shallow DOF (small focusRange, large bokehScale) at the widest aperture", () => {
    const { focusRange, bokehScale } = apertureToDOFParams(1); // MIN_APERTURE
    expect(focusRange).toBe(0.5);
    expect(bokehScale).toBe(12);
  });

  it("returns deep DOF (large focusRange, small bokehScale) at the narrowest aperture", () => {
    const { focusRange, bokehScale } = apertureToDOFParams(30); // MAX_APERTURE
    expect(focusRange).toBe(200);
    expect(bokehScale).toBe(3);
  });
});

describe("setCameraRoll", () => {
  it("leaves up unchanged for a zero roll", () => {
    const camera = new PerspectiveCamera();
    setCameraRoll(camera, 0);
    expect(camera.up.toArray()).toEqual([0, 1, 0]);
  });

  it("rotates the up vector around the view direction while keeping it normalized", () => {
    const camera = new PerspectiveCamera();
    setCameraRoll(camera, Math.PI / 2);

    expect(camera.up.length()).toBeCloseTo(1, 5);
    expect(camera.up.toArray()).not.toEqual([0, 1, 0]);
  });
});

describe("makeCameraSnapshot / restoreCameraSnapshot", () => {
  it("restores fov, up and quaternion captured earlier", () => {
    const camera = new PerspectiveCamera(75, 1, 0.1, 100);
    camera.up.set(0, 1, 0);

    const snapshot = makeCameraSnapshot(camera);

    // Mutate the camera after taking the snapshot.
    camera.fov = 30;
    camera.up.set(1, 0, 0);
    camera.quaternion.copy(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2));

    restoreCameraSnapshot(camera, snapshot);

    expect(camera.fov).toBe(75);
    expect(camera.up.toArray()).toEqual([0, 1, 0]);
    expect(camera.quaternion.equals(snapshot.quaternion)).toBe(true);
  });
});
