import { motion } from "framer-motion";
import { Save, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { SectionLabel } from "../PhotoModeControls.tsx";

interface Preset {
  id: string;
  name: string;
  timestamp: number;
}

export const PresetsTab = () => {
  const [presets, setPresets] = useState<Preset[]>([
    { id: "1", name: "Cinematic Warm", timestamp: Date.now() - 86400000 },
    { id: "2", name: "Cold Blue", timestamp: Date.now() - 3600000 },
    { id: "3", name: "Vintage Film", timestamp: Date.now() },
  ]);
  const [presetName, setPresetName] = useState("");

  const handleSave = () => {
    if (!presetName.trim()) return;
    setPresets((prev) => [{ id: crypto.randomUUID(), name: presetName.trim(), timestamp: Date.now() }, ...prev]);
    setPresetName("");
  };

  const handleDelete = (id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <>
      <SectionLabel>Save Current</SectionLabel>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="Preset name..."
          className="flex-1 rounded-lg border border-panel-border bg-secondary px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none transition-colors"
        />
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 rounded-lg bg-slider-fill px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:text-accent cursor-pointer"
        >
          <Save size={12} />
        </button>
      </div>

      <SectionLabel>Saved Presets</SectionLabel>
      <div className="space-y-1.5">
        {presets.map((preset) => (
          <motion.div
            key={preset.id}
            layout
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="group flex items-center justify-between rounded-lg border border-panel-border bg-secondary/50 px-3 py-2 transition-colors hover:border-accent/30"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground">{preset.name}</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="rounded p-1 text-tab-inactive hover:text-accent transition-colors cursor-pointer"
                title="Load"
              >
                <Upload size={12} />
              </button>
              <button
                onClick={() => handleDelete(preset.id)}
                className="rounded p-1 text-tab-inactive hover:text-red-400 transition-colors cursor-pointer"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </motion.div>
        ))}
        {presets.length === 0 && <p className="text-center text-xs text-muted-foreground py-4">No presets saved yet</p>}
      </div>
    </>
  );
};
