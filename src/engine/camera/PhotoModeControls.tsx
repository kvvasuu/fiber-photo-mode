import { CameraControlsProps } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { RefObject, useLayoutEffect, useRef } from "react";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { UserCameraSnapshot } from "../../types";
import { createCameraAdapter } from "../../utils/cameraControllerAdapter";
import CameraController from "./CameraController";

type Props = CameraControlsProps & {
  controlsRef?: RefObject<any>;
};

export function PhotoModeControls({ controlsRef, ...props }: Props) {
  const controls = useThree((s) => s.controls);
  const camera = useThree((s) => s.camera);
  const adapterObject = controlsRef?.current || controls || camera;

  const photoModeOn = usePhotoModeStore((s) => s.photoModeOn);

  const snapshotRef = useRef<UserCameraSnapshot>(null);

  useLayoutEffect(() => {
    if (!photoModeOn) return;

    const adapter = createCameraAdapter(adapterObject);

    if (!adapter || snapshotRef.current) return;

    snapshotRef.current = adapter.snapshot();
    adapter.setEnabled(false);

    return () => {
      if (adapter && snapshotRef.current) {
        adapter.restore(snapshotRef.current);
      }
      snapshotRef.current = null;
    };
  }, [photoModeOn]);

  if (!photoModeOn) return null;

  return <CameraController snapshot={snapshotRef.current} {...props} />;
}
