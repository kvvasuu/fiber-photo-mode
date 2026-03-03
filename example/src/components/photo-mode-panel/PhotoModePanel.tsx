import { AnimatePresence, motion } from "framer-motion";
import { BookMarked, Camera, Sparkles } from "lucide-react";
import { useState } from "react";
import { CameraTab } from "./tabs/CameraTab";
import { EffectsTab } from "./tabs/EffectsTab";
import { PresetsTab } from "./tabs/PresetsTab";

const tabs = [
  { id: "camera", icon: Camera, label: "Camera" },
  { id: "effects", icon: Sparkles, label: "Effects" },
  { id: "presets", icon: BookMarked, label: "Presets" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export const PhotoModePanel = () => {
  const [activeTab, setActiveTab] = useState<TabId>("camera");

  return (
    <div className="fixed bottom-0 sm:bottom-20 right-0 sm:right-6 z-50 w-full sm:w-110 md:w-140 pointer-events-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-lg overflow-hidden border border-panel-border backdrop-blur-lg shadow-xl shadow-background/25 inset-shadow-2xs"
        style={{
          background: "linear-gradient(135deg, hsla(220,25%,10%,0.55), hsla(220,20%,8%,0.65))",
        }}
      >
        {/* Tab bar */}
        <div className="flex items-center border-b border-foreground/5 px-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="group relative flex items-center gap-2 px-4 py-2.5 transition-colors cursor-pointer"
                title={tab.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <tab.icon
                  size={15}
                  className={`transition-colors ${
                    isActive ? "text-accent" : "text-foreground/40 group-hover:text-foreground/70"
                  }`}
                />
                <span
                  className={`text-[11px] font-medium uppercase tracking-wider transition-colors ${
                    isActive ? "text-accent" : "text-foreground/40 group-hover:text-foreground/70"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="panel-scroll h-80 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "camera" && <CameraTab />}
              {activeTab === "effects" && <EffectsTab />}
              {activeTab === "presets" && <PresetsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
