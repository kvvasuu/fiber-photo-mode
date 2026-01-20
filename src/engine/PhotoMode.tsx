/**
 * PhotoMode Component
 * Initializes the screenshot capture system within Three.js canvas
 * Must be placed inside <Canvas> component
 */

import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { usePhotoModeStore } from "../store/photoModeStore";
import { takeScreenshot } from "../utils/functions";

/**
 * PhotoMode component - Initialize in your Three.js canvas
 * Registers screenshot function and rendering context
 * Minimal setup - WebGLRenderTarget is created per screenshot internally
 */
export function PhotoMode() {
  const { gl, scene, camera } = useThree();
  const composer = usePhotoModeStore((s) => s.composer);

  const setRenderer = usePhotoModeStore((s) => s.setRenderer);
  const setScene = usePhotoModeStore((s) => s.setScene);
  const setCamera = usePhotoModeStore((s) => s.setCamera);
  const setTakeScreenshot = usePhotoModeStore((s) => s.setTakeScreenshot);

  useLayoutEffect(() => {
    // Register rendering context
    setRenderer(gl);
    setScene(scene);
    setCamera(camera);

    // Register screenshot function as closure
    setTakeScreenshot(takeScreenshot(gl, scene, camera, composer || undefined));
  }, [gl, scene, camera, composer, setRenderer, setScene, setCamera, setTakeScreenshot]);

  return null;
}
