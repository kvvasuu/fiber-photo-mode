interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export const SliderControl = ({ label, value, min, max, step = 1, unit = "", onChange }: SliderControlProps) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="mb-2.5 last:mb-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-foreground/40">{label}</span>
        <span className="font-mono text-[10px] text-foreground/70 tabular-nums">
          {typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value}
          {unit}
        </span>
      </div>
      <div className="relative h-4 flex items-center">
        <div className="absolute inset-y-0 left-0 right-0 flex items-center">
          <div className="h-0.5 w-full rounded-full bg-foreground/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${percentage}%`,
                background: "linear-gradient(90deg, hsl(200,85%,55%), hsl(200,75%,65%))",
              }}
            />
          </div>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />
        <div
          className="pointer-events-none absolute h-2.5 w-2.5 rounded-full transition-all"
          style={{
            left: `calc(${percentage}% - 5px)`,
            background: "hsl(0,0%,95%)",
            boxShadow: "0 0 6px hsla(200,85%,55%,0.4)",
          }}
        />
      </div>
    </div>
  );
};

interface SwitchControlProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const SwitchControl = ({ label, checked, onChange }: SwitchControlProps) => {
  return (
    <div className="flex items-center justify-between mb-2.5 last:mb-0">
      <span className="text-[10px] font-medium uppercase tracking-wider text-foreground/40">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className="relative h-4 w-7 rounded-full transition-colors"
        style={{
          background: checked ? "hsl(200,85%,55%)" : "hsla(220,15%,50%,0.25)",
        }}
      >
        <div
          className="absolute top-0.5 h-3 w-3 rounded-full transition-transform"
          style={{
            background: "hsl(0,0%,95%)",
            transform: checked ? "translateX(13px)" : "translateX(2px)",
            boxShadow: "0 1px 3px hsla(0,0%,0%,0.3)",
          }}
        />
      </button>
    </div>
  );
};

export const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-2 mt-3 first:mt-0 pb-1" style={{ borderBottom: "1px solid hsla(200,30%,50%,0.1)" }}>
    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-accent/70">{children}</span>
  </div>
);
