import { CameraControls, CameraControlsProps } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { forwardRef, useLayoutEffect, useRef } from "react";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { UserCameraSnapshot } from "../../types";
import { makeCameraSnapshot, restoreCameraSnapshot } from "../../utils/functions";
import CameraController from "./CameraController";

export const PhotoModeControls = forwardRef<CameraControls, CameraControlsProps>(function PhotoModeControls(
  { ...props },
  ref,
) {
  const camera = useThree((s) => s.camera);

  const photoModeOn = usePhotoModeStore((s) => s.photoModeOn);

  const snapshotRef = useRef<UserCameraSnapshot>(null);

  useLayoutEffect(() => {
    if (!photoModeOn || snapshotRef.current) return;

    snapshotRef.current = makeCameraSnapshot(camera);

    return () => {
      if (snapshotRef.current) {
        restoreCameraSnapshot(camera, snapshotRef.current);
      }
      snapshotRef.current = null;
    };
  }, [photoModeOn]);

  return <CameraController ref={ref} snapshot={snapshotRef.current} {...props} />;
});
