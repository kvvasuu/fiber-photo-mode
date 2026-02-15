import { CameraControls, CameraControlsProps } from "@react-three/drei";
import { degToRad } from "maath/misc";
import { useEffect, useLayoutEffect, useRef } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { useCameraStore } from "../../store/CameraStore";
import { UserCameraSnapshot } from "../../types";
import { MAX_ZOOM } from "../../utils/constants";
import { focalLengthToZoom, setCameraRoll } from "../../utils/functions";

type Props = CameraControlsProps & {
  snapshot: UserCameraSnapshot | null;
};

/**
 * PhotoModeControls Component
 * Wraps a CameraControls instance for Photo Mode
 *
 * @param snapshot - Snapshot of user controls/camera used to initialize the Photo Mode camera position.
 */
export default function CameraController({ snapshot, ...props }: Props) {
  const ref = useRef<CameraControls>(null);

  const focalLength = useCameraStore((state) => state.focalLength);
  const rotation = useCameraStore((state) => state.rotation);

  useLayoutEffect(() => {
    if (!ref.current || !snapshot) return;

    let target: Vector3 = snapshot.target;

    if (snapshot.type === "StaticCamera" && snapshot.quaternion) {
      const dir = new Vector3(0, 0, -1).applyQuaternion(snapshot.quaternion);
      target = snapshot.position.clone().add(dir.multiplyScalar(5));
    }

    ref.current.setLookAt(
      snapshot.position.x,
      snapshot.position.y,
      snapshot.position.z,
      target.x,
      target.y,
      target.z,
      false, // disable smooth animation for instant positioning
    );
  }, [snapshot]);

  useEffect(() => {
    if (!ref.current) return;

    const zoom = focalLengthToZoom(snapshot?.fov || 50, focalLength);

    ref.current.zoomTo(zoom, true);
  }, [focalLength]);

  useEffect(() => {
    if (!ref.current) return;

    const camera = ref.current.camera as PerspectiveCamera;
    setCameraRoll(camera, degToRad(rotation));
  }, [rotation]);

  return <CameraControls makeDefault ref={ref} maxZoom={MAX_ZOOM} {...props} />;
}
