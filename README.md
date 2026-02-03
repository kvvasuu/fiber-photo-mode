# React Fiber Photo Mode

[![Version](https://badgen.net/npm/v/fiber-photo-mode)](https://www.npmjs.com/package/fiber-photo-mode)

PhotoMode / screenshot capture system with post-processing effects for [React Three Fiber](https://github.com/pmndrs/react-three-fiber).

⚠️ Warning: Early-stage, experimental – under active development. The API may change in future releases.

## Installation

```sh
npm install fiber-photo-mode
```

## Description

React Fiber Photo Mode makes it easy to take high-quality screenshots of your Three.js / React Three Fiber scenes, including post-processing effects and camera settings.

While it's technically possible to capture directly from the canvas, fiber-photo-mode lets you:

- Take screenshots at custom resolutions independent of the canvas size
- Override the canvas pixel ratio for better quality (e.g., if your canvas uses a low pixel ratio for performance, the screenshot can still be full-quality)
- Capture scenes with post-processing effects, keeping the same visual fidelity as in the canvas
- Apply photo effects (Bloom, Brightness/Contrast, Hue/Saturation, Vignette, Chromatic Aberration, Grain) to your captures

## Usage

### Basic Setup

Insert `<PhotoMode />` into your `<Canvas>` and call a hook to capture screenshots anywhere in your app:

```jsx
import { Canvas } from "@react-three/fiber";
import { PhotoMode } from "fiber-photo-mode";

<Canvas>
  <PhotoMode />
  {/* Your scene, objects, effects */}
</Canvas>;
```

### Taking Screenshots

Use the `usePhotoMode` hook to capture screenshots:

```jsx
import { usePhotoMode } from "fiber-photo-mode";

const MyComponent = () => {
  const { takeScreenshot, togglePhotoMode } = usePhotoMode();

  const handleClick = async () => {
    const dataUrl = await takeScreenshot();
    console.log("Screenshot ready:", dataUrl);
  };

  return <button onClick={handleClick}>Take Screenshot</button>;
};
```

### Screenshot Options

The `takeScreenshot` function accepts optional configuration:

```jsx
const file = await takeScreenshot({
  width: 1920, // Custom width (default: canvas width)
  height: 1080, // Custom height (default: canvas height)
  format: "jpeg", // 'jpeg' | 'png' | 'webp' | 'avif' (default: 'jpeg')
  quality: 0.95, // Compression quality 0-1 (default: 0.8)
  toFile: true, // Return as File instead of DataURL
});
```

### Using Post-Processing Effects

`<PhotoMode />` includes an integrated `EffectComposer` - any post-processing effects you want to capture must be placed as children of `<PhotoMode>`:

```jsx
import { Canvas } from "@react-three/fiber";
import { PhotoMode } from "fiber-photo-mode";
import { BrightnessContrast, ToneMapping } from "@react-three/postprocessing";

<Canvas>
  <PhotoMode>
    <BrightnessContrast brightness={0} contrast={0.25} />
    <ToneMapping />
  </PhotoMode>
  {/* Your scene */}
</Canvas>;
```

**Important:** These effects passed as children to `<PhotoMode>` will be visible in the canvas at all times, not just in screenshots. If you want effects visible only in photo mode, use the `usePhotoModeEffects` hook instead.

### Built-in Photo Effects

The library includes built-in photo effects that are added to the `EffectComposer` and can be toggled and controlled independently. By default, all effects are enabled **except Bloom** (which is experimental and may cause visual artifacts).

Use the `enabledEffects` prop to configure which built-in effects are added to the effect composer. The `enabledEffects` prop is **optional** - you only need to specify the effects you want to override from the defaults:

```jsx
<PhotoMode
  enabledEffects={{
    bloom: true,  // Enable Bloom (disabled by default)
  }}
  {/* Your effects from react-postprocessing */}
</PhotoMode>
```

**Important distinction:** The `enabledEffects` prop determines which effects are **added to the `EffectComposer`**, not whether they are visible. By default, when effects are added, they are inactive (with zero intensity/values).

To actually see these effects in your canvas and screenshots, you must:

1. **Enable photo mode** using the hook:

```jsx
const { togglePhotoMode } = usePhotoMode();
togglePhotoMode(); // Enables photo mode
```

2. **Set effect values** using the effects hook:

```jsx
const { setEffect } = usePhotoModeEffects();
setEffect("bloom", 2.5);
setEffect("brightness", 0.3);
```

### Controlling Photo Effects

Use the `usePhotoModeEffects` hook to read current effect values and control them:

```jsx
import { usePhotoMode, usePhotoModeEffects } from "fiber-photo-mode";

export function PhotoModeUI() {
  const { brightness, setEffect } = usePhotoModeEffects();

  const { photoModeOn } = usePhotoMode();

  if (!photoModeOn) return null;

  return (
    <>
      <input
        type="range"
        value={brightness}
        onChange={(e) => setEffect("brightness", parseFloat(e.target.value))}
        min={-1}
        max={1}
        step={0.01}
        className="w-full"
      />
  );
}
```

## Available Photo Effects

- **Hue/Saturation** - Adjust color tone and saturation (enabled by default)
- **Brightness/Contrast** - Modify exposure and contrast (enabled by default)
- **Vignette** - Darken edges for a focused look (enabled by default)
- **Chromatic Aberration** - Add RGB color shift for stylized effect (enabled by default)
- **Grain** - Add film grain texture (enabled by default)
- **Bloom** - Add glow to bright areas (disabled by default - experimental)

## Effect Behavior Summary

| Aspect                  | Built-in Photo Effects                   | Custom Effects (as children)        |
| ----------------------- | ---------------------------------------- | ----------------------------------- |
| Added via               | `enabledEffects` prop                    | `<PhotoMode>{children}</PhotoMode>` |
| Visibility              | Only visible in photo mode (when active) | Always visible on canvas            |
| Captured in screenshots | Yes                                      | Yes                                 |
| Togglable               | Yes, via `togglePhotoMode()`             | Always active                       |
| Configurable            | Yes, via `usePhotoModeEffects()`         | Configured directly on component    |

## Features

- 1:1 screenshot of the canvas with accurate camera & viewport
- Built-in photo effects integrated into `<PhotoMode>`
- Capture at custom resolutions, independent of canvas size or pixel ratio
- Easy-to-use hooks for calling screenshots and managing effects from anywhere in your app
- Support for custom post-processing effects as children
- Automatic effect pass management

## License

MIT – free to use, modify, and expand.
