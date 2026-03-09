import { Vector3 } from "three";
import { useMainStore } from "../../../store";
import { SectionLabel, SliderControl, SwitchControl } from "../PhotoModeControls";

const formats = ["png", "jpeg", "webp", "avif"] as const;
export type Format = (typeof formats)[number];

const presets = [
  { label: "1080p", w: 1920, h: 1080 },
  { label: "1440p", w: 2560, h: 1440 },
  { label: "4K", w: 3840, h: 2160 },
  { label: "Square", w: 1080, h: 1080 },
];

export const positionVectors = [
  {
    label: "Pos 1",
    vec: new Vector3(2.01, 7.42, 16.36),
  },
  {
    label: "Pos 2",
    vec: new Vector3(18, 2, 5),
  },
];

const outputTypes = ["New Tab", "Download"];
export type Output = (typeof outputTypes)[number];

export const OutputTab = () => {
  const width = useMainStore((state) => state.width);
  const height = useMainStore((state) => state.height);
  const quality = useMainStore((state) => state.quality);
  const format = useMainStore((state) => state.format);
  const output = useMainStore((state) => state.output);
  const overridePosition = useMainStore((state) => state.overridePosition);
  const overridePositionVec = useMainStore((state) => state.overridePositionVec);

  return (
    <>
      <SectionLabel>Resolution</SectionLabel>
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              useMainStore.setState({ width: p.w, height: p.h });
            }}
            className="rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            style={{
              background: width === p.w && height === p.h ? "hsl(200,85%,55%)" : "hsla(220,15%,50%,0.15)",
              color: width === p.w && height === p.h ? "hsl(220,25%,8%)" : "hsla(0,0%,95%,0.5)",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <SliderControl
        label="Width"
        value={width}
        min={320}
        max={7680}
        step={1}
        unit="px"
        onChange={(v) => useMainStore.setState({ width: v })}
      />
      <SliderControl
        label="Height"
        value={height}
        min={320}
        max={4320}
        step={1}
        unit="px"
        onChange={(v) => useMainStore.setState({ height: v })}
      />

      <SectionLabel>Format</SectionLabel>
      <div className="flex gap-1.5 mb-3">
        {formats.map((f) => (
          <button
            key={f}
            onClick={() => useMainStore.setState({ format: f })}
            className="rounded-md px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            style={{
              background: format === f ? "hsl(200,85%,55%)" : "hsla(220,15%,50%,0.15)",
              color: format === f ? "hsl(220,25%,8%)" : "hsla(0,0%,95%,0.5)",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {format !== "png" && (
        <SliderControl
          label="Quality"
          value={quality}
          min={0.05}
          step={0.01}
          max={1}
          unit="%"
          onChange={(v) => useMainStore.setState({ quality: v })}
          format={(v) => Math.round(v * 100)}
        />
      )}

      <SectionLabel>Info</SectionLabel>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-foreground/40">Aspect Ratio</span>
        <span className="font-mono text-[10px] text-foreground/70 tabular-nums">
          {width / gcd(width, height)}:{height / gcd(width, height)}
        </span>
      </div>

      <SectionLabel>Override Camera Position</SectionLabel>
      <SwitchControl
        label="Enabled"
        checked={overridePosition}
        onChange={(v) => useMainStore.setState({ overridePosition: v })}
      />
      {overridePosition && (
        <div className="flex gap-1.5 mb-3">
          {positionVectors.map((pos) => (
            <button
              key={pos.label}
              onClick={() => useMainStore.setState({ overridePositionVec: pos.label })}
              className="rounded-md px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              style={{
                background: overridePositionVec === pos.label ? "hsl(200,85%,55%)" : "hsla(220,15%,50%,0.15)",
                color: overridePositionVec === pos.label ? "hsl(220,25%,8%)" : "hsla(0,0%,95%,0.5)",
              }}
            >
              {pos.label}
            </button>
          ))}
        </div>
      )}

      <SectionLabel>Output</SectionLabel>
      <div className="flex gap-1.5 mb-3">
        {outputTypes.map((o) => (
          <button
            key={o}
            onClick={() => useMainStore.setState({ output: o })}
            className="rounded-md px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            style={{
              background: output === o ? "hsl(200,85%,55%)" : "hsla(220,15%,50%,0.15)",
              color: output === o ? "hsl(220,25%,8%)" : "hsla(0,0%,95%,0.5)",
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </>
  );
};

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
