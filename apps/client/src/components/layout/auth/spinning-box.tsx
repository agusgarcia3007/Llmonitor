import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";

interface SpinningBoxProps {
  scale: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export function SpinningBox({ scale, ...props }: SpinningBoxProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  useCursor(hovered);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x = ref.current.rotation.y += delta;
    }
  });
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? scale * 1.4 : scale * 1.2}
      onClick={() => click(!clicked)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
    >
      <boxGeometry />
      <meshStandardMaterial color={"#2b7fff"} />
    </mesh>
  );
}
