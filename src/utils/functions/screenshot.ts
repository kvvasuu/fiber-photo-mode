import { EffectComposer as EffectComposerImpl } from "postprocessing";
import {
  PerspectiveCamera,
  RGBAFormat,
  Scene,
  Texture,
  UnsignedByteType,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { ScreenshotOptions, TakeScreenshotFn } from "../../types";
import { CapturePass } from "./../CapturePass";

// Flag indicating if a screenshot capture is currently in progress
export let screenshotInProgress = false;

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
 * Stores the current renderer and camera state
 */
type RenderState = {
  prevTarget: WebGLRenderTarget<Texture> | null;
  prevSize: Vector2;
  prevAspect: number;
};

/**
 * Saves current renderer and camera state for restoration
 */
const saveRenderState = (gl: WebGLRenderer, camera: PerspectiveCamera): RenderState => ({
  prevTarget: gl.getRenderTarget(),
  prevSize: gl.getSize(new Vector2()),
  prevAspect: camera.aspect,
});

/**
 * Creates a render target, renders the scene into it with or without post-processing, and returns the FBO.
 */
const renderToFBO = (
  gl: WebGLRenderer,
  scene: Scene,
  camera: PerspectiveCamera,
  width: number,
  height: number,
  composer?: EffectComposerImpl | null,
): WebGLRenderTarget<Texture> => {
  const fbo = new WebGLRenderTarget(width, height, {
    format: RGBAFormat,
    type: UnsignedByteType,
    colorSpace: gl.outputColorSpace as any,
    depthBuffer: false,
  });

  if (composer) {
    const prevRenderToScreen = composer.passes?.map((p: any) => p?.renderToScreen);
    const prevComposerSize = new Vector2(composer.outputBuffer.width, composer.outputBuffer.height);
    const capturePass = new CapturePass(fbo, false);

    try {
      composer.inputBuffer.setSize(width, height);
      composer.outputBuffer.setSize(width, height);
      // Resize all passes and disable renderToScreen in a single loop.
      for (const pass of composer.passes) {
        pass.setSize(width, height);
        pass.renderToScreen = false;
      }
      composer.addPass(capturePass);

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

      composer.inputBuffer.setSize(prevComposerSize.x, prevComposerSize.y);
      composer.outputBuffer.setSize(prevComposerSize.x, prevComposerSize.y);
      for (const pass of composer.passes) {
        pass.setSize(prevComposerSize.x, prevComposerSize.y);
      }
    }
  } else {
    gl.setRenderTarget(fbo);
    gl.render(scene, camera);
  }

  return fbo;
};

/**
 * Restores renderer and camera to previous state
 */
const restoreRenderState = (gl: WebGLRenderer, camera: PerspectiveCamera, state: RenderState) => {
  camera.aspect = state.prevAspect;
  camera.updateProjectionMatrix();
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
 * Converts canvas to requested output type.
 */
const canvasToOutput = async (
  canvas: HTMLCanvasElement,
  format: string,
  quality: number,
  returnType: ScreenshotOptions["returnType"] = "objectURL",
): Promise<HTMLCanvasElement | Blob | File | string> => {
  if (returnType === "canvas") {
    return canvas;
  }

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), `image/${format}`, quality),
  );

  switch (returnType) {
    case "blob":
      return blob;
    case "file":
      return new File([blob], `screenshot.${format}`, { type: `image/${format}` });
    case "objectURL":
    default:
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
    // Create pixel buffer
    const buffer = new Uint8Array(width * height * 4);

    // Configure camera for screenshot dimensions
    (camera as PerspectiveCamera).aspect = width / height;
    (camera as PerspectiveCamera).updateProjectionMatrix();

    // Call onBeforeScreenshot callback if provided
    if (options?.onBeforeScreenshot) {
      try {
        options.onBeforeScreenshot({
          gl,
          scene,
          camera,
          composer,
          options,
        });
      } catch (e) {
        console.error("onBeforeScreenshot error", e);
      }
    }

    // Render to FBO
    const fbo = renderToFBO(gl, scene, camera as PerspectiveCamera, width, height, composer);

    // Call onAfterScreenshot callback if provided
    if (options?.onAfterScreenshot) {
      try {
        options.onAfterScreenshot({
          gl,
          scene,
          camera,
          composer,
          options,
        });
      } catch (e) {
        console.error("onAfterScreenshot error", e);
      }
    }

    // Restore render state before readback.
    restoreRenderState(gl, camera as PerspectiveCamera, renderState);

    screenshotInProgress = true;
    try {
      await gl.readRenderTargetPixelsAsync(fbo, 0, 0, width, height, buffer);
    } finally {
      screenshotInProgress = false;
    }

    // Cleanup render target
    fbo.dispose();

    // Flip Y-axis
    flipY(buffer, width, height);

    // Convert to output format
    const canvas = pixelsToCanvas(buffer, width, height);
    return canvasToOutput(canvas, format, quality, options?.returnType);
  } catch (e) {
    // Attempt to restore state even on failure
    restoreRenderState(gl, camera as PerspectiveCamera, renderState);
    throw e;
  }
};
