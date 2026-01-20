# React Fiber Photo Mode

[![Version](https://badgen.net/npm/v/fiber-photo-mode)](https://www.npmjs.com/package/fiber-photo-mode)

PhotoMode / screenshot capture system for [React Three Fiber](https://github.com/pmndrs/react-three-fiber).

⚠️ Warning: Early-stage, experimental – under active development. The API may change in future releases.

## Installation

```sh
npm install fiber-photo-mode
```

## Description

React Fiber Photo Mode makes it easy to take high-quality screenshots of your Three.js / React Three Fiber scenes, including post-processing effects and camera settings.

While it’s technically possible to capture directly from the canvas, fiber-capture lets you:

- Take screenshots at custom resolutions independent of the canvas size
- Override the canvas pixel ratio for better quality (e.g., if your canvas uses a low pixel ratio for performance, the screenshot can still be full-quality)
- Capture scenes with post-processing effects, keeping the same visual fidelity as in the canvas

## Usage

Insert `<PhotoMode />` into your `<Canvas>` and call a hook to capture screenshots anywhere in your app.

```js
import { Canvas } from "@react-three/fiber";
import { PhotoMode } from "fiber-photo-mode";

<Canvas>
  <PhotoMode />
  {/* Your scene, objects, effects */}
</Canvas>;
```

Use the usePhotoMode hook to take a screenshot:

```js
import { usePhotoMode } from "fiber-capture";

const MyComponent = () => {
  const { takeScreenshot } = usePhotoMode();

  const handleClick = async () => {
    const file = await takeScreenshot();
    console.log("Screenshot ready:", file);
  };

  return <button onClick={handleClick}>Take Screenshot</button>;
};
```

⚠️ Important: If you are using EffectComposer from @react-three/postprocessing for post-processing, replace it with `<PhotoModeComposer>` to ensure the screenshot captures all effects correctly.

```js
import { PhotoModeComposer } from "fiber-photo-mode";

function Postprocessing() {
  return (
    <PhotoModeComposer>
      <BrightnessContrast brightness={0} contrast={0.25} />
      <ToneMapping />
    </PhotoModeComposer>
  );
}
```

## Features

- 1:1 screenshot of the canvas with accurate camera & viewport
- Supports FBO and post-processing via PhotoModeComposer
- Capture at custom resolutions, independent of canvas size or pixel ratio
- Easy-to-use hook for calling screenshots from anywhere in your app
- Compatible with post-processing pipelines when using `<PhotoModeComposer>`

## License

MIT – free to use, modify, and expand.
