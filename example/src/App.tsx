import { CameraControls, Environment, Loader, Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { AutoFocus, PhotoMode, PhotoModeControls, usePhotoMode, usePhotoModeCamera } from "fiber-photo-mode";
import { Suspense, useEffect, useRef, useState } from "react";
import Overlay from "./components/Overlay";
import { Scene } from "./components/Scene";

export default function App() {
  const controlsRef = useRef<CameraControls>(null);

  const [showOverlay, setShowOverlay] = useState(false);

  const { togglePhotoMode } = usePhotoMode();
  const { setFocalLength } = usePhotoModeCamera();

  useEffect(() => {
    togglePhotoMode(true);
    setFocalLength(14);

    if (!controlsRef.current) return;
    controlsRef.current.enabled = false;

    controlsRef.current.setLookAt(-7, 5, -8, -1, 1.3, 2, false);
    requestAnimationFrame(() => {
      controlsRef?.current?.setLookAt(-2.5, 1.4, -1.2, -1.2, 2, 2, true);
    });

    setTimeout(() => {
      setShowOverlay(true);
      if (controlsRef.current) controlsRef.current.enabled = true;
    }, 1700);
  }, [setFocalLength, togglePhotoMode, controlsRef.current]);

  return (
    <>
      <Canvas gl={{ powerPreference: "high-performance" }} camera={{ fov: 80, far: 100 }}>
        <Suspense fallback={null}>
          <PhotoMode />
          <AutoFocus initialAperture={18} initialAutoFocus={true} initialDOFEnabled={true} />
          <PhotoModeControls makeDefault ref={controlsRef} smoothTime={0.7} maxDistance={20} />

          <Scene />

          <Environment
            preset="sunset"
            background
            blur={0.5}
            frames={1}
            environmentIntensity={1.5}
            backgroundIntensity={1}
            backgroundRotation={[0, -Math.PI / 1.3, 0]}
          />

          <Preload all />
        </Suspense>
      </Canvas>
      <Loader />
      <Overlay show={showOverlay} />
    </>
  );
}
