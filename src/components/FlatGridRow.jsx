import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image } from '@react-three/drei';

function LazyGridImage({ src, imageWidth, imageHeight, activationDelay }) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Mount the React Suspense Image slightly before the animation reaches it so it is fully pre-loaded in VRAM
    const preLoadDelay = Math.max(0, (activationDelay - 0.4) * 1000);
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, preLoadDelay);
    
    return () => clearTimeout(timer);
  }, [activationDelay]);

  return (
    <group>
      {shouldLoad && (
        <Image
          url={`/remote-assets${src.replace('/images', '')}`}
          scale={[imageWidth, imageHeight]} 
          transparent
          opacity={1.0}
          toneMapped={false}
          radius={0.05}
        />
      )}
    </group>
  );
}

export function FlatGridRow({ images, rowIndex, numRows, imageHeight, imageWidth, gapY }) {
  const groupRef = useRef();
  
  const horizontalGap = 0.2;
  const spacingX = imageWidth + horizontalGap;
  const totalWidth = images.length * spacingX;
  
  const spacingY = imageHeight + gapY;
  const totalHeight = numRows * spacingY;

  // Center the initial layout so (0,0) is roughly the middle
  const baseY = (totalHeight / 2) - (spacingY / 2) - (rowIndex * spacingY);

  // Calculate static Y position expected at origin for lazy-loading distance logic
  let originWrappedY = baseY % totalHeight;
  if (originWrappedY > totalHeight / 2) originWrappedY -= totalHeight;
  if (originWrappedY < -totalHeight / 2) originWrappedY += totalHeight;

  useFrame((state) => {
    const camX = state.camera.position.x;
    const camY = state.camera.position.y;
    
    if (groupRef.current) {
      // 1. Wrap the entire row's Y position
      let relativeY = baseY - camY;
      let wrappedY = relativeY % totalHeight;
      if (wrappedY > totalHeight / 2) wrappedY -= totalHeight;
      if (wrappedY < -totalHeight / 2) wrappedY += totalHeight;
      
      groupRef.current.position.y = camY + wrappedY;

      // 2. Wrap each child image's X position dynamically
      groupRef.current.children.forEach((child, i) => {
        const baseX = i * spacingX;
        let relativeX = baseX - camX;
        
        let wrappedX = relativeX % totalWidth;
        if (wrappedX > totalWidth / 2) wrappedX -= totalWidth;
        if (wrappedX < -totalWidth / 2) wrappedX += totalWidth;
        
        child.position.x = camX + wrappedX;

        // Intro Spring Animation Math
        const distanceToCenter = Math.sqrt(wrappedX * wrappedX + wrappedY * wrappedY);
        
        // 0.15s staggering delay per physical unit of distance outward from the center
        const activationDelay = distanceToCenter * 0.18;
        const introElapsed = state.clock.elapsedTime;
        
        if (introElapsed < activationDelay) {
          // Completely hidden before activation triggers
          child.visible = false;
          child.scale.set(0.001, 0.001, 1);
        } else {
          child.visible = true;
          const t = introElapsed - activationDelay;
          if (t < 1.0) {
            // Procedural bouncy spring formula
            const scaleAnim = 1 - Math.exp(-8 * t) * Math.cos(12 * t);
            const currentScale = Math.max(0.001, scaleAnim);
            
            // The outer group manages the uniform scale multiplier, inner Image retains aspect mapping
            child.scale.set(currentScale, currentScale, 1);
          } else {
            // Settle exactly at target mathematically
            child.scale.set(1, 1, 1);
          }
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {images.map((src, index) => {
        const baseX = index * spacingX;
        let originWrappedX = baseX % totalWidth;
        if (originWrappedX > totalWidth / 2) originWrappedX -= totalWidth;
        if (originWrappedX < -totalWidth / 2) originWrappedX += totalWidth;
        
        const staticDistanceToCenter = Math.sqrt(originWrappedX * originWrappedX + originWrappedY * originWrappedY);
        const activationDelay = staticDistanceToCenter * 0.18;

        return (
          <LazyGridImage
            key={`${index}-${src}`}
            src={src}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            activationDelay={activationDelay}
          />
        );
      })}
    </group>
  );
}
