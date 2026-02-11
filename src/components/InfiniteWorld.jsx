import React, { useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import Chunk from './Chunk';

const CHUNK_SIZE = 40;
// We render a 3x3x3 grid around the camera
// Neighborhood size = 1 means [-1, 0, 1] offsets.
const NEIGHBORHOOD = 1;

const InfiniteWorld = () => {
    const [chunks, setChunks] = useState([]);
    const currentCoords = React.useRef({ cx: 0, cy: 0, cz: 0 });

    useFrame((state) => {
        // Determine current chunk based on camera position
        const camX = state.camera.position.x;
        const camY = state.camera.position.y;
        const camZ = state.camera.position.z;

        const cx = Math.floor(camX / CHUNK_SIZE);
        const cy = Math.floor(camY / CHUNK_SIZE);
        const cz = Math.floor(camZ / CHUNK_SIZE);

        // Check if we need to update chunks
        if (currentCoords.current.cx !== cx ||
            currentCoords.current.cy !== cy ||
            currentCoords.current.cz !== cz) {

            currentCoords.current = { cx, cy, cz };
            updateChunks(cx, cy, cz);
        }
    });

    const updateChunks = (cx, cy, cz) => {
        const newChunks = [];
        for (let x = -NEIGHBORHOOD; x <= NEIGHBORHOOD; x++) {
            for (let y = -NEIGHBORHOOD; y <= NEIGHBORHOOD; y++) {
                for (let z = -NEIGHBORHOOD; z <= NEIGHBORHOOD; z++) {
                    newChunks.push({
                        id: `${cx + x},${cy + y},${cz + z}`,
                        cx: cx + x,
                        cy: cy + y,
                        cz: cz + z
                    });
                }
            }
        }
        setChunks(newChunks);
    };

    // Initial load
    useEffect(() => {
        updateChunks(0, 0, 0);
    }, []);

    return (
        <group>
            {chunks.map(chunk => (
                <Chunk
                    key={chunk.id}
                    cx={chunk.cx}
                    cy={chunk.cy}
                    cz={chunk.cz}
                />
            ))}
        </group>
    );
};

export default InfiniteWorld;
