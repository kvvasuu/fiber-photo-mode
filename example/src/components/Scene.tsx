import { Sparkles, useProgress } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { degToRad } from "three/src/math/MathUtils.js";
import { useMainStore } from "../store";
import { Crow } from "./Crow";
import { Plane } from "./Plane";
import { PulsingPointLight } from "./PulsingPointLight";
import { TargetedSpotLight } from "./TargetedSpotLight";

export function Scene({ onLoaded }: { onLoaded: () => void }) {
  const { active } = useProgress();
  const initialized = useRef(false);

  const isDay = useMainStore((state) => state.isDay);

  useEffect(() => {
    if (!active && !initialized.current) {
      onLoaded?.();
      initialized.current = true;
    }
  }, [active, onLoaded]);

  return (
    <group>
      <TargetedSpotLight intensity={isDay ? 0 : 6} color={0xfffce6} position={[3, 3.8, 13]} target={[2.4, 4.5, 14]} />
      <TargetedSpotLight
        intensity={isDay ? 0 : 6}
        color={0xfffce6}
        position={[5.2, 3.8, 14.6]}
        target={[4.6, 4.5, 15.6]}
      />
      <PulsingPointLight enabled={!isDay} position={[-1.7, 1, -7]} color="red" speed={3} />

      <Crow position={[1.5, 6.23, 14]} rotation={[0, degToRad(-20), 0]} />
      <Crow position={[-0.648, 1.69, 2]} rotation={[0, degToRad(110), 0]} />
      <Sparkles count={50} scale={[10, 4, 10]} size={1} speed={1} position={[0, 2, 0]} />
      <Plane />
    </group>
  );
}
