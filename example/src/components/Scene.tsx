import { Sparkles } from "@react-three/drei";
import { Plane } from "./Plane";

export function Scene() {
  return (
    <group>
      {/* <SpotlightWithTarget targetPos={new Vector3(4.5, 5, 15.6)} lightPos={new Vector3(5.2, 3.8, 14.6)} />
      <SpotlightWithTarget targetPos={new Vector3(2.4, 5, 14)} lightPos={new Vector3(2.8, 3.8, 13)} /> */}
      <Sparkles count={50} scale={[10, 4, 10]} size={1} speed={1} position={[0, 2, 0]} />
      <Plane />
    </group>
  );
}
