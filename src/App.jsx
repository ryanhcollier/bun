import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { FlatGrid } from './components/FlatGrid';
import { SplashVideo } from './components/SplashVideo';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a', position: 'relative' }}>
      {showSplash && <SplashVideo onComplete={() => setShowSplash(false)} />}
      
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <Suspense fallback={null}>
          <FlatGrid />
        </Suspense>

        <OrbitControls 
          enableRotate={false}
          enablePan={true}
          enableZoom={true}
          minDistance={1.5}
          maxDistance={16.5}
          mouseButtons={{
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.NONE
          }}
          touches={{
            ONE: THREE.TOUCH.PAN,
            TWO: THREE.TOUCH.DOLLY_PAN
          }}
        />
      </Canvas>
    </div>
  );
}
