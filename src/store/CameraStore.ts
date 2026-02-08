import { createWithEqualityFn } from "zustand/traditional";
import { MAX_APERTURE, MAX_FOCAL_LENGTH, MIN_APERTURE, MIN_FOCAL_LENGTH } from "../utils/constants";

type CameraStore = {
  focalLength: number; // mm (24, 35, 50, 85, 135, 200)
  aperture: number; // f-stop (1.4, 2.8, 5.6, 8, 11, 16, 22)
  focusDistance: number;

  DOFEnabled: boolean;
  autoFocus: boolean;

  rotation: number; // -180 to 180

  setAperture: (aperture: number) => void;
  setFocalLength: (focalLength: number) => void;
  setFocusDistance: (focalDistance: number) => void;

  setRotation: (rotation: number) => void;

  toggleDOF: (value?: boolean) => void;
  toggleAutoFocus: (value?: boolean) => void;

  resetCamera: () => void;
};

const equalityFn = <T>(a: T, b: T) => a === b;

export const useCameraStore = createWithEqualityFn<CameraStore>(
  (set, _get, store) => ({
    focalLength: 50,
    aperture: 2.8,
    focusDistance: 5,

    autoFocus: true,
    DOFEnabled: true,

    rotation: 0,

    setAperture: (aperture) => {
      const clamped = Math.min(MAX_APERTURE, Math.max(MIN_APERTURE, aperture));
      set({ aperture: clamped });
    },
    setFocalLength: (focalLength) => {
      const clamped = Math.min(MAX_FOCAL_LENGTH, Math.max(MIN_FOCAL_LENGTH, focalLength));
      set({ focalLength: clamped });
    },
    setFocusDistance: (focusDistance) => {
      set({ focusDistance });
    },

    setRotation: (rotation) => {
      set({ rotation });
    },

    toggleDOF: (value?: boolean) => {
      set((state) => ({
        DOFEnabled: value ?? !state.DOFEnabled,
      }));
    },
    toggleAutoFocus: (value?: boolean) => {
      set((state) => ({
        autoFocus: value ?? !state.autoFocus,
      }));
    },

    resetCamera: () =>
      set(() => ({
        focalLength: store.getInitialState().focalLength,
        aperture: store.getInitialState().aperture,
        focusDistance: store.getInitialState().focusDistance,
      })),
  }),
  equalityFn,
);
