import { Sparkles } from "@react-three/drei";
import { degToRad } from "three/src/math/MathUtils.js";
import { Crow } from "./Crow";
import { Plane } from "./Plane";

export function Scene() {
  return (
    <group>
      <Crow position={[1.5, 6.23, 14]} rotation={[0, degToRad(-20), 0]} />
      <Crow position={[-0.648, 1.69, 2]} rotation={[0, degToRad(110), 0]} />
      <Sparkles count={50} scale={[10, 4, 10]} size={1} speed={1} position={[0, 2, 0]} />
      <Plane />
    </group>
  );
}
