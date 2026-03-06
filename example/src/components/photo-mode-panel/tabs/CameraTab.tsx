import { useState } from "react";
import { SectionLabel, SliderControl, SwitchControl } from "../PhotoModeControls";

export const CameraTab = () => {
  const [focalLength, setFocalLength] = useState(50);
  const [aperture, setAperture] = useState(2.8);
  const [fov, setFov] = useState(60);
  const [roll, setRoll] = useState(0);
  const [autofocus, setAutofocus] = useState(true);
  const [focusDistance, setFocusDistance] = useState(5);
  const [dof, setDof] = useState(true);

  return (
    <>
      <SectionLabel>Lens</SectionLabel>
      <SliderControl label="Focal Length" value={focalLength} min={12} max={200} unit="mm" onChange={setFocalLength} />
      <SliderControl label="Aperture" value={aperture} min={1.4} max={22} step={0.1} unit="ƒ" onChange={setAperture} />
      <SliderControl label="Field of View" value={fov} min={20} max={120} unit="°" onChange={setFov} />

      <SectionLabel>Position</SectionLabel>
      <SliderControl label="Roll" value={roll} min={-180} max={180} unit="°" onChange={setRoll} />

      <SectionLabel>Focus</SectionLabel>
      <SwitchControl label="Autofocus" checked={autofocus} onChange={setAutofocus} />
      {!autofocus && (
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
      <SwitchControl label="Depth of Field" checked={dof} onChange={setDof} />
    </>
  );
};
