import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import InfiniteWorld from './components/InfiniteWorld';
import Overlay from './components/Overlay';
import CameraController from './components/CameraController';
import { Stats } from '@react-three/drei';

function App() {
  return (
    <>
      <Overlay />
      <Canvas
        camera={{ position: [0, 0, 0], fov: 60 }}
        dpr={[1, 2]} // Performance optimization
        gl={{
          antialias: false,
          powerPreference: 'high-performance'
        }}
      >
        <color attach="background" args={['#fafafa']} />

        <Suspense fallback={null}>
          <InfiniteWorld />
        </Suspense>

        <CameraController />

        {/* <Stats /> */}  {/* Uncomment for FPS stats */}
      </Canvas>
    </>
  );
}

export default App;
