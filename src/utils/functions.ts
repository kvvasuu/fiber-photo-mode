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
import { TakeScreenshotFn } from "../types";
import { CapturePass } from "./CapturePass";

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
    const prevSize = new Vector2();
    gl.getSize(prevSize);

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

      composer.setSize(prevSize.x, prevSize.y, false);
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
  gl.setSize(state.prevSize.x, state.prevSize.y, false);
  gl.setPixelRatio(state.prevPixelRatio);
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
  const quality = options?.quality ?? 1;

  // Create render target for this screenshot
  const fbo = createRenderTarget(gl, width, height);

  // Ensure pixel ratio is 1 for consistent results
  gl.setPixelRatio(1);

  // Configure camera
  configureCamera(camera as PerspectiveCamera, width, height);

  const buffer = new Uint8Array(width * height * 4);

  // Render to FBO
  renderToFBO(gl, scene, camera as PerspectiveCamera, fbo, composer);

  // Read pixels from FBO
  gl.readRenderTargetPixels(fbo, 0, 0, width, height, buffer);

  // Cleanup render target
  fbo.dispose();

  // Flip Y-axis
  flipY(buffer, width, height);

  // Restore previous state
  restoreRenderState(gl, camera as PerspectiveCamera, renderState);

  // Convert to output format
  const canvas = pixelsToCanvas(buffer, width, height);
  return canvasToOutput(canvas, format, quality, options?.toFile);
};
