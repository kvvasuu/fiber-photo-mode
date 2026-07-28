/**
 * @react-three/test-renderer's mock WebGL context stubs getContextAttributes() to
 * return undefined, but postprocessing's EffectComposer reads `.alpha` off its
 * result unconditionally and crashes. Patch the canvas so it returns a usable object.
 */
export const patchCanvasForPostprocessing = (canvas: HTMLCanvasElement) => {
  const originalGetContext = canvas.getContext.bind(canvas);
  (canvas as any).getContext = (...args: Parameters<typeof originalGetContext>) => {
    const ctx = originalGetContext(...(args as [string]));
    if (ctx) (ctx as any).getContextAttributes = () => ({ alpha: true });
    return ctx;
  };
};
