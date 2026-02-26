import { Camera } from "@react-three/fiber";
import { EffectComposer } from "postprocessing";
import { EventDispatcher, Quaternion, Scene, Vector3, WebGLRenderer } from "three";

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

export interface SphericalCameraControls {
  enabled: boolean;
  target: Vector3;
  object: {
    position: Vector3;
    fov: number;
    updateProjectionMatrix(): void;
  };

  getDistance(): number;
  getAzimuthalAngle(): number;
  getPolarAngle(): number;

  update(): void;
}

export type UserCameraSnapshot = Partial<EventDispatcher> & {
  type: "OrbitControls" | "CameraControls" | "StaticCamera";
  position: Vector3;
  zoom: number;
  up: Vector3;
  target: Vector3;
  enabled: boolean;
  fov?: number;
  quaternion?: Quaternion;
};

export interface CameraAdapter {
  snapshot(): UserCameraSnapshot | null;
  restore(snapshot: UserCameraSnapshot): void;
  setEnabled(enabled: boolean): void;
}

export type OrbitControlsLike = {
  enabled: boolean;
  object: Camera;
  target: Vector3;
  getDistance: () => number;
  getAzimuthalAngle: () => number;
  getPolarAngle: () => number;
  update(): void;
};

export type CameraControlsLike = {
  enabled: boolean;
  camera: Camera;
  getPosition(out: Vector3): void;
  getTarget(out: Vector3): void;
  setLookAt(
    positionX: number,
    positionY: number,
    positionZ: number,
    targetX: number,
    targetY: number,
    targetZ: number,
    enableTransition?: boolean,
  ): Promise<void>;
};
