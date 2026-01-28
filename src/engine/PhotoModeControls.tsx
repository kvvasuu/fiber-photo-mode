import { CameraControls } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";
import { UserControlsSnapshot } from "../types";

interface Props {
  controlsSnapshot: UserControlsSnapshot | null;
}

/**
 * PhotoModeControls Component
 * Wraps a CameraControls instance for Photo Mode, allowing
 * smooth manipulation of the camera based on a previously stored controls snapshot.
 *
 * @param controlsSnapshot - Optional snapshot of user controls from gameplay,
 *                           used to initialize the Photo Mode camera position.
 */
export default function PhotoModeControls({ controlsSnapshot }: Props) {
  // Ref to access the underlying CameraControls instance
  const ref = useRef<CameraControls>(null);

  /**
   * When the controlsSnapshot changes (e.g., when Photo Mode is entered),
   * immediately set the CameraControls to match the snapshot.
   */
  useLayoutEffect(() => {
    // Early return if no snapshot exists or ref is not mounted yet
    if (!controlsSnapshot || !ref.current) return;

    ref.current.setLookAt(
      controlsSnapshot.position.x,
      controlsSnapshot.position.y,
      controlsSnapshot.position.z,
      controlsSnapshot.target.x,
      controlsSnapshot.target.y,
      controlsSnapshot.target.z,
      false, // disable smooth animation for instant positioning
    );
  }, [controlsSnapshot]);

  return <CameraControls ref={ref} smoothTime={0.6} />;
}
