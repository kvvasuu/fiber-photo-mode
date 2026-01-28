import { createWithEqualityFn } from "zustand/traditional";

type CameraStore = {
  fov: number;
};

const equalityFn = <T>(a: T, b: T) => a === b;

export const useCameraStore = createWithEqualityFn<CameraStore>(
  (set) => ({
    fov: 50,
  }),
  equalityFn,
);
