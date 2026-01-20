/**
 * PhotoModeComposer Component
 * Wraps EffectComposer to register it with PhotoMode store
 * Enables post-processing effects in screenshot capture
 */

import type { EffectComposerProps } from '@react-three/postprocessing';
import { EffectComposer } from '@react-three/postprocessing';
import { EffectComposer as EffectComposerImpl } from 'postprocessing';
import { forwardRef, ReactNode } from 'react';
import { usePhotoModeStore } from '../store/photoModeStore';

/**
 * Props for PhotoModeComposer
 */
type PhotoModeComposerProps = EffectComposerProps & {
	children: ReactNode;
};

/**
 * PhotoModeComposer - Wraps EffectComposer for PhotoMode integration
 * Automatically registers composer for screenshot post-processing
 */
export const PhotoModeComposer = forwardRef<EffectComposerImpl, PhotoModeComposerProps>(({ children, ...props }, ref) => {
	const setComposer = usePhotoModeStore((state) => state.setComposer);

	return (
		<EffectComposer
			{...props}
			ref={(c: EffectComposerImpl | null) => {
				// Register composer in store
				setComposer(c);
				// Pass ref to parent
				if (typeof ref === 'function') ref(c);
				else if (ref) ref.current = c;
			}}
		>
			{children}
		</EffectComposer>
	);
});

PhotoModeComposer.displayName = 'PhotoModeComposer';
