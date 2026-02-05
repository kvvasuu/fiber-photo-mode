import { useCameraStore } from "../store/CameraStore";

/**
 * Hook to access and control photo mode camera
 * @returns Object with camera properties and control functions
 */
export function usePhotoModeCamera() {
  const aperture = useCameraStore((state) => state.aperture);
  const focalLength = useCameraStore((state) => state.focalLength);
  const focusDistance = useCameraStore((state) => state.focusDistance);

  const DOFEnabled = useCameraStore((state) => state.DOFEnabled);
  const autoFocus = useCameraStore((state) => state.autoFocus);

  const setAperture = useCameraStore((state) => state.setAperture);
  const setFocalLength = useCameraStore((state) => state.setFocalLength);
  const setFocusDistance = useCameraStore((state) => state.setFocusDistance);

  const toggleDOF = useCameraStore((state) => state.toggleDOF);
  const toggleAutoFocus = useCameraStore((state) => state.toggleAutoFocus);

  return {
    aperture,
    focalLength,
    focusDistance,
    DOFEnabled,
    autoFocus,
    setAperture,
    setFocalLength,
    setFocusDistance,
    toggleDOF,
    toggleAutoFocus,
  };
}
