import { Camera, OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { CameraAdapter, CameraControlsLike, OrbitControlsLike, UserCameraSnapshot } from "../types";

export class OrbitControlsAdapter implements CameraAdapter {
  constructor(public controls: OrbitControlsLike) {}

  snapshot(): UserCameraSnapshot {
    const camera = this.controls.object;

    return {
      type: "OrbitControls",
      enabled: this.controls.enabled,
      position: camera.position.clone(),
      target: this.controls.target.clone(),
      up: camera.up.clone(),
      zoom: camera.zoom,
      fov: camera instanceof PerspectiveCamera ? camera.fov : undefined,
    };
  }

  restore(snapshot: UserCameraSnapshot) {
    if (!snapshot) return;

    const camera = this.controls.object;

    this.controls.enabled = snapshot.enabled;
    this.controls.target.copy(snapshot.target);

    camera.position.copy(snapshot.position);

    camera.up.copy(snapshot.up);
    camera.zoom = snapshot.zoom;
    if (snapshot.fov !== undefined && camera instanceof PerspectiveCamera) camera.fov = snapshot.fov;
    camera.updateProjectionMatrix();

    this.controls.update?.();
  }

  setEnabled(enabled: boolean): void {
    this.controls.enabled = enabled;
  }
}

export class CameraControlsAdapter implements CameraAdapter {
  constructor(public controls: CameraControlsLike) {}

  snapshot(): UserCameraSnapshot {
    const camera = this.controls.camera as PerspectiveCamera;

    const position = new Vector3();
    const target = new Vector3();

    this.controls.getPosition(position);
    this.controls.getTarget(target);

    return {
      type: "CameraControls",
      enabled: this.controls.enabled,
      position,
      target,
      up: camera.up.clone(),
      zoom: camera.zoom,
      fov: camera.fov,
    };
  }

  restore(snapshot: UserCameraSnapshot) {
    if (!snapshot) return;

    const camera = this.controls.camera;

    this.controls.enabled = snapshot.enabled;

    camera.up.copy(snapshot.up);
    camera.zoom = snapshot.zoom;
    if (snapshot.fov !== undefined && camera instanceof PerspectiveCamera) camera.fov = snapshot.fov;
    camera.updateProjectionMatrix();

    this.controls.setLookAt?.(
      snapshot.position.x,
      snapshot.position.y,
      snapshot.position.z,
      snapshot.target.x,
      snapshot.target.y,
      snapshot.target.z,
      false,
    );
  }

  setEnabled(enabled: boolean): void {
    this.controls.enabled = enabled;
  }
}

export class StaticCameraAdapter implements CameraAdapter {
  constructor(public camera: PerspectiveCamera | OrthographicCamera) {}

  snapshot(): UserCameraSnapshot {
    const dir = new Vector3();
    this.camera.updateMatrixWorld(true);
    this.camera.getWorldDirection(dir);

    const target = this.camera.position.clone().add(dir.multiplyScalar(5));
    return {
      type: "StaticCamera",
      enabled: true,
      position: this.camera.position.clone(),
      target,
      up: this.camera.up.clone(),
      zoom: this.camera.zoom,
      fov: this.camera instanceof PerspectiveCamera ? this.camera.fov : undefined,
      quaternion: this.camera.quaternion.clone(),
    };
  }

  restore(snapshot: UserCameraSnapshot) {
    if (!snapshot) return;

    this.camera.position.copy(snapshot.position);
    this.camera.up.copy(snapshot.up);
    this.camera.zoom = snapshot.zoom;
    if (snapshot.quaternion) this.camera.quaternion.copy(snapshot.quaternion);

    if (this.camera instanceof PerspectiveCamera && snapshot.fov) this.camera.fov = snapshot.fov;
    this.camera.updateProjectionMatrix();
  }

  setEnabled(_: boolean) {
    // do nothing
  }
}

export function createCameraAdapter(object: Camera | any): CameraAdapter | null {
  if (object) {
    if (typeof object.getTarget === "function") {
      return new CameraControlsAdapter(object);
    }

    if (object.target && object.object) {
      return new OrbitControlsAdapter(object);
    }
  }

  if (object) {
    return new StaticCameraAdapter(object);
  }

  return null;
}
