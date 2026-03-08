import { Environment } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { easing } from "maath";
import { useRef } from "react";
import { useMainStore } from "../store";

export default function AnimatenEnvironment() {
  const scene = useThree((state) => state.scene);

  const isDay = useMainStore((state) => state.isDay);

  const values = useRef({
    env: 1.5,
    background: 1,
  });

  useFrame((_, delta) => {
    const target = isDay ? { env: 1.5, background: 1 } : { env: 0.02, background: 0.001 };

    easing.damp(values.current, "env", target.env, 0.4, delta);
    easing.damp(values.current, "background", target.background, 0.4, delta);

    scene.environmentIntensity = values.current.env;
    scene.backgroundIntensity = values.current.background;
  });

  return (
    <Environment
      preset="sunset"
      background
      blur={0.5}
      frames={1}
      environmentIntensity={1.5}
      backgroundIntensity={1}
      backgroundRotation={[0, -Math.PI / 1.3, 0]}
    />
  );
}
