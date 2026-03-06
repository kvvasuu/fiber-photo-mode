import { useRef, type ReactNode } from "react";

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
  const trackRef = useRef<HTMLDivElement>(null);
  const percentage = ((value - min) / (max - min)) * 100;

  const getValueFromPointer = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = min + ratio * (max - min);
    const stepped = Math.round((raw - min) / step) * step + min;
    return Math.max(min, Math.min(max, stepped));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    onChange(getValueFromPointer(e.clientX));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      onChange(getValueFromPointer(e.clientX));
    }
  };

  return (
    <div className="mb-2.5 last:mb-0 select-none" draggable="false">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-foreground/40">{label}</span>
        <span className="font-mono text-[10px] text-foreground/70 tabular-nums">
          {typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value}
          {unit}
        </span>
      </div>
      <div
        ref={trackRef}
        className="relative flex items-center w-full h-4 cursor-pointer"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <div className="absolute w-full h-0.5 rounded-full bg-white/10">
          <div
            className="h-full rounded-full"
            style={{
              width: `${percentage}%`,
              background: "linear-gradient(90deg, hsl(200,85%,55%), hsl(200,75%,65%))",
            }}
          />
        </div>
        <div
          className="absolute w-2.5 h-2.5 rounded-full bg-[hsl(0,0%,95%)] pointer-events-none"
          style={{
            left: `calc(${percentage}% - 5px)`,
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
    <div className="flex items-center justify-between mb-2.5 last:mb-0 select-none" draggable="false">
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

export const SectionLabel = ({
  children,
  resetButton,
  onReset,
}: {
  children: ReactNode;
  resetButton?: boolean;
  onReset?: () => void;
}) => (
  <div
    className="mb-2 mt-3 first:mt-0 pb-1 select-none flex flex-row justify-between items-end border-b border-accent/10"
    draggable="false"
  >
    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-accent/70">{children}</span>

    {resetButton && (
      <button
        className="rounded transition-colors hover:bg-background/50 hover:text-red-400 px-1.5 py-0.5 text-[10px] font-bold uppercase  text-red-500/50 cursor-pointer"
        onClick={onReset}
      >
        RESET
      </button>
    )}
  </div>
);
