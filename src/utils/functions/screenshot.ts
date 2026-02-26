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
    renderToFBO(gl, scene, camera as PerspectiveCamera, fbo, composer);

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

    // Read pixels from FBO
    gl.readRenderTargetPixels(fbo, 0, 0, outputWidth, outputHeight, buffer);

    // Restore previous render state
    restoreRenderState(gl, camera as PerspectiveCamera, renderState);

    // Cleanup render target
    fbo.dispose();

    // Flip Y-axis
    flipY(buffer, outputWidth, outputHeight);

    // Convert to output format
    const canvas = pixelsToCanvas(buffer, outputWidth, outputHeight);
    return canvasToOutput(canvas, format, quality, options?.returnType);
  } catch (e) {
    // Attempt to restore state even on failure
    restoreRenderState(gl, camera as PerspectiveCamera, renderState);
    throw e;
  }
};
