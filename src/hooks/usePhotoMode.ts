import { useCallback } from "react";
import { shallow } from "zustand/shallow";
import { usePhotoModeStore } from "../store/PhotoModeStore";
import { ScreenshotOptions } from "../types";

export type UsePhotoModeReturn = {
  /** Captures a screenshot with configured options */
  takeScreenshot: (options?: ScreenshotOptions) => Promise<string | File | Blob | HTMLCanvasElement | null>;
  /** Current photo mode state */
  photoModeOn: boolean;
  /** Toggle photo mode on/off */
  togglePhotoMode: (value?: boolean) => void;
};

/**
 * Hook to manage photo mode functionality.
 *
 * Accepts an optional selector (like `useThree`) so consumers that only need e.g.
 * `togglePhotoMode` can subscribe to just that, instead of re-rendering on every
 * photo mode state change: `usePhotoMode((state) => state.togglePhotoMode)`.
 *
 * @returns Selected slice (the whole object if no selector is given)
 */
export function usePhotoMode<T = UsePhotoModeReturn>(
  selector: (state: UsePhotoModeReturn) => T = (state) => state as unknown as T,
) {
  const rawTakeScreenshot = usePhotoModeStore((state) => state.takeScreenshot);

  const takeScreenshot = useCallback(
    (options?: ScreenshotOptions) => {
      if (!rawTakeScreenshot) {
        console.warn("PhotoMode not initialized yet");
        return Promise.resolve(null);
      }
      return rawTakeScreenshot(options);
    },
    [rawTakeScreenshot],
  );

  return usePhotoModeStore(
    (state) => selector({ takeScreenshot, photoModeOn: state.photoModeOn, togglePhotoMode: state.togglePhotoMode }),
    shallow,
  );
}
