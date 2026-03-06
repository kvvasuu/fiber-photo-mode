import { useState } from "react";
import { SectionLabel, SliderControl, SwitchControl } from "../PhotoModeControls.tsx";

export const EffectsTab = () => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [bloom, setBloom] = useState(false);
  const [bloomIntensity, setBloomIntensity] = useState(0.5);
  const [vignette, setVignette] = useState(false);
  const [vignetteIntensity, setVignetteIntensity] = useState(0.5);
  const [grain, setGrain] = useState(false);
  const [grainIntensity, setGrainIntensity] = useState(0.3);
  const [chromatic, setChromatic] = useState(false);
  const [chromaticOffset, setChromaticOffset] = useState(0.5);

  return (
    <>
      <SectionLabel>Color</SectionLabel>
      <SliderControl label="Brightness" value={brightness} min={0} max={200} unit="%" onChange={setBrightness} />
      <SliderControl label="Contrast" value={contrast} min={0} max={200} unit="%" onChange={setContrast} />
      <SliderControl label="Saturation" value={saturation} min={0} max={200} unit="%" onChange={setSaturation} />
      <SliderControl label="Hue Shift" value={hue} min={-180} max={180} unit="°" onChange={setHue} />

      <SectionLabel>Post-Processing</SectionLabel>
      <SwitchControl label="Bloom" checked={bloom} onChange={setBloom} />
      {bloom && (
        <SliderControl
          label="Intensity"
          value={bloomIntensity}
          min={0}
          max={2}
          step={0.01}
          onChange={setBloomIntensity}
        />
      )}
      <SwitchControl label="Vignette" checked={vignette} onChange={setVignette} />
      {vignette && (
        <SliderControl
          label="Intensity"
          value={vignetteIntensity}
          min={0}
          max={1}
          step={0.01}
          onChange={setVignetteIntensity}
        />
      )}
      <SwitchControl label="Film Grain" checked={grain} onChange={setGrain} />
      {grain && (
        <SliderControl
          label="Intensity"
          value={grainIntensity}
          min={0}
          max={1}
          step={0.01}
          onChange={setGrainIntensity}
        />
      )}
      <SwitchControl label="Chromatic Ab." checked={chromatic} onChange={setChromatic} />
      {chromatic && (
        <SliderControl
          label="Offset"
          value={chromaticOffset}
          min={0}
          max={2}
          step={0.01}
          onChange={setChromaticOffset}
        />
      )}
    </>
  );
};
