import { Sparkles } from "@react-three/drei";
import { degToRad } from "three/src/math/MathUtils.js";
import { Crow } from "./Crow";
import { Plane } from "./Plane";

export function Scene() {
  return (
    <group>
      {/* <SpotlightWithTarget targetPos={new Vector3(4.5, 5, 15.6)} lightPos={new Vector3(5.2, 3.8, 14.6)} />
      <SpotlightWithTarget targetPos={new Vector3(2.4, 5, 14)} lightPos={new Vector3(2.8, 3.8, 13)} /> */}
      <Crow position={[1.5, 6.23, 14]} rotation={[0, degToRad(-20), 0]} />
      <Crow position={[-0.648, 1.69, 2]} rotation={[0, degToRad(110), 0]} />
      <Sparkles count={50} scale={[10, 4, 10]} size={1} speed={1} position={[0, 2, 0]} />
      <Plane />
    </group>
  );
}
