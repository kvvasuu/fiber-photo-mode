import { createWithEqualityFn } from "zustand/traditional";

type CameraStore = {
  fov: number;

  DOFEnabled: boolean;
  focusDistance: number;
  autoFocus: boolean;
};

const equalityFn = <T>(a: T, b: T) => a === b;

export const useCameraStore = createWithEqualityFn<CameraStore>(
  (set) => ({
    fov: 50,

    DOFEnabled: true,
    focusDistance: 5,
    autoFocus: true,
  }),
  equalityFn,
);
