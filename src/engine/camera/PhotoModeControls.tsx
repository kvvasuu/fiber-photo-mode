import { CameraControls, CameraControlsProps } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from "react";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { UserCameraSnapshot } from "../../types";
import { makeCameraSnapshot, restoreCameraSnapshot } from "../../utils/functions";
import CameraController from "./CameraController";

type Props = CameraControlsProps & { restoreOnClose?: boolean; animate?: boolean };

export const PhotoModeControls = forwardRef<CameraControls, Props>(function PhotoModeControls(
  { restoreOnClose = true, animate = true, ...props },
  ref,
) {
  const camera = useThree((s) => s.camera);

  const photoModeOn = usePhotoModeStore((s) => s.photoModeOn);

  const snapshotRef = useRef<UserCameraSnapshot>(null);
  const controlsRef = useRef<CameraControls>(null);

  useImperativeHandle(ref, () => controlsRef.current!, []);

  const baseZoomRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (photoModeOn) {
      snapshotRef.current = makeCameraSnapshot(camera);

      if (baseZoomRef.current == null) {
        baseZoomRef.current = camera.zoom;
      }
    } else if (restoreOnClose) {
      if (snapshotRef.current) {
        restoreCameraSnapshot(camera, snapshotRef.current);
        snapshotRef.current = null;
      }

      if (controlsRef.current && baseZoomRef.current != null) {
        controlsRef.current.zoomTo(baseZoomRef.current, animate).then(() => {
          if (!usePhotoModeStore.getState().photoModeOn) {
            baseZoomRef.current = null;
          }
        });
      }
    }
  }, [photoModeOn, restoreOnClose]);

  return <CameraController ref={controlsRef} snapshot={snapshotRef} {...props} />;
});
