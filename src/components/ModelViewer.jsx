import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { ARButton, XR } from '@react-three/xr';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';

function StylizedChair(props) {
  const group = useRef();
  return (
    <group ref={group} {...props} dispose={null}>
      {/* Seat */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 0.2, 1]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 1.2, -0.4]}>
        <boxGeometry args={[1, 1.2, 0.2]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.4, 0.25, 0.4]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0.4, 0.25, 0.4]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[-0.4, 0.25, -0.4]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0.4, 0.25, -0.4]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
    </group>
  );
}

export default function ModelViewer() {
  return (
    <>
      <div style={{ paddingBottom: '12px', display: 'flex', justifyContent: 'center' }}>
        <ARButton className="apply-btn" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer' }} />
      </div>
      <div style={{ width: '100%', height: '320px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
        <Canvas camera={{ position: [2.5, 2.5, 2.5], fov: 50 }}>
          <XR>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <Environment preset="city" />
            <StylizedChair position={[0, -0.5, 0]} />
            <ContactShadows position={[0, -0.5, 0]} opacity={0.5} scale={5} blur={2} far={4} />
            <OrbitControls autoRotate autoRotateSpeed={2.0} enablePan={false} />
          </XR>
        </Canvas>
      </div>
    </>
  );
}
