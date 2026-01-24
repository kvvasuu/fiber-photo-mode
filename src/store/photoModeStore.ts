/**
 * PhotoMode Store
 * Central state management using Zustand
 * Manages rendering context, composition, and screenshot functionality
 */

import { EffectComposer as EffectComposerImpl } from "postprocessing";
import { Camera, Scene, WebGLRenderer } from "three";
import { createWithEqualityFn } from "zustand/traditional";
import { ScreenshotOptions } from "../types";

/**
 * Internal state of PhotoMode store
 */
type PhotoModeInternalStore = {
  /** Photo mode active state */
  photoModeOn: boolean;

  /** WebGL Renderer instance */
  renderer?: WebGLRenderer;
  /** Three.js Scene */
  scene?: Scene;
  /** Three.js Camera */
  camera?: Camera;
  /** EffectComposer for post-processing (optional) */
  composer?: EffectComposerImpl | null;

  /** Screenshot capture function */
  takeScreenshot?: (options?: ScreenshotOptions) => Promise<string | File>;
  /** Toggle photo mode state */
  togglePhotoMode: (value?: boolean) => void;

  // Setter functions
  /** Register WebGL renderer */
  setRenderer: (r: WebGLRenderer) => void;
  /** Register Scene */
  setScene: (s: Scene) => void;
  /** Register Camera */
  setCamera: (c: Camera) => void;
  /** Register EffectComposer */
  setComposer: (c: EffectComposerImpl | null) => void;
  /** Register screenshot function */
  setTakeScreenshot: (fn: (options?: ScreenshotOptions) => Promise<string | File>) => void;
};

// Equality check to prevent unnecessary re-renders
const equalityFn = <T>(a: T, b: T) => a === b;

/**
 * PhotoMode Zustand store
 * Manages all state required for screenshot capture
 */
export const usePhotoModeStore = createWithEqualityFn<PhotoModeInternalStore>(
  (set) => ({
    photoModeOn: true,

    renderer: undefined,
    scene: undefined,
    camera: undefined,
    composer: undefined,
    takeScreenshot: undefined,

    /**
     * Toggle photo mode state
     * @param value - Explicit boolean or undefined to toggle
     */
    togglePhotoMode: (value) =>
      set((state) => {
        if (value !== undefined) {
          return { photoModeOn: value };
        } else {
          return { photoModeOn: !state.photoModeOn };
        }
      }),

    setRenderer: (r) => set({ renderer: r }),
    setScene: (s) => set({ scene: s }),
    setCamera: (c) => set({ camera: c }),
    setComposer: (c) => set({ composer: c }),
    setTakeScreenshot: (fn) => set({ takeScreenshot: fn }),
  }),
  equalityFn,
);
