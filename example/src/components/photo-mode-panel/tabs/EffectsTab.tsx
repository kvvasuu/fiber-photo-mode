import { usePhotoModeEffects } from "fiber-photo-mode";
import { SectionLabel, SliderControl } from "../PhotoModeControls.tsx";

export const EffectsTab = () => {
  const {
    brightness,
    contrast,
    hue,
    saturation,
    bloom,
    vignette,
    grain,
    chromaticAberration,
    setEffect,
    resetEffects,
  } = usePhotoModeEffects();

  const hasColor = brightness != null || contrast != null || saturation != null || hue != null;

  const hasPostProcessing = bloom != null || vignette != null || grain != null || chromaticAberration != null;

  return (
    <>
      {hasColor && (
        <SectionLabel resetButton onReset={() => resetEffects()}>
          Color
        </SectionLabel>
      )}

      {brightness != null && (
        <SliderControl
          label="Brightness"
          value={brightness}
          min={-1}
          step={0.01}
          max={1}
          unit="%"
          onChange={(val) => setEffect("brightness", val)}
          format={(v) => Math.round(v * 100)}
        />
      )}

      {contrast != null && (
        <SliderControl
          label="Contrast"
          value={contrast}
          min={-1}
          step={0.01}
          max={1}
          unit="%"
          onChange={(val) => setEffect("contrast", val)}
          format={(v) => Math.round(v * 100)}
        />
      )}

      {saturation != null && (
        <SliderControl
          label="Saturation"
          value={saturation}
          min={-1}
          step={0.01}
          max={1}
          unit="%"
          onChange={(val) => setEffect("saturation", val)}
          format={(v) => Math.round(v * 100)}
        />
      )}

      {hue != null && (
        <SliderControl
          label="Hue Shift"
          value={hue}
          min={-1}
          step={0.01}
          max={1}
          unit="°"
          onChange={(val) => setEffect("hue", val)}
          format={(v) => Math.round(v * 180)}
        />
      )}

      {hasPostProcessing && <SectionLabel>Post-Processing</SectionLabel>}

      {bloom != null && (
        <SliderControl
          label="Bloom"
          value={bloom}
          min={0}
          max={1}
          step={0.05}
          onChange={(val) => setEffect("bloom", val)}
          format={(v) => Math.round(v * 100)}
        />
      )}
      {vignette != null && (
        <SliderControl
          label="Vignette"
          value={vignette}
          min={0}
          max={1}
          step={0.05}
          onChange={(val) => setEffect("vignette", val)}
          format={(v) => Math.round(v * 100)}
        />
      )}

      {grain != null && (
        <SliderControl
          label="Grain"
          value={grain}
          min={0}
          max={1}
          step={0.05}
          onChange={(val) => setEffect("grain", val)}
          format={(v) => Math.round(v * 100)}
        />
      )}

      {chromaticAberration != null && (
        <SliderControl
          label="Chromatic Aberration"
          value={chromaticAberration}
          min={0}
          max={1}
          step={0.05}
          onChange={(val) => setEffect("chromaticAberration", val)}
          format={(v) => Math.round(v * 100)}
        />
      )}
    </>
  );
};
