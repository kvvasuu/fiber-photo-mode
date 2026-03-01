import { usePhotoMode } from "fiber-photo-mode";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Space } from "./icons/Keyboard";
import { MouseLeft, MouseMiddle, MouseRight } from "./icons/Mouse";

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
      switch (e.code) {
        case "Space":
          if (!photoModeOn) return;
          e.preventDefault();
          handleTakeScreenshot();
          break;

        case "KeyP":
          togglePhotoMode();
          break;

        case "Tab":
          if (!photoModeOn) return;
          e.preventDefault();
          setUiVisible((prev) => !prev);
          break;
      }
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [takeScreenshot, handleTakeScreenshot, togglePhotoMode, setUiVisible]);

  useEffect(() => {
    if (!photoModeOn) {
      setUiVisible(true);
    }
  }, [photoModeOn, setUiVisible]);

  return (
    <motion.div
      className="photomode-ui"
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
          <div className="photo-grid"></div>
          <div className="help-left" inert>
            <div>
              <MouseLeft />
              Rotate Camera
            </div>
            <div>
              <MouseMiddle />
              Camera Distance
            </div>
            <div>
              <MouseRight />
              Move Camera
            </div>
          </div>
        </>
      </motion.div>

      {/* <Settings show={photoModeOn && uiVisible} /> */}

      <div className="help-bottom">
        <motion.div
          className={`dynamic-buttons ${!photoModeOn || !uiVisible ? "disabled" : ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: photoModeOn && uiVisible ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button onClick={handleTakeScreenshot}>
            <div className="keyboard-icon">
              <Space />
            </div>
            <span>Take screenshot</span>
          </button>
        </motion.div>

        <motion.button
          className={`${!uiVisible ? "dimmed" : ""} ${!photoModeOn ? "disabled" : ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: photoModeOn ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setUiVisible((prev) => !prev)}
        >
          <div className="keyboard-icon">TAB</div>
          <span>{uiVisible ? "Hide" : "Show"} UI</span>
        </motion.button>

        {uiVisible && (
          <button onClick={() => togglePhotoMode()} className={!photoModeOn || !uiVisible ? "dimmed" : ""}>
            <div className="keyboard-icon">P</div>
            <span>Toggle Photo Mode</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
