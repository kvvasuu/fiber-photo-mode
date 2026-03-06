import { CameraControls, CameraControlsProps } from "@react-three/drei";
import { degToRad } from "maath/misc";
import { forwardRef, RefObject, useEffect, useImperativeHandle, useRef } from "react";
import { PerspectiveCamera } from "three";
import { useCameraStore } from "../../store/CameraStore";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { UserCameraSnapshot } from "../../types";
import { MAX_ZOOM } from "../../utils/constants";
import { focalLengthToZoom, setCameraRoll } from "../../utils/functions";

type Props = CameraControlsProps & {
  snapshot: RefObject<UserCameraSnapshot | null>;
};

/**
 * PhotoModeControls Component
 * Wraps a CameraControls instance for Photo Mode
 *
 * @param snapshot - Snapshot of user controls/camera used to initialize the Photo Mode camera position.
 */
const CameraController = forwardRef<CameraControls, Props>(function CameraController(
  { snapshot, ...props },
  externalRef,
) {
  const internalRef = useRef<CameraControls>(null);

  useImperativeHandle(externalRef, () => internalRef.current!);

  const focalLength = useCameraStore((state) => state.focalLength);
  const rotation = useCameraStore((state) => state.rotation);

  const photoModeOn = usePhotoModeStore((state) => state.photoModeOn);

  useEffect(() => {
    if (!internalRef.current || !snapshot.current || !photoModeOn) return;

    const zoom = focalLengthToZoom(snapshot?.current.fov || 50, focalLength);
    internalRef.current.zoomTo(zoom, true);
  }, [focalLength, snapshot, photoModeOn]);

  useEffect(() => {
    if (!internalRef.current || !photoModeOn) return;

    const camera = internalRef.current.camera as PerspectiveCamera;
    setCameraRoll(camera, degToRad(rotation));
  }, [rotation, photoModeOn]);

  return <CameraControls ref={internalRef} maxZoom={MAX_ZOOM} {...props} />;
});

export default CameraController;
