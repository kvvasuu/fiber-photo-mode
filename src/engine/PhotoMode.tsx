import { useThree } from "@react-three/fiber";
import { EffectComposerProps } from "@react-three/postprocessing";
import { ReactNode, useLayoutEffect } from "react";
import { usePhotoModeEffectsStore } from "../store/EffectsStore";
import { usePhotoModeStore } from "../store/PhotoModeStore";
import { EffectName } from "../types";
import { takeScreenshot } from "../utils/functions";
import { Composer } from "./effects/Composer";

/**
 * PhotoMode component - Initialize in your Three.js canvas
 * Registers screenshot function and rendering context
 * Must be placed inside <Canvas> component
 */

type PhotoModeProps = Omit<EffectComposerProps, "children"> & {
  enabledEffects?: Partial<Record<EffectName, boolean>>;
  disableEvents?: boolean;
  children?: ReactNode;
};
export function PhotoMode({ enabledEffects, disableEvents = true, children, ...props }: PhotoModeProps) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const events = useThree((state) => state.events);

  const composer = usePhotoModeStore((state) => state.composer);
  const photoModeOn = usePhotoModeStore((state) => state.photoModeOn);

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

  useLayoutEffect(() => {
    if (enabledEffects)
      usePhotoModeEffectsStore.setState((state) => {
        return { enabledEffects: { ...state.enabledEffects, ...enabledEffects } };
      });
  }, [enabledEffects]);

  useLayoutEffect(() => {
    if (!events) return;

    const prev = events.enabled;

    if (photoModeOn) {
      events.enabled = !disableEvents;
    }

    return () => {
      events.enabled = prev;
    };
  }, [photoModeOn, disableEvents, events]);

  return <Composer {...props}>{children}</Composer>;
}
