import { shallow } from "zustand/shallow";
import { CameraStore, useCameraStore } from "../store/CameraStore";

/**
 * Hook to access and control photo mode camera.
 *
 * Accepts an optional selector (like `useThree`) so consumers that only need e.g. a
 * single setter can subscribe to just that, instead of re-rendering on every camera
 * field change: `usePhotoModeCamera((state) => state.setFocalLength)`.
 *
 * @returns Selected slice of the camera store (the whole store if no selector is given)
 */
export function usePhotoModeCamera<T = CameraStore>(
  selector: (state: CameraStore) => T = (state) => state as unknown as T,
) {
  return useCameraStore(selector, shallow);
}
