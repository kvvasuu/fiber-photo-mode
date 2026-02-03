import { EffectComposer as EffectComposerImpl } from "postprocessing";
import {
  PerspectiveCamera,
  RGBAFormat,
  Scene,
  Texture,
  UnsignedByteType,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { EffectKey, SphericalCameraControls, TakeScreenshotFn, UserControlsSnapshot } from "../types";
import { CapturePass } from "./CapturePass";
import { EFFECT_DEFINITIONS } from "./constants";

/**
 * Flips pixel buffer vertically (Y-axis)
 */
const flipY = (buffer: Uint8Array, width: number, height: number) => {
  const rowSize = width * 4;
  const temp = new Uint8Array(rowSize);

  for (let y = 0; y < height / 2; y++) {
    const top = y * rowSize;
    const bottom = (height - y - 1) * rowSize;

    temp.set(buffer.subarray(top, top + rowSize));
    buffer.copyWithin(top, bottom, bottom + rowSize);
    buffer.set(temp, bottom);
  }
};

/**
 * Creates a WebGL render target for screenshot capture
 */
const createRenderTarget = (gl: WebGLRenderer, width: number, height: number): WebGLRenderTarget<Texture> => {
  const target = new WebGLRenderTarget(width, height, {
    format: RGBAFormat,
    type: UnsignedByteType,
    colorSpace: gl.outputColorSpace as any,
    samples: 4,
    depthBuffer: true,
  });
  return target;
};

/**
 * Stores the current renderer and camera state
 */
type RenderState = {
  prevTarget: WebGLRenderTarget<Texture> | null;
  prevSize: Vector2;
  prevPixelRatio: number;
  prevAspect: number;
};

/**
 * Saves current renderer and camera state for restoration
 */
const saveRenderState = (gl: WebGLRenderer, camera: PerspectiveCamera): RenderState => ({
  prevTarget: gl.getRenderTarget(),
  prevSize: gl.getSize(new Vector2()),
  prevPixelRatio: gl.getPixelRatio(),
  prevAspect: camera.aspect,
});

/**
 * Configures camera aspect ratio for screenshot
 */
const configureCamera = (camera: PerspectiveCamera, width: number, height: number) => {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

/**
 * Renders scene to FBO with or without post-processing
 */
const renderToFBO = (
  gl: WebGLRenderer,
  scene: Scene,
  camera: PerspectiveCamera,
  fbo: WebGLRenderTarget<Texture>,
  composer?: EffectComposerImpl | null,
) => {
  if (composer) {
    // Use EffectComposer to render with post-processing
    const prevRenderToScreen = composer.passes?.map((p: any) => p?.renderToScreen);
    const prevComposerSize = new Vector2(composer.outputBuffer.width, composer.outputBuffer.height);

    const capturePass = new CapturePass(fbo);

    try {
      composer.setSize(fbo.width, fbo.height, false);
      composer.addPass(capturePass);

      composer.passes.forEach((pass) => {
        if (pass) pass.renderToScreen = false;
      });

      composer.render();
    } finally {
      composer.removePass(capturePass);

      if (prevRenderToScreen) {
        for (let i = 0; i < composer.passes.length; i++) {
          const p = composer.passes[i];
          if (p && typeof prevRenderToScreen[i] !== "undefined") {
            p.renderToScreen = prevRenderToScreen[i];
          }
        }
      }

      composer.setSize(prevComposerSize.x, prevComposerSize.y, false);
    }
  } else {
    // Direct rendering without post-processing
    gl.setRenderTarget(fbo);
    gl.render(scene, camera);
  }
};

/**
 * Restores renderer and camera to previous state
 */
const restoreRenderState = (gl: WebGLRenderer, camera: PerspectiveCamera, state: RenderState) => {
  camera.aspect = state.prevAspect;
  camera.updateProjectionMatrix();
  gl.setPixelRatio(state.prevPixelRatio);
  gl.setSize(state.prevSize.x, state.prevSize.y, false);
  gl.setRenderTarget(state.prevTarget);
};

/**
 * Converts pixel buffer to canvas element
 */
const pixelsToCanvas = (buffer: Uint8Array, width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.putImageData(new ImageData(new Uint8ClampedArray(buffer), width, height), 0, 0);
  return canvas;
};

/**
 * Converts canvas to File or DataURL string
 */
const canvasToOutput = async (
  canvas: HTMLCanvasElement,
  format: string,
  quality: number,
  toFile?: boolean,
): Promise<string | File> => {
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), `image/${format}`, quality),
  );

  if (toFile) {
    return new File([blob], `screenshot.${format}`, { type: `image/${format}` });
  } else {
    return URL.createObjectURL(blob);
  }
};

/**
 * Takes a screenshot of the Three.js scene and returns as DataURL or File
 * Supports rendering with and without EffectComposer for post-processing
 * Creates and disposes WebGLRenderTarget internally
 */
export const takeScreenshot: TakeScreenshotFn = (gl, scene, camera, composer) => async (options?) => {
  // Save current state
  const renderState = saveRenderState(gl, camera as PerspectiveCamera);

  // Determine screenshot parameters
  const width = options?.width ?? renderState.prevSize.x;
  const height = options?.height ?? renderState.prevSize.y;
  const format = options?.format ?? "jpeg";
  const quality = options?.quality ?? 0.95;

  try {
    // Ensure pixel ratio is 1 for consistent results
    gl.setPixelRatio(1);
    gl.setSize(width, height, false);

    const pixelSize = new Vector2();
    gl.getDrawingBufferSize(pixelSize);

    // Output dimensions
    const outputWidth = pixelSize.x;
    const outputHeight = pixelSize.y;

    // Create pixel buffer
    const buffer = new Uint8Array(outputWidth * outputHeight * 4);

    // Create render target for this screenshot
    const fbo = createRenderTarget(gl, outputWidth, outputHeight);

    // Configure camera
    configureCamera(camera as PerspectiveCamera, outputWidth, outputHeight);

    // Render to FBO
    renderToFBO(gl, scene, camera as PerspectiveCamera, fbo, composer);

    // Read pixels from FBO
    gl.readRenderTargetPixels(fbo, 0, 0, outputWidth, outputHeight, buffer);

    // Cleanup render target
    fbo.dispose();

    // Flip Y-axis
    flipY(buffer, outputWidth, outputHeight);

    // Convert to output format
    const canvas = pixelsToCanvas(buffer, outputWidth, outputHeight);
    return canvasToOutput(canvas, format, quality, options?.toFile);
  } finally {
    // Restore previous state
    restoreRenderState(gl, camera as PerspectiveCamera, renderState);
  }
};

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
