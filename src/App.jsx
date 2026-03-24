import React, { Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei'; // Added Environment
import * as THREE from 'three';
import { FlatGrid } from './components/FlatGrid';

// Global state managed completely outside React to fiercely bypass unnecessary VDOM diffing on the 3D grid
window.gridState = {
  loadedCount: 0,
  totalImages: 1, // Will be mathematically updated by FlatGrid before first mount
  centerLoaded: false,
  allLoaded: false
};

window.updateLoadingUI = () => {
  const el = document.getElementById('loading-overlay-badge');
  const container = document.getElementById('loading-overlay-container');
  if (el && container) {
    if (window.gridState.loadedCount >= window.gridState.totalImages && window.gridState.totalImages > 0) {
      container.style.opacity = '0';
      setTimeout(() => container.style.display = 'none', 500);
      window.gridState.allLoaded = true;
    } else {
      const pct = window.gridState.totalImages > 0 
        ? Math.floor((window.gridState.loadedCount / window.gridState.totalImages) * 100)
        : 0;
      el.innerText = `Loading Gallery... ${pct}%`;
    }
  }
};

function IntroCamera({ onComplete }) {
  const duration = 3.5;
  const elapsedRef = React.useRef(0);
  
  useFrame((state, delta) => {
    // Stage 1: Absolute camera lock on focal center tile while CDN aggressively fetches in background
    if (!window.gridState.allLoaded) {
      state.camera.position.z = 2.5; 
      state.camera.position.x = 0;
      state.camera.position.y = 0; // Mathematically centered precisely on Row 6 (exactly Y=0.0 now!)
      return;
    }

    // Stage 2: 3D Pullback cinematic execution
    // Cap delta at 0.1s to prevent teleporting
    elapsedRef.current += Math.min(delta, 0.1);
    const elapsed = elapsedRef.current;

    const t = Math.min(1.0, elapsed / duration);
    // Cinematic ease-in-out Smoothstep smoothing
    const smoothT = t * t * (3 - 2 * t);

    // Pull back from 2.5 (1 image) to 16.5 (total grid)
    state.camera.position.z = 2.5 + (16.5 - 2.5) * smoothT;
    state.camera.position.y = 0; // Ensure camera remains centered at Y=0.0 during pullback

    if (t >= 1.0) {
      onComplete(); // Triggers the OrbitControls unlock
    }
  });
  
  return null;
}

export default function App() {
  const [introFinished, setIntroFinished] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#0a0a0a' }}>
      {/* UI Overlay layered above WebGL canvas */}
      <div 
        id="loading-overlay-container"
        style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 10,
          transition: 'opacity 0.5s ease-out'
        }}
      >
        <div id="loading-overlay-badge" style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#ffffff',
            padding: '20px 40px',
            borderRadius: '12px',
            fontFamily: 'sans-serif',
            fontSize: '1.2rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)'
        }}>
          Loading Gallery... 0%
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
        <Suspense fallback={null}>
          <Environment preset="city" />
        </Suspense>

        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          
          <FlatGrid />

          {!introFinished ? (
            <IntroCamera onComplete={() => setIntroFinished(true)} />
          ) : (
            <OrbitControls 
              enableZoom={true} 
              enablePan={true} 
              enableRotate={false} 
              maxDistance={16.5}
              minDistance={2.5}
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
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
