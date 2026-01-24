import { Camera } from "@react-three/fiber";
import { EffectComposer } from "postprocessing";
import { Scene, WebGLRenderer } from "three";

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
  /** Return as File instead of DataURL */
  toFile?: boolean;
};

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
) => (options?: ScreenshotOptions) => Promise<string | File>;

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
