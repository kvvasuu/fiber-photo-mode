import { useFrame } from "@react-three/fiber";
import { CopyPass, DepthOfFieldEffect, DepthPickingPass, EffectPass, MaskFunction } from "postprocessing";
import { forwardRef, RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";

import { easing } from "maath";
import { Vector3 } from "three";
import { useCameraStore } from "../../store/CameraStore";
import { usePhotoModeStore } from "../../store/PhotoModeStore";
import { apertureToFocusRange } from "../../utils/functions";

interface AutoFocusPassHandle {
  dofRef: RefObject<DepthOfFieldEffect>;
}

/**
 * PhotoMode AutoFocus Component
 *
 * Handles dynamic Depth-of-Field (DOF) target positioning in a scene.
 * Can operate in two modes:
 *   - Manual: fixed distance along the camera forward direction
 *   - Auto: calculates the nearest object depth from the camera (center of screen)
 */
export function AutoFocus() {
  const autoFocusPassRef = useRef<AutoFocusPassHandle>(null);

  const hitpointRef = useRef(new Vector3());

  /** Temporary ref storing normalized device coordinates (NDC) for depth sampling */
  const ndcRef = useRef(new Vector3());
  /** Temporary ref storing the camera forward vector */
  const _cameraDir = useRef(new Vector3());

  const camera = usePhotoModeStore((state) => state.camera);
  const composer = usePhotoModeStore((state) => state.composer);
  const photoModeOn = usePhotoModeStore((state) => state.photoModeOn);

  const autoFocus = useCameraStore((state) => state.autoFocus);
  const DOFEnabled = useCameraStore((state) => state.DOFEnabled);

  /** DepthPickingPass used to read per-pixel depth from the buffer */
  const [depthPickingPass] = useState(() => new DepthPickingPass());
  const [copyPass] = useState(() => new CopyPass());

  useEffect(() => {
    if (!composer || !camera) return;

    composer.addPass(depthPickingPass, 2);
    composer.addPass(copyPass, 3);

    return () => {
      composer.removePass(depthPickingPass);
      composer.removePass(copyPass);

      depthPickingPass.dispose();
      copyPass.dispose();
    };
  }, [composer]);

  useFrame(async (_, delta) => {
    const dofRef = autoFocusPassRef.current?.dofRef;
    if (!camera || !dofRef?.current || !DOFEnabled || !photoModeOn) return;

    if (!autoFocus) {
      // MANUAL MODE: move focus straight ahead from the camera
      const distance = useCameraStore.getState().focusDistance;

      camera.getWorldDirection(_cameraDir.current);
      hitpointRef.current.copy(camera.position).addScaledVector(_cameraDir.current, distance);
    } else {
      // AUTOFOCUS MODE: sample depth from screen center
      const ndc = ndcRef.current;
      ndc.x = 0; // center X in NDC
      ndc.y = 0; // center Y in NDC
      ndc.z = await depthPickingPass.readDepth(ndc); // read depth buffer
      ndc.z = ndc.z * 2.0 - 1.0; // remap depth from [0,1] to NDC [-1,1]
      const hit = 1 - ndc.z > 0.0000001; // ignore if depth very far (missed)
      if (hit) {
        hitpointRef.current.copy(ndc.unproject(camera)); // convert NDC to world coordinates
      }
    }

    // Update the DOF target, smoothing if in autofocus mode
    if (dofRef.current?.target) {
      if (autoFocus && delta > 0) {
        easing.damp3(dofRef.current.target, hitpointRef.current, 0.25, delta); // smooth transition
      } else {
        dofRef.current.target.copy(hitpointRef.current); // immediate snap
      }
    }
  });

  return <AutoFocusPass ref={autoFocusPassRef} />;
}

const AutoFocusPass = forwardRef<AutoFocusPassHandle, {}>((_props, ref) => {
  useImperativeHandle(ref, () => ({
    dofRef: dofRef as RefObject<DepthOfFieldEffect>,
  }));

  const composer = usePhotoModeStore((state) => state.composer);
  const camera = usePhotoModeStore((state) => state.camera);
  const photoModeOn = usePhotoModeStore((state) => state.photoModeOn);

  const aperture = useCameraStore((state) => state.aperture);

  const DOFEnabled = useCameraStore((state) => state.DOFEnabled);

  const dofRef = useRef<DepthOfFieldEffect | null>(null);
  const autoFocusPass = useRef<EffectPass | null>(null);

  useEffect(() => {
    if (!camera) return;

    const dofEffect = new DepthOfFieldEffect(camera, {
      bokehScale: 7,
      focusRange: apertureToFocusRange(aperture) || 2,
    });

    dofEffect.target = new Vector3();

    // Temporary fix that restores DOF 6.21.3 behavior
    const maskPass = (dofEffect as any).maskPass;
    maskPass.maskFunction = MaskFunction.MULTIPLY_RGB_SET_ALPHA;

    dofRef.current = dofEffect;
    autoFocusPass.current = new EffectPass(camera, dofEffect);
    autoFocusPass.current.enabled = photoModeOn && DOFEnabled;

    return () => {
      dofEffect.dispose();
      autoFocusPass.current?.dispose();
    };
  }, [camera]);

  useEffect(() => {
    if (!composer || !autoFocusPass.current) return;

    autoFocusPass.current.enabled = photoModeOn && DOFEnabled;
  }, [DOFEnabled, photoModeOn]);

  useEffect(() => {
    if (!composer || !autoFocusPass.current) return;

    autoFocusPass.current.name = "AutoFocusPass";
    composer.addPass(autoFocusPass.current, 1);

    return () => {
      if (autoFocusPass.current) {
        composer.removePass(autoFocusPass.current);
      }
    };
  }, [composer, autoFocusPass.current]);

  useEffect(() => {
    if (!dofRef.current) return;

    const focusRange = apertureToFocusRange(aperture);

    dofRef.current.cocMaterial.uniforms.focusRange.value = focusRange;
  }, [aperture]);

  return null;
});
