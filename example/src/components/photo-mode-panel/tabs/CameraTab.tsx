import { usePhotoModeCamera } from "fiber-photo-mode";
import { SectionLabel, SliderControl, SwitchControl } from "../PhotoModeControls";

export const CameraTab = () => {
  const {
    focalLength,
    setFocalLength,
    aperture,
    setAperture,
    rotation,
    setRotation,
    autoFocus,
    toggleAutoFocus,
    focusDistance,
    setFocusDistance,
    toggleDOF,
    DOFEnabled,
  } = usePhotoModeCamera();

  return (
    <>
      <SectionLabel>Lens</SectionLabel>
      <SliderControl label="Focal Length" value={focalLength} min={12} max={200} unit="mm" onChange={setFocalLength} />
      <SliderControl label="Aperture" value={aperture} min={1.4} max={22} step={0.1} unit="ƒ" onChange={setAperture} />

      <SectionLabel resetButton onReset={() => setRotation(0)}>
        Position
      </SectionLabel>
      <SliderControl label="Roll" value={rotation} min={-180} max={180} unit="°" onChange={setRotation} />

      <SectionLabel>Focus</SectionLabel>
      <SwitchControl label="Depth of Field" checked={DOFEnabled} onChange={toggleDOF} />
      {DOFEnabled && (
        <>
          <SwitchControl label="Autofocus" checked={autoFocus} onChange={toggleAutoFocus} />
          {!autoFocus && (
            <SliderControl
              label="Focus Distance"
              value={focusDistance}
              min={0.1}
              max={100}
              step={0.1}
              unit="m"
              onChange={setFocusDistance}
            />
          )}
        </>
      )}
    </>
  );
};
