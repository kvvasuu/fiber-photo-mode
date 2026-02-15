import { PerspectiveCamera, Quaternion, Vector3 } from "three";
import { MAX_APERTURE, MAX_ZOOM, MIN_APERTURE } from "../constants";

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
 * Converts a desired focal length (in millimeters) to a PerspectiveCamera zoom value.
 *
 * The returned zoom value is calculated so that the camera's effective vertical FOV
 * matches the FOV of a real camera lens with the given focal length.
 *
 * Important:
 * - Very long focal lengths (e.g. 300mm+) can produce extremely large zoom values.
 *   In practice, zoom should be clamped and combined with camera dolly for stability.
 *
 * @param cameraFov - The camera's base vertical FOV in degrees (camera.fov, without zoom applied)
 * @param focalLengthMm - Desired focal length in millimeters
 * @returns Zoom value to apply to the camera so that its effective FOV matches the focal length
 *
 */
export function focalLengthToZoom(cameraFov: number, focalLengthMm: number): number {
  const targetFov = focalLengthToFov(focalLengthMm);

  // Numerical safety to avoid division by zero
  const epsilon = 0.0001;
  const safeTargetFov = Math.max(targetFov, epsilon);

  const zoom = Math.tan((cameraFov * Math.PI) / 360) / Math.tan((safeTargetFov * Math.PI) / 360);

  return Math.min(Math.max(zoom, 0.1), MAX_ZOOM);
}

const BASE_UP = new Vector3(0, 1, 0);

export function setCameraRoll(camera: PerspectiveCamera, rollRad: number) {
  // kierunek patrzenia
  const viewDir = new Vector3();
  camera.getWorldDirection(viewDir);

  // quaternion rotacji wokół osi widzenia
  const rollQuat = new Quaternion().setFromAxisAngle(viewDir, rollRad);

  // reset do bazowego up
  camera.up.copy(BASE_UP).applyQuaternion(rollQuat).normalize();

  camera.updateProjectionMatrix();
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
