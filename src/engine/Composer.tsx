import type { EffectComposerProps } from "@react-three/postprocessing";
import { EffectComposer } from "@react-three/postprocessing";
import { EffectComposer as EffectComposerImpl } from "postprocessing";
import { forwardRef, ReactNode } from "react";
import { usePhotoModeStore } from "../store/PhotoModeStore";
import AutoFocus from "./AutoFocus";
import { Effects } from "./Effects";

/**
 * Props for Composer
 */
type ComposerProps = Omit<EffectComposerProps, "children"> & {
  children?: ReactNode;
  enableBloom?: boolean;
};

/**
 * PhotoMode Composer Component
 * Wraps EffectComposer to register it with PhotoMode store
 * Enables post-processing effects in screenshot capture
 */
export const Composer = forwardRef<EffectComposerImpl, ComposerProps>(({ children, ...props }, ref) => {
  const setComposer = usePhotoModeStore((state) => state.setComposer);
  const photoModeOn = usePhotoModeStore((state) => state.photoModeOn);

  return (
    <EffectComposer
      {...props}
      ref={(c: EffectComposerImpl | null) => {
        // Register composer in store
        setComposer(c);
        // Pass ref to parent
        if (typeof ref === "function") ref(c);
        else if (ref) ref.current = c;
      }}
    >
      <>
        {/* AutoFocus first */}
        {photoModeOn && <AutoFocus />}

        {/* Then User's Effects */}
        {children}

        {/* Photo Mode Effects last */}
        <Effects />
      </>
    </EffectComposer>
  );
});

Composer.displayName = "Composer";
