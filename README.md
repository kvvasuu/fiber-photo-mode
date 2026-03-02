# Fiber Photo Mode

[![Version](https://badgen.net/npm/v/fiber-photo-mode)](https://www.npmjs.com/package/fiber-photo-mode)

Photo Mode and screenshot capture system with post-processing effects for [React Three Fiber](https://github.com/pmndrs/react-three-fiber).

Demo: [https://kvvasuu.github.io/fiber-photo-mode/](https://kvvasuu.github.io/fiber-photo-mode/)

⚠️ Early-stage, experimental – API may change in future releases.

## Description

**Fiber Photo Mode** makes it easy to take high-quality screenshots from your React Three Fiber scene with full post-processing and camera settings.
It is designed for realism: camera parameters like aperture, focal length, and focus distance are used, mimicking real-world photography.
Features include:

- Take screenshots at custom resolutions independent of the canvas size
- Override the canvas pixel ratio for better quality (e.g., if your canvas uses a low pixel ratio for performance, the screenshot can still be full-quality)
- Built-in photo effects: Bloom, Vignette, Chromatic Aberration, Grain, and more

## Quickstart

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

## Documentation & Examples

More examples, API docs, and tutorials available here - https://github.com/kvvasuu/fiber-photo-mode/wiki

## License

MIT – free to use, modify, and expand.
