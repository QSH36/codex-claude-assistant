import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";

function SignalRing({ index }: { index: number }) {
  const meshRef = useRef<Mesh>(null);
  const position = useMemo<[number, number, number]>(
    () => [Math.sin(index * 1.7) * 4.5, Math.cos(index * 1.1) * 2.2, -4 - index * 0.18],
    [index],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = clock.elapsedTime * 0.18 + index;
    meshRef.current.rotation.y = clock.elapsedTime * 0.24 + index * 0.3;
  });

  return (
    <Float speed={0.9 + index * 0.04} rotationIntensity={0.24} floatIntensity={0.35}>
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[0.64 + index * 0.045, 0.012, 12, 72]} />
        <meshStandardMaterial color={index % 3 === 0 ? "#1fb6a6" : index % 3 === 1 ? "#6f79ff" : "#f59e0b"} />
      </mesh>
    </Float>
  );
}

function CoreObject() {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.elapsedTime * 0.16;
    meshRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.4) * 0.08;
  });

  return (
    <mesh ref={meshRef} position={[3.2, -0.2, -5.2]}>
      <icosahedronGeometry args={[1.15, 1]} />
      <MeshTransmissionMaterial
        color="#dbeafe"
        thickness={0.35}
        roughness={0.3}
        transmission={0.6}
        chromaticAberration={0.04}
        anisotropy={0.2}
      />
    </mesh>
  );
}

export function LightScene() {
  return (
    <div className="light-scene" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.5]}>
        <color attach="background" args={["#080a0f"]} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 4, 3]} intensity={1.4} />
        <pointLight position={[-4, 2, 1]} color="#22c55e" intensity={5} />
        <CoreObject />
        {Array.from({ length: 18 }).map((_, index) => (
          <SignalRing index={index} key={index} />
        ))}
      </Canvas>
    </div>
  );
}
