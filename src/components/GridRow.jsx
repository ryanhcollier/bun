import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image } from '@react-three/drei';
import * as THREE from 'three';

export function GridRow({ images, y, radius, direction, speed = 0.05, imageWidth, imageHeight }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * speed * direction;
    }
  });

  const angleSpacing = (Math.PI * 2) / images.length;

  return (
    <group ref={groupRef} position={[0, y, 0]}>
      {images.map((src, index) => {
        const angle = index * angleSpacing;
        // The center of the cylinder is 0,0,0
        // We place the image on the perimeter using Math.sin/cos.
        // angle = 0 means x=0, z=radius.
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        
        return (
          <Image
            key={`${index}-${src}`}
            url={src}
            position={[x, 0, z]}
            rotation={[0, angle, 0]}
            scale={[imageWidth, imageHeight]} 
            transparent
            opacity={1.0}
            toneMapped={true}
            // slight rounding on corners makes it premium
            radius={0.05}
          />
        );
      })}
    </group>
  );
}
