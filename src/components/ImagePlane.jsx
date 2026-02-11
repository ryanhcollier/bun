import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { lerp } from '../utils/math';

const CHUNK_SIZE = 40; // Must match Chunk.jsx
const RENDER_DISTANCE = 1; // In chunks (radius)
const CHUNK_FADE_MARGIN = 0.5; // Smooth fade margin
const INVIS_THRESHOLD = 0.01;

const ImagePlane = ({ position, scale, imageUrl, cam }) => {
    const meshRef = useRef();
    const materialRef = useRef();
    const texture = useTexture(imageUrl);
    const [opacity, setOpacity] = useState(0);
    const mountTime = useRef(Date.now());

    // Initial buildup
    const [revealed, setRevealed] = useState(false);

    useFrame((state, delta) => {
        if (!meshRef.current || !materialRef.current) return;

        // Calculate distances for fading
        // We need the current camera position in chunk coordinates to determine "Grid Distance"
        // But for smoothness we also want actual physical distance

        // Simplified Logic: 
        // 1. Distance from camera (Z-depth mostly, but also XY)
        // 2. We want a "fog" effect where things far away fade out

        const worldPos = meshRef.current.getWorldPosition(new THREE.Vector3());
        const distToCam = worldPos.distanceTo(state.camera.position);

        // Fade based on distance
        // Visible range: 0 to ~60 (1.5 chunks)
        const FADE_START = 30;
        const FADE_END = 70;

        let targetOpacity = 1;
        if (distToCam > FADE_START) {
            targetOpacity = 1 - Math.min(1, (distToCam - FADE_START) / (FADE_END - FADE_START));
        }

        // Initial Load / Mount Fade
        // 2.5 seconds simple ramp
        const elapsed = (Date.now() - mountTime.current) / 1000;
        const enterFade = Math.min(1, elapsed / 2.5);
        targetOpacity *= enterFade;

        // Smooth transition
        const newOpacity = lerp(opacity, targetOpacity, 0.1);
        setOpacity(newOpacity);

        materialRef.current.opacity = newOpacity;
        materialRef.current.transparent = true; // Always transparent for fade
        materialRef.current.depthWrite = newOpacity > 0.9; // Optimize: only write depth when opaque
        meshRef.current.visible = newOpacity > INVIS_THRESHOLD;
    });

    // Aspect ratio correction (assume image is roughly 16:9 or similar, texture loading handles actual mapping)
    // To minimize distortion, we can just use the scale provided by logic

    const ratio = 1000 / 545;
    const baseScale = Array.isArray(scale) ? scale[1] : scale;
    const finalScale = [baseScale * ratio, baseScale, 1];

    return (
        <mesh ref={meshRef} position={position} scale={finalScale}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial ref={materialRef} map={texture} transparent={true} />
        </mesh>
    );
};

export default ImagePlane;
