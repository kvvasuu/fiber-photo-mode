import { PerspectiveCamera as PerspectiveCameraDrei } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef, useState } from "react";
import { PerspectiveCamera } from "three";
import { useCameraStore } from "../../store/CameraStore";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { UserControlsSnapshot } from "../../types";
import {
  fovToFocalLength,
  isSphericalControls,
  makeControlsSnapshot,
  restoreControlsSnapshot,
} from "../../utils/functions";
import PhotoModeControls from "./PhotoModeControls";

/**
 * CameraController Component
 * Handles switching between the user's users camera and a dedicated
 * Photo Mode camera. It also manages snapshotting and restoring user controls when entering/exiting Photo Mode.
 */
export function CameraController<T = unknown>({ controlsRef }: { controlsRef?: React.RefObject<T | null> }) {
  // Raw controls from R3F, could be undefined or any kind of controls
  const threeControls = useThree((s) => s.controls);
  const userControls = controlsRef?.current || threeControls;
  const camera = useThree((s) => s.camera);

  // Store reference to the current camera (users camera)
  const userCameraRef = useRef(camera);

  // Setter for the global R3F state

  const set = useThree((s) => s.set);

  // Only accept "spherical" camera controls compatible with orbit-like snapshots
  const controls = isSphericalControls(userControls) ? userControls : undefined;

  // Photo Mode toggle from global store
  const photoModeOn = usePhotoModeStore((s) => s.photoModeOn);
  const [photoCamera, setPhotoCamera] = useState<PerspectiveCamera | null>(null);

  // Snapshot of the controls to restore after exiting Photo Mode
  const controlsSnapshotRef = useRef<UserControlsSnapshot>(null);

  /**
   * useLayoutEffect for managing camera and controls lifecycles
   * - When entering Photo Mode: create new perspective camera and snapshot controls
   * - When exiting Photo Mode: restore original camera and controls
   */
  useLayoutEffect(() => {
    // Early return if Photo Mode is not active
    if (!photoModeOn) return;

    // Snapshot and disable user controls if they exist and are compatible
    if (controls) {
      controlsSnapshotRef.current = makeControlsSnapshot(controls);
      controls.enabled = false;
    }

    useCameraStore.setState({ focalLength: fovToFocalLength((camera as PerspectiveCamera)?.fov || 50) });

    /**
     * Cleanup function executed when:
     * - Photo Mode is turned off
     * - Component is unmounted
     */
    return () => {
      // Restore controls snapshot if available
      if (controls) {
        restoreControlsSnapshot(controls, controlsSnapshotRef.current);
      }

      // Restore original users camera
      if (userCameraRef.current) {
        set({ camera: userCameraRef.current });
      }

      useCameraStore.getState().resetCamera();
    };
  }, [photoModeOn]);

  if (!photoModeOn) return null;

  return (
    <>
      <PerspectiveCameraDrei
        makeDefault
        ref={setPhotoCamera}
        fov={(camera as PerspectiveCamera)?.fov || 50}
        near={0.01}
        far={2000}
        name="PhotoCamera"
      />
      {photoCamera && <PhotoModeControls controlsSnapshot={controlsSnapshotRef.current} />}
    </>
  );
}
