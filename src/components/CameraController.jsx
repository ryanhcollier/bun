import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { lerp } from '../utils/math';

const VELOCITY_DECAY = 0.90;
const VELOCITY_LERP = 0.15;
const MOUSE_SENSITIVITY = 0.05;
const SCROLL_SENSITIVITY = 0.02;

const CameraController = () => {
    const { camera, gl } = useThree();

    // State references (mutable to avoid re-renders)
    const state = useRef({
        isDragging: false,
        lastMouse: { x: 0, y: 0 },
        targetVelocity: new THREE.Vector3(),
        currentVelocity: new THREE.Vector3(),
        targetScrollVelocity: 0,
    });

    useEffect(() => {
        const domElement = gl.domElement;

        const onPointerDown = (e) => {
            state.current.isDragging = true;
            state.current.lastMouse = { x: e.clientX, y: e.clientY };
            domElement.setPointerCapture(e.pointerId);
            domElement.style.cursor = 'grabbing';
        };

        const onPointerUp = (e) => {
            state.current.isDragging = false;
            domElement.releasePointerCapture(e.pointerId);
            domElement.style.cursor = 'grab';
        };

        const onPointerMove = (e) => {
            if (!state.current.isDragging) return;

            const dx = e.clientX - state.current.lastMouse.x;
            const dy = e.clientY - state.current.lastMouse.y;

            // Pan logic: dragging left moves camera right (world moves left)
            // So we subtract dx from position, which means adding to velocity if we want "force"
            // Actually let's do: Dragging moves the world.
            // Drag Left -> World moves Left -> Camera moves Right?
            // "Pan Anywhere": usually drag = move viewport. Drag Left = Viewport moves Left = Camera moves Left.

            state.current.targetVelocity.x -= dx * MOUSE_SENSITIVITY;
            state.current.targetVelocity.y += dy * MOUSE_SENSITIVITY; // Invert Y for screen coords? Screen Y down, World Y up.
            // Drag down (positive dy) -> Camera moves up (positive Y) usually feels intuitive for "grabbing space"
            // Wait, "Grabbing space" means if I drag down, the space moves down. Camera moves UP.

            state.current.lastMouse = { x: e.clientX, y: e.clientY };
        };

        const onWheel = (e) => {
            e.preventDefault();
            // Scroll down (positive deltaY) -> Zoom out (Camera Z increases)
            // Scroll up (negative deltaY) -> Zoom in (Camera Z decreases)
            state.current.targetVelocity.z += e.deltaY * SCROLL_SENSITIVITY;
        };

        const onContextMenu = (e) => e.preventDefault();

        domElement.addEventListener('pointerdown', onPointerDown);
        domElement.addEventListener('pointerup', onPointerUp);
        domElement.addEventListener('pointermove', onPointerMove);
        domElement.addEventListener('wheel', onWheel, { passive: false });
        domElement.addEventListener('contextmenu', onContextMenu);

        domElement.style.cursor = 'grab';

        return () => {
            domElement.removeEventListener('pointerdown', onPointerDown);
            domElement.removeEventListener('pointerup', onPointerUp);
            domElement.removeEventListener('pointermove', onPointerMove);
            domElement.removeEventListener('wheel', onWheel);
            domElement.removeEventListener('contextmenu', onContextMenu);
        };
    }, [gl]);

    useFrame(() => {
        // Inertia Logic
        const s = state.current;

        // Lerp velocities
        s.currentVelocity.lerp(s.targetVelocity, VELOCITY_LERP);

        // Apply position
        camera.position.add(s.currentVelocity);

        // Decay target
        s.targetVelocity.multiplyScalar(VELOCITY_DECAY);

        // Minimal stop
        if (s.targetVelocity.lengthSq() < 0.0001) s.targetVelocity.set(0, 0, 0);
    });

    return null;
};

export default CameraController;
