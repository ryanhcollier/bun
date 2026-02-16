import React, { useState, useEffect, useRef, useMemo } from 'react';
import Tile from './Tile';

const InfiniteGrid = ({ images }) => {
    const containerRef = useRef(null);
    const contentRef = useRef(null);

    // Physics state
    const state = useRef({
        x: 0,
        y: 0,
        scale: 1,

        targetScale: 1,

        vx: 0,
        vy: 0,

        isDragging: false,
        lastMouseX: 0,
        lastMouseY: 0,

        // Circular buffer for velocity smoothing
        dragHistory: []
    });

    const lastRenderPos = useRef({ col: 0, row: 0, scale: 1 });

    const [viewportIndices, setViewportIndices] = useState({
        startCol: 0, endCol: 0, startRow: 0, endRow: 0
    });

    // Unused but keeping for resize re-renders
    const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    const CELL_SIZE = 300;
    const FRICTION = 0.95; // Higher friction for "gliding" feel
    const ZOOM_DAMPING = 0.15; // Slightly tighter zoom
    const MIN_SCALE = 1;
    const MAX_SCALE = 5;

    useEffect(() => {
        const handleResize = () => setViewportSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        const content = contentRef.current;
        if (!container || !content) return;

        let animationFrameId;

        const updatePhysics = () => {
            const s = state.current;

            // 1. Inertia
            if (!s.isDragging) {
                s.x += s.vx;
                s.y += s.vy;
                s.vx *= FRICTION;
                s.vy *= FRICTION;

                if (Math.abs(s.vx) < 0.05) s.vx = 0;
                if (Math.abs(s.vy) < 0.05) s.vy = 0;
            }

            // 2. Smooth Zoom
            if (Math.abs(s.targetScale - s.scale) > 0.001) {
                const oldScale = s.scale;
                const newScale = oldScale + (s.targetScale - oldScale) * ZOOM_DAMPING;

                // Zoom Centering
                if (s.zoomPoint) {
                    const { screenX, screenY, worldX, worldY } = s.zoomPoint;

                    // The math: We want the world point to remain at the screen point.
                    // screenX = x + worldX * scale
                    // x = screenX - worldX * scale

                    // However, 'worldX' assumed the *old* transform.
                    // If we just use the captured world coordinate, it should work:

                    s.x = screenX - worldX * newScale;
                    s.y = screenY - worldY * newScale;
                }

                s.scale = newScale;
            }

            // 3. Render
            content.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) scale(${s.scale})`;

            // 4. Update React
            updateVisibleTiles(s.x, s.y, s.scale);

            animationFrameId = requestAnimationFrame(updatePhysics);
        };

        const updateVisibleTiles = (x, y, scale) => {
            const worldLeft = -x / scale;
            const worldTop = -y / scale;
            const centerCol = Math.floor(worldLeft / CELL_SIZE);
            const centerRow = Math.floor(worldTop / CELL_SIZE);

            const distCol = Math.abs(centerCol - lastRenderPos.current.col);
            const distRow = Math.abs(centerRow - lastRenderPos.current.row);
            const distScale = Math.abs(scale - lastRenderPos.current.scale);

            if (distCol >= 1 || distRow >= 1 || distScale > 0.2) {
                const viewW = window.innerWidth;
                const viewH = window.innerHeight;

                const startX = -x / scale;
                const startY = -y / scale;
                const endX = (viewW - x) / scale;
                const endY = (viewH - y) / scale;

                const startCol = Math.floor(startX / CELL_SIZE);
                const endCol = Math.ceil(endX / CELL_SIZE);
                const startRow = Math.floor(startY / CELL_SIZE);
                const endRow = Math.ceil(endY / CELL_SIZE);

                setViewportIndices({ startCol, endCol, startRow, endRow });
                lastRenderPos.current = { col: centerCol, row: centerRow, scale: scale };
            }
        };

        updatePhysics();


        // --- EVENTS ---
        const handleWheel = (e) => {
            e.preventDefault();
            const s = state.current;

            if (e.ctrlKey || Math.abs(e.deltaY) > Math.abs(e.deltaX) * 2) {
                // ZOOM
                const zoomIntensity = 0.0015;
                const delta = -e.deltaY * zoomIntensity;
                const newTarget = Math.max(MIN_SCALE, Math.min(MAX_SCALE, s.targetScale + delta * s.targetScale));

                s.targetScale = newTarget;

                // Capture zoom anchor
                const rect = container.getBoundingClientRect();
                const screenX = e.clientX - rect.left;
                const screenY = e.clientY - rect.top;

                // Calculate world point under cursor *at this moment*
                const worldX = (screenX - s.x) / s.scale;
                const worldY = (screenY - s.y) / s.scale;

                s.zoomPoint = { screenX, screenY, worldX, worldY };

            } else {
                // PAN
                s.vx -= e.deltaX * 0.5;
                s.vy -= e.deltaY * 0.5;
                s.isDragging = false; // Ensure inertia runs
            }
        };

        const handleMouseDown = (e) => {
            const s = state.current;
            s.isDragging = true;
            s.lastMouseX = e.clientX;
            s.lastMouseY = e.clientY;
            s.vx = 0;
            s.vy = 0;
            s.dragHistory = []; // Reset history
            container.style.cursor = 'grabbing';

            // Lock zoom target to current to stop drift if interrupting zoom
            s.targetScale = s.scale;
        };

        const handleMouseMove = (e) => {
            const s = state.current;
            if (!s.isDragging) return;

            const dx = e.clientX - s.lastMouseX;
            const dy = e.clientY - s.lastMouseY;

            s.lastMouseX = e.clientX;
            s.lastMouseY = e.clientY;

            s.x += dx;
            s.y += dy;

            // Add to history
            const now = performance.now();
            s.dragHistory.push({ dx, dy, time: now });

            // Keep last ~100ms
            s.dragHistory = s.dragHistory.filter(h => now - h.time < 100);
        };

        const handleMouseUp = () => {
            const s = state.current;
            s.isDragging = false;
            container.style.cursor = 'grab';

            // Calculate throw velocity from history
            if (s.dragHistory.length > 0) {
                const sum = s.dragHistory.reduce((acc, h) => ({ dx: acc.dx + h.dx, dy: acc.dy + h.dy }), { dx: 0, dy: 0 });
                // Average per event is okay, but sum is better for "impulse" if frame rate varies?
                // Actually, just taking the last few moves sum is a decent approximation of velocity per frame
                // if we normalize. 

                // Simple average velocity per frame of the recorded history
                const avgDx = sum.dx / s.dragHistory.length;
                const avgDy = sum.dy / s.dragHistory.length;

                // Boost it slightly for feel
                s.vx = avgDx * 1.5;
                s.vy = avgDy * 1.5;
            }
            s.dragHistory = [];
        };

        const handleTouchStart = (e) => { if (e.touches.length === 1) handleMouseDown(e.touches[0]); }
        const handleTouchMove = (e) => { if (e.touches.length === 1) handleMouseMove(e.touches[0]); }
        const handleTouchEnd = (e) => { handleMouseUp(); }


        container.addEventListener('wheel', handleWheel, { passive: false });
        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);


        return () => {
            cancelAnimationFrame(animationFrameId);
            container.removeEventListener('wheel', handleWheel);
            container.removeEventListener('mousedown', handleMouseDown);
            container.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    const visibleTiles = useMemo(() => {
        if (!images || images.length === 0) return [];
        const tiles = [];
        const buffer = 2;

        for (let row = viewportIndices.startRow - buffer; row <= viewportIndices.endRow + buffer; row++) {
            for (let col = viewportIndices.startCol - buffer; col <= viewportIndices.endCol + buffer; col++) {
                let index = Math.abs((col + row * 7) % images.length);
                if (Number.isNaN(index)) index = 0;

                const image = images[index];
                if (!image) continue;

                tiles.push({
                    key: `${col}-${row}`,
                    x: col * CELL_SIZE,
                    y: row * CELL_SIZE,
                    src: image.path,
                    alt: image.fileName
                });
            }
        }
        return tiles;
    }, [viewportIndices, images]);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                background: '#000',
                cursor: 'grab',
                position: 'relative',
                touchAction: 'none'
            }}
        >
            <div
                ref={contentRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    transformOrigin: '0 0',
                    willChange: 'transform',
                }}
            >
                {visibleTiles.map(tile => (
                    <Tile
                        key={tile.key}
                        x={tile.x}
                        y={tile.y}
                        size={CELL_SIZE}
                        src={tile.src}
                        alt={tile.alt}
                    />
                ))}
            </div>

            <div style={{
                position: 'fixed',
                top: 20,
                left: 20,
                pointerEvents: 'none',
                color: '#fff',
                fontFamily: 'monospace',
                fontSize: '14px',
                textTransform: 'uppercase',
                mixBlendMode: 'difference'
            }}>
                PLANES: {images.length}<br />
                ZOOM: {state.current?.scale?.toFixed(2) || '1.00'}
            </div>
        </div>
    );
};

export default InfiniteGrid;
