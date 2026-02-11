import React, { useMemo } from 'react';
import * as THREE from 'three';
import { cyrb53, seededRandom } from '../utils/math';
import ImagePlane from './ImagePlane';
import images from '../data/images.json';

const CHUNK_SIZE = 40;

const Chunk = ({ cx, cy, cz }) => {
    const planes = useMemo(() => {
        const generated = [];
        const seedStr = `${cx}-${cy}-${cz}`;
        let seed = cyrb53(seedStr);

        // Number of planes per chunk
        // 3 to 6 planes
        const count = 3 + Math.floor(seededRandom(seed++) * 4);

        for (let i = 0; i < count; i++) {
            // Position within chunk (0 to CHUNK_SIZE)
            // We want them somewhat distributed but not overlapping too much if possible
            // Using random positions is fine for "messy" infinite canvas

            const px = (seededRandom(seed++) - 0.5) * CHUNK_SIZE; // -20 to 20
            const py = (seededRandom(seed++) - 0.5) * CHUNK_SIZE;
            const pz = (seededRandom(seed++) - 0.5) * CHUNK_SIZE; // Depth variance within chunk

            // Scale variation
            const scale = 5 + seededRandom(seed++) * 8; // 5 to 13 units

            // Asset selection
            const imageIndex = Math.floor(seededRandom(seed++) * images.length);
            const imageUrl = `/images/${images[imageIndex]}`; // Path relative to public

            generated.push({
                key: `${cx}-${cy}-${cz}-${i}`,
                position: [
                    cx * CHUNK_SIZE + px,
                    cy * CHUNK_SIZE + py,
                    cz * CHUNK_SIZE + pz
                ],
                scale: [scale, scale, 1],
                imageUrl
            });
        }
        return generated;
    }, [cx, cy, cz]);

    return (
        <group>
            {planes.map(plane => (
                <ImagePlane
                    key={plane.key}
                    position={plane.position}
                    scale={plane.scale}
                    imageUrl={plane.imageUrl}
                />
            ))}

            {/* Optional: Debug wireframe for chunk boundary */}
            {/* 
            <mesh position={[cx * CHUNK_SIZE, cy * CHUNK_SIZE, cz * CHUNK_SIZE]}>
                <boxGeometry args={[CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE]} />
                <meshBasicMaterial wireframe color="green" transparent opacity={0.1} />
            </mesh>
            */}
        </group>
    );
};

export default Chunk;
