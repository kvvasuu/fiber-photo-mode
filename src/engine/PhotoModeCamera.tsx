import { useLayoutEffect } from "react";
import { OrthographicCamera, PerspectiveCamera } from "three";

interface Props {
  camera: PerspectiveCamera | OrthographicCamera;
}

export default function PhotoModeCamera({ camera }: Props) {
  useLayoutEffect(() => {
    if (!(camera as PerspectiveCamera).isPerspectiveCamera) return;

    setTimeout(() => {
      // (camera as PerspectiveCamera).setFocalLength(70);
    }, 3000);
  }, [camera]);

  return null;
}
