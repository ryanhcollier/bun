import React, { Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { FlatGrid } from './components/FlatGrid';

function IntroCamera({ onComplete }) {
  const duration = 3.5;
  const startDelay = 1.5;
  const elapsedRef = React.useRef(0);
  
  useFrame((state, delta) => {
    // Cap delta at 0.1s to prevent teleporting when WebGL shaders compile and freeze the main thread
    elapsedRef.current += Math.min(delta, 0.1);
    const elapsed = elapsedRef.current;
    
    if (elapsed < startDelay) return;
    
    const animationElapsed = elapsed - startDelay;
    const t = Math.min(1.0, animationElapsed / duration);
    // Cinematic ease-in-out Smoothstep smoothing
    const smoothT = t * t * (3 - 2 * t);
    
    // Pull back from 5.3 (3x3 grid) to 16.5 (8-row grid)
    state.camera.position.z = 5.3 + (16.5 - 5.3) * smoothT;
    
    if (t >= 1.0) {
      onComplete(); // Triggers the OrbitControls unlock
    }
  });
  
  return null;
}

export default function App() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 5.3], fov: 45 }}>
        {!introDone && <IntroCamera onComplete={() => setIntroDone(true)} />}
        <Suspense fallback={null}>
          <FlatGrid />
        </Suspense>

        <OrbitControls 
          enabled={introDone}
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
