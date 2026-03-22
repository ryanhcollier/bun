import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image } from '@react-three/drei';

export function FlatGridRow({ images, rowIndex, numRows, imageHeight, imageWidth, gapY }) {
  const groupRef = useRef();
  
  const horizontalGap = 0.2;
  const spacingX = imageWidth + horizontalGap;
  const totalWidth = images.length * spacingX;
  
  const spacingY = imageHeight + gapY;
  const totalHeight = numRows * spacingY;

  // Center the initial layout so (0,0) is roughly the middle
  const baseY = (totalHeight / 2) - (spacingY / 2) - (rowIndex * spacingY);

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
      });
    }
  });

  return (
    <group ref={groupRef}>
      {images.map((src, index) => (
        <Image
          key={`${index}-${src}`}
          url={src}
          position={[0, 0, 0]} 
          scale={[imageWidth, imageHeight]} 
          transparent
          opacity={1.0}
          toneMapped={false}
          radius={0.05}
        />
      ))}
    </group>
  );
}
