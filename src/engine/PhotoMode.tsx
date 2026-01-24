import { useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect } from "react";
import { usePhotoModeEffectsStore } from "../store/photoModeEffectsStore";
import { usePhotoModeStore } from "../store/photoModeStore";
import { EffectName } from "../types";
import { takeScreenshot } from "../utils/functions";
import { PhotoModeComposer } from "./PhotoModeComposer";

/**
 * PhotoMode component - Initialize in your Three.js canvas
 * Registers screenshot function and rendering context
 * Must be placed inside <Canvas> component
 */

interface PhotoModeProps {
  children?: React.ReactNode;
  enabledEffects?: Partial<Record<EffectName, boolean>>;
}
export function PhotoMode({ children, enabledEffects }: PhotoModeProps) {
  const { gl, scene, camera } = useThree();
  const composer = usePhotoModeStore((state) => state.composer);

  const setRenderer = usePhotoModeStore((state) => state.setRenderer);
  const setScene = usePhotoModeStore((state) => state.setScene);
  const setCamera = usePhotoModeStore((state) => state.setCamera);
  const setTakeScreenshot = usePhotoModeStore((state) => state.setTakeScreenshot);

  useLayoutEffect(() => {
    // Register rendering context
    setRenderer(gl);
    setScene(scene);
    setCamera(camera);

    // Register screenshot function as closure
    setTakeScreenshot(takeScreenshot(gl, scene, camera, composer || undefined));
  }, [gl, scene, camera, composer, setRenderer, setScene, setCamera, setTakeScreenshot]);

  useEffect(() => {
    if (enabledEffects)
      usePhotoModeEffectsStore.setState((state) => {
        return { enabledEffects: { ...state.enabledEffects, ...enabledEffects } };
      });
  }, [enabledEffects]);

  return <PhotoModeComposer>{children}</PhotoModeComposer>;
}
