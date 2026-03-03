import { usePhotoMode } from "fiber-photo-mode";
import { Aperture, Camera, Eye, EyeOff, Space } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useEffect, useState } from "react";
import { PhotoModePanel } from "./photo-mode-panel/PhotoModePanel";

export default function UserInterface({ show }: { show?: boolean }) {
  const { photoModeOn, takeScreenshot, togglePhotoMode } = usePhotoMode();

  const [uiVisible, setUiVisible] = useState(true);

  const handleTakeScreenshot = async () => {
    if (!takeScreenshot || !photoModeOn) return;

    const screenshot = await takeScreenshot({ returnType: "objectURL" });

    const a = document.createElement("a");
    a.download = `Screenshot.jpg`;
    if (typeof screenshot === "string") {
      window.open(screenshot, "_blank");
      // screenshot.replace("image/jpeg", "image/octet-stream");
      // a.href = screenshot;
      // a.click();
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && photoModeOn) {
        e.preventDefault();
        handleTakeScreenshot();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [handleTakeScreenshot]);

  return (
    <motion.div
      className="absolute z-10 inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: photoModeOn && uiVisible ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <>
          {/* Rule of thirds */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-foreground/15" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-foreground/15" />
            <div className="absolute top-1/3 left-0 right-0 h-px bg-foreground/15" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-foreground/15" />
          </div>

          {/* Bottom-left hint */}
          <div className="absolute bottom-6 left-6 z-40 space-y-2 hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="rounded border border-panel-border bg-background/85 backdrop-blur-sm px-1.5 py-0.5 font-mono text-[10px] text-accent">
                LMB
              </span>
              <span className="text-xs text-muted-foreground">Rotate Camera</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded border border-panel-border bg-background/85 backdrop-blur-sm px-1.5 py-0.5 font-mono text-[10px] text-accent">
                Scroll
              </span>
              <span className="text-xs text-muted-foreground">Camera Distance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded border border-panel-border bg-background/85 backdrop-blur-sm px-1.5 py-0.5 font-mono text-[10px] text-accent">
                RMB
              </span>
              <span className="text-xs text-muted-foreground">Move Camera</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded border border-panel-border bg-background/85 backdrop-blur-sm px-1.5 py-0.5 font-mono text-[10px] text-accent">
                <Space size={12} />
              </span>
              <span className="text-xs text-muted-foreground">Take Screenshot</span>
            </div>
          </div>
        </>
      </motion.div>

      {/* Bottom-right controls */}
      <div className="absolute hidden sm:flex bottom-6 right-6 z-50  items-center gap-2">
        <LayoutGroup>
          <AnimatePresence initial={false}>
            {photoModeOn && uiVisible && (
              <motion.button
                layout
                whileTap={{ scale: 0.9 }}
                className="group bg-background/50 border border-panel-border backdrop-blur-md relative rounded-lg p-2.5 transition-colors pointer-events-auto cursor-pointer"
                onClick={handleTakeScreenshot}
                title="Take Screenshot"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                key="camera"
              >
                <Camera size={16} className="text-foreground/40 group-hover:text-foreground/70 transition-colors" />
              </motion.button>
            )}

            {photoModeOn && (
              <motion.button
                layout
                whileTap={{ scale: 0.9 }}
                className="group bg-background/50 border border-panel-border backdrop-blur-md relative rounded-lg p-2.5 transition-colors pointer-events-auto cursor-pointer"
                onClick={() => setUiVisible((prev) => !prev)}
                title={uiVisible ? "Hide UI" : "Show UI"}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                key="eye"
              >
                {uiVisible ? (
                  <EyeOff size={16} className="text-foreground/40 group-hover:text-foreground/70 transition-colors" />
                ) : (
                  <Eye size={16} className="text-foreground/40 group-hover:text-foreground/70 transition-colors" />
                )}
              </motion.button>
            )}

            {uiVisible && (
              <motion.button
                layout
                whileTap={{ scale: 0.9 }}
                className="group bg-background/50 border border-panel-border backdrop-blur-md relative rounded-lg p-2.5 transition-colors pointer-events-auto cursor-pointer"
                onClick={() => togglePhotoMode()}
                title={photoModeOn ? "Exit Photo Mode" : "Enter Photo Mode"}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                key="aperture"
              >
                <Aperture
                  size={16}
                  className={`transition-colors ${photoModeOn ? "text-accent" : "text-foreground/40 group-hover:text-foreground/70"}`}
                />
              </motion.button>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>

      <AnimatePresence initial={false}>{photoModeOn && uiVisible && <PhotoModePanel />}</AnimatePresence>
    </motion.div>
  );
}
