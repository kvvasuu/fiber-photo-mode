import { CameraControls, Loader, Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { AutoFocus, PhotoMode, PhotoModeControls, usePhotoMode, usePhotoModeCamera } from "fiber-photo-mode";
import { Suspense, useEffect, useRef, useState } from "react";
import AnimateEnvironment from "./components/AnimatedEnvironment";
import Overlay from "./components/Overlay";
import { Scene } from "./components/Scene";

export default function App() {
  const controlsRef = useRef<CameraControls>(null);

  const [showOverlay, setShowOverlay] = useState(false);

  const togglePhotoMode = usePhotoMode((state) => state.togglePhotoMode);
  const setFocalLength = usePhotoModeCamera((state) => state.setFocalLength);

  useEffect(() => {
    setFocalLength(14);

    if (!controlsRef.current) return;
    controlsRef.current.enabled = false;
    controlsRef.current.setLookAt(-7, 5, -8, -1, 1.3, 2, false);
  }, [setFocalLength, controlsRef.current]);

  const onSceneLoad = () => {
    requestAnimationFrame(() => {
      controlsRef?.current?.setLookAt(-2.5, 1.4, -1.2, -1.2, 2, 2, true).then(() => {
        if (controlsRef.current) {
          controlsRef.current.smoothTime = 0.2;
          controlsRef.current.enabled = true;
        }
      });
      togglePhotoMode(true);
    });

    setTimeout(() => {
      setShowOverlay(true);
    }, 1700);
  };

  return (
    <>
      <Canvas gl={{ powerPreference: "high-performance" }} camera={{ position: [-7, 5, -8], fov: 80, far: 100 }}>
        <PhotoModeControls makeDefault restoreOnClose ref={controlsRef} smoothTime={0.7} maxDistance={20} />
        <PhotoMode enabledEffects={{ bloom: true }} />
        <AutoFocus initialAperture={18} initialDOFEnabled={true} initialAutoFocus={true} />

        <Suspense fallback={null}>
          <Scene onLoaded={onSceneLoad} />

          <AnimateEnvironment />

          <Preload all />
        </Suspense>
      </Canvas>
      <Loader />
      <Overlay show={showOverlay} />
    </>
  );
}
