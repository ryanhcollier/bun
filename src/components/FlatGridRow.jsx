import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image } from '@react-three/drei';

function LazyGridImage({ src, imageWidth, imageHeight, activationDelay }) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Give the network 1.5 seconds of headstart to fetch the texture into VRAM before the physical animation spring reaches it
    const preLoadDelay = Math.max(0, (activationDelay - 1.5) * 1000);
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, preLoadDelay);
    
    return () => clearTimeout(timer);
  }, [activationDelay]);

  return (
    <group>
      {shouldLoad ? (
        // The fallback is a visible dark grey shape so the bouncy spring animation plays smoothly even if the texture is still loading over a slow network connection
        <Suspense fallback={<mesh scale={[imageWidth, imageHeight]}><planeGeometry /><meshBasicMaterial color="#444444" toneMapped={false} /></mesh>}>
          <Image
            url={`/remote-assets${src.replace('/images', '')}`}
            scale={[imageWidth, imageHeight]} 
            transparent
            opacity={1.0}
            toneMapped={false}
            radius={0.05}
          />
        </Suspense>
      ) : (
        <mesh scale={[imageWidth, imageHeight]} visible={false}>
          <planeGeometry />
          <meshBasicMaterial />
        </mesh>
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

  const elapsedRef = useRef(0);

  useFrame((state, delta) => {
    // Cap delta at 0.1s to prevent teleporting when WebGL shaders compile and freeze the main thread
    elapsedRef.current += Math.min(delta, 0.1);
    const introElapsed = elapsedRef.current;
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

        // Intro Procedural Spiral Math
        const distanceToCenter = Math.sqrt(wrappedX * wrappedX + wrappedY * wrappedY);
        const angle = Math.atan2(wrappedY, wrappedX);
        const normalizedAngle = (angle + Math.PI) / (Math.PI * 2);

        // 1.5 second global delay un-freezes JS to aggressively pre-fetch textures without clock interference
        const GLOBAL_START_DELAY = 1.5;
        // Radial distance creates rings, angle offsets sequential delays around the ring to create a 1-by-1 continuous spiral
        const activationDelay = GLOBAL_START_DELAY + (distanceToCenter * 0.18) + (normalizedAngle * 0.16);
        
        if (introElapsed < activationDelay) {
          // Keep it logically visible but physically scaled to zero so it pops-in exactly on its spiral frame
          child.visible = true;
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
        const angle = Math.atan2(originWrappedY, originWrappedX);
        const normalizedAngle = (angle + Math.PI) / (Math.PI * 2);
        
        const GLOBAL_START_DELAY = 1.5;
        const activationDelay = GLOBAL_START_DELAY + (staticDistanceToCenter * 0.18) + (normalizedAngle * 0.16);

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
