import { Vector3 } from "three";
import { SphericalCameraControls, UserControlsSnapshot } from "../../types";
import { MAX_APERTURE, MIN_APERTURE } from "../constants";

/**
 * Checks whether the provided controls object is compatible with
 * orbit-like (spherical) camera controls.
 *
 * This is a type guard that allows TypeScript to narrow `controls`
 * to `SphericalCameraControls` when true.
 *
 * @param c - Any object that might implement orbit-like controls
 * @returns True if the object has the minimal API required for snapshots
 */
export function isSphericalControls(c: any): c is SphericalCameraControls {
  return (
    c &&
    typeof c.getDistance === "function" &&
    typeof c.getAzimuthalAngle === "function" &&
    typeof c.getPolarAngle === "function" &&
    c.target?.isVector3 &&
    c.object?.position?.isVector3
  );
}

/**
 * Creates a snapshot of a given orbit-like camera controls object.
 *
 * The snapshot contains only serializable data necessary to restore
 * the camera state later. Returns null if the controls are not compatible.
 *
 * @param c - Controls object (e.g., OrbitControls, CameraControls)
 * @returns A `UserControlsSnapshot` object or null if not compatible
 */
export function makeControlsSnapshot(c: any): UserControlsSnapshot | null {
  if (!isSphericalControls(c)) return null;

  return {
    enabled: c.enabled,
    position: c.object.position.clone(), // world-space position
    target: c.target.clone(), // look-at target
    zoom: c.object.zoom, // camera zoom factor
    spherical: {
      radius: c.getDistance(), // distance from target
      theta: c.getAzimuthalAngle(), // horizontal angle
      phi: c.getPolarAngle(), // vertical angle
    },
  };
}

/**
 * Restores a previously saved controls snapshot onto a given controls object.
 *
 * Moves the camera to the snapshot position, sets the target, zoom, and
 * updates the projection matrix and internal state of the controls.
 * Does nothing if either snapshot is null or controls are incompatible.
 *
 * @param controls - The orbit-like camera controls object to restore
 * @param snap - Snapshot data to apply
 */
export function restoreControlsSnapshot(controls: any, snap: UserControlsSnapshot | null) {
  if (!snap || !isSphericalControls(controls)) return;

  // Restore enabled state and look-at target
  controls.enabled = snap.enabled;
  controls.target.copy(snap.target);

  // Convert spherical coordinates to Cartesian offset and apply to camera
  const offset = new Vector3().setFromSphericalCoords(snap.spherical.radius, snap.spherical.phi, snap.spherical.theta);

  controls.object.position.copy(snap.target).add(offset);
  controls.object.zoom = snap.zoom;
  controls.object.updateProjectionMatrix();

  // Update controls internal state (required by OrbitControls and similar)
  controls.update();
}

/**
 * Converts FOV (in degrees) to focal length (in mm)
 *
 * @param fovDegrees - Field of view in degrees (vertical FOV for Three.js PerspectiveCamera)
 * @param sensorSizeMm - Sensor size in mm (35mm for full frame, 24mm for APS-C)
 * @param isVertical - Whether FOV is vertical (true for Three.js) or horizontal
 * @returns Focal length in millimeters
 *
 * @example
 * // Three.js camera with 50° vertical FOV on full frame sensor
 * fovToFocalLength(50, 35, true) // ≈ 35mm
 */
export function fovToFocalLength(fovDegrees: number, sensorSizeMm: number = 35, isVertical: boolean = true): number {
  // Convert degrees to radians
  const fovRadians = (fovDegrees * Math.PI) / 180;

  // Three.js uses vertical FOV, but photography typically refers to horizontal FOV
  // For full frame (36mm x 24mm), vertical dimension is 24mm
  const sensorDimension = isVertical ? (sensorSizeMm * 24) / 36 : sensorSizeMm;

  // Calculate focal length using the formula: f = d / (2 * tan(FOV/2))
  // where d is sensor dimension and FOV is in radians
  const focalLength = sensorDimension / (2 * Math.tan(fovRadians / 2));

  return focalLength;
}

/**
 * Converts focal length (in mm) to FOV (in degrees)
 *
 * @param focalLengthMm - Focal length in millimeters
 * @param sensorSizeMm - Sensor size in mm (35mm for full frame, 24mm for APS-C)
 * @param isVertical - Whether to return vertical (true) or horizontal FOV
 * @returns Field of view in degrees
 *
 * @example
 * // 50mm lens on full frame sensor
 * focalLengthToFov(50, 35, true) // ≈ 40° (vertical FOV for Three.js)
 */
export function focalLengthToFov(focalLengthMm: number, sensorSizeMm: number = 35, isVertical: boolean = true): number {
  // Calculate sensor dimension based on orientation
  // For full frame: horizontal = 36mm, vertical = 24mm
  const sensorDimension = isVertical ? (sensorSizeMm * 24) / 36 : sensorSizeMm;

  // Calculate FOV using the formula: FOV = 2 * atan(d / (2 * f))
  // where d is sensor dimension and f is focal length
  const fovRadians = 2 * Math.atan(sensorDimension / (2 * focalLengthMm));

  // Convert radians to degrees
  const fovDegrees = (fovRadians * 180) / Math.PI;

  return fovDegrees;
}

/**
 * Maps camera aperture (f-stop) to perceptual Depth of Field range (non-linear).
 *
 * Smaller f-stop (wider aperture) → shallow DOF → small focusRange
 * Larger f-stop (narrower aperture) → deep DOF → large focusRange
 *
 * Non-linear mapping gives a more realistic progression, approaching large range for high f-stops.
 *
 * @param aperture - F-stop value (clamped to [MIN_APERTURE, MAX_APERTURE])
 * @returns Focus range in world units for DepthOfFieldEffect
 */
export function apertureToFocusRange(aperture: number): number {
  const minRange = 0.5; // shallow DOF
  const maxRange = 50.0; // deep DOF (practically infinity)

  const clamped = Math.max(MIN_APERTURE, Math.min(aperture, MAX_APERTURE));

  // normalize to [0,1]
  const t = (clamped - MIN_APERTURE) / (MAX_APERTURE - MIN_APERTURE);

  // non-linear mapping: t^power gives faster growth at high f-stop
  const power = 2.5; // tweak for desired curve
  const nonLinearT = Math.pow(t, power);

  return minRange + nonLinearT * (maxRange - minRange);
}
