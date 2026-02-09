import { CameraControls, CameraControlsProps } from "@react-three/drei";
import { Camera } from "@react-three/fiber";
import { degToRad } from "maath/misc";
import { useEffect, useLayoutEffect, useRef } from "react";
import { PerspectiveCamera } from "three";
import { useCameraStore } from "../../store/CameraStore";
import { UserControlsSnapshot } from "../../types";
import { MAX_ZOOM } from "../../utils/constants";
import { focalLengthToZoom, setCameraRoll } from "../../utils/functions";

type Props = CameraControlsProps & {
  controlsSnapshot?: UserControlsSnapshot | null;
  userCamera?: Camera;
};

/**
 * PhotoModeControls Component
 * Wraps a CameraControls instance for Photo Mode, allowing
 * smooth manipulation of the camera based on a previously stored controls snapshot.
 *
 * @param controlsSnapshot - Optional snapshot of user controls from gameplay,
 *                           used to initialize the Photo Mode camera position.
 */
export default function PhotoModeControls({ controlsSnapshot, userCamera, ...props }: Props) {
  // Ref to access the underlying CameraControls instance
  const ref = useRef<CameraControls>(null);

  const initialFov = useRef<number>(null);
  const focalLength = useCameraStore((state) => state.focalLength);
  const rotation = useCameraStore((state) => state.rotation);

  /**
   * When the controlsSnapshot changes (e.g., when Photo Mode is entered),
   * immediately set the CameraControls to match the snapshot.
   */
  useLayoutEffect(() => {
    if (!ref.current) return;

    if (!initialFov.current)
      initialFov.current = controlsSnapshot?.fov || (ref.current.camera as PerspectiveCamera).fov || 50;

    const pos = controlsSnapshot?.position ?? userCamera?.position;

    ref.current.setLookAt(
      pos?.x ?? 0,
      pos?.y ?? 0,
      pos?.z ?? 0,
      controlsSnapshot?.target?.x ?? 0,
      controlsSnapshot?.target?.y ?? 0,
      controlsSnapshot?.target?.z ?? 0,
      false, // disable smooth animation for instant positioning
    );
  }, [controlsSnapshot]);

  useEffect(() => {
    if (!ref.current || !initialFov.current) return;

    const zoom = focalLengthToZoom(initialFov.current, focalLength);

    ref.current.zoomTo(zoom, true);
  }, [focalLength]);

  useEffect(() => {
    if (!ref.current) return;

    const camera = ref.current.camera as PerspectiveCamera;
    setCameraRoll(camera, degToRad(rotation));
  }, [rotation]);

  return <CameraControls ref={ref} smoothTime={0.25} maxZoom={MAX_ZOOM} {...props} />;
}
