import { Camera } from "@react-three/fiber";
import { EffectComposer } from "postprocessing";
import { Quaternion, Scene, Vector3, WebGLRenderer } from "three";

/**
 * Configuration options for screenshot capture
 */
export type ScreenshotOptions = {
  /** Target image width in pixels */
  width?: number;
  /** Target image height in pixels */
  height?: number;
  /** Image format (JPEG, PNG, WebP, AVIF) */
  format?: "jpeg" | "png" | "webp" | "avif";
  /** Compression quality (0-1) */
  quality?: number;
  /** Return type of screenshot output */
  returnType?: "canvas" | "blob" | "file" | "objectURL";
  /** Callback executed before screenshot rendering. Allows custom modifications to gl, scene, camera, composer, or options */
  onBeforeScreenshot?: (ctx: ScreenshotContext) => void;
  /** Callback executed after screenshot rendering. Allows cleanup or restoration of changes made in beforeScreenshot */
  onAfterScreenshot?: (ctx: ScreenshotContext) => void;
};

export interface ScreenshotContext {
  gl: WebGLRenderer;
  scene: Scene;
  camera: Camera;
  composer?: EffectComposer;
  options: ScreenshotOptions;
}

/**
 * Screenshot function signature
 * Takes Three.js rendering context and returns a function that captures screenshots
 * WebGLRenderTarget is created and disposed internally per screenshot
 */
export type TakeScreenshotFn = (
  gl: WebGLRenderer,
  scene: Scene,
  camera: Camera,
  composer?: EffectComposer,
) => (options?: ScreenshotOptions) => Promise<string | File | Blob | HTMLCanvasElement>;

/**
 * PhotoModeComposer effects settings
 */
export type EffectKey =
  | "brightness"
  | "contrast"
  | "hue"
  | "saturation"
  | "vignette"
  | "chromaticAberration"
  | "bloom"
  | "grain";

export type EffectName =
  | "brightnessContrast"
  | "hueSaturation"
  | "vignette"
  | "chromaticAberration"
  | "bloom"
  | "grain";

export type EffectDefinition = {
  label: string;
  min: number;
  max: number;
  default: number;
  effectMin?: number;
  effectMax?: number;
};

export type UserCameraSnapshot = {
  enabled: boolean;
  up: Vector3;
  quaternion: Quaternion;
  zoom: number | null;
  fov: number | null;
};
