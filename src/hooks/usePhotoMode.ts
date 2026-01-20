/**
 * usePhotoMode Hook
 * Provides screenshot capture and photo mode state management
 */

import { usePhotoModeStore } from '../store/photoModeStore';
import { ScreenshotOptions } from '../types';

/**
 * Hook to manage photo mode functionality
 * @param options - Default screenshot options applied to all captures
 * @returns Object with takeScreenshot, photoModeOn state, and togglePhotoMode function
 */
export function usePhotoMode() {
	const photoModeOn = usePhotoModeStore((state) => state.photoModeOn);
	const togglePhotoMode = usePhotoModeStore((state) => state.togglePhotoMode);
	const takeScreenshot = usePhotoModeStore((state) => state.takeScreenshot);

	return {
		/**
		 * Captures a screenshot with configured options
		 */
		takeScreenshot: (options?: ScreenshotOptions) => {
			if (!takeScreenshot) {
				console.warn('PhotoMode not initialized yet');
				return Promise.resolve(null);
			}
			return takeScreenshot(options);
		},
		/** Current photo mode state */
		photoModeOn,
		/** Toggle photo mode on/off */
		togglePhotoMode,
	};
}
