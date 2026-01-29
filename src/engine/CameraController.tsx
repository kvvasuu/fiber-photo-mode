import { Camera, useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import { PerspectiveCamera } from "three";
import { usePhotoModeStore } from "../store/PhotoModeStore";
import { UserControlsSnapshot } from "../types";
import { isSphericalControls, makeControlsSnapshot, restoreControlsSnapshot } from "../utils/functions";
import PhotoModeCamera from "./PhotoModeCamera";
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

  // Only accept "spherical" camera controls compatible with orbit-like snapshots
  const controls = isSphericalControls(userControls) ? userControls : undefined;

  // Active camera from R3F — used for rendering PhotoModeCamera
  const activeCamera = useThree((s) => s.camera);

  // Getter and setter for the global R3F state
  const get = useThree((s) => s.get);
  const set = useThree((s) => s.set);

  // Photo Mode toggle from global store
  const photoModeOn = usePhotoModeStore((s) => s.photoModeOn);

  // References to store runtime camera instances
  const usersCameraRef = useRef<Camera>(null); // Original users camera
  const photoCameraRef = useRef<PerspectiveCamera>(null); // Dedicated Photo Mode camera

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

    // Store reference to the current camera (users camera)
    usersCameraRef.current = get().camera;

    // Snapshot and disable user controls if they exist and are compatible
    if (controls) {
      controlsSnapshotRef.current = makeControlsSnapshot(controls);
      controls.enabled = false;
    }

    // Determine if the original camera is a PerspectiveCamera
    const base = usersCameraRef.current;
    const isPerspective = (base as PerspectiveCamera).isPerspectiveCamera;

    // Create a dedicated Photo Mode camera
    const photoCam = new PerspectiveCamera(
      isPerspective ? (base as PerspectiveCamera).fov : 50, // Use original FOV or default
      isPerspective ? (base as PerspectiveCamera).aspect : window.innerWidth / window.innerHeight, // Aspect ratio
      0.01, // Near plane
      2000, // Far plane
    );

    // Copy transform from the original camera
    photoCam.position.copy(base.position);
    photoCam.quaternion.copy(base.quaternion);

    // Store reference and set as active camera in R3F
    photoCameraRef.current = photoCam;
    set({ camera: photoCam });

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
      if (usersCameraRef.current) {
        set({ camera: usersCameraRef.current });
      }

      // Clear Photo Mode camera reference
      photoCameraRef.current = null;
    };
  }, [photoModeOn]);

  if (!photoModeOn) return null;

  return (
    <>
      <PhotoModeControls controlsSnapshot={controlsSnapshotRef.current} />
      <PhotoModeCamera camera={activeCamera} />
    </>
  );
}
