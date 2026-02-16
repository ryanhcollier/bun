import React, { useEffect } from 'react';

const Lightbox = ({ image, onClose, onNext, onPrev }) => {

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') onNext();
            if (e.key === 'ArrowLeft') onPrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onNext, onPrev]);

    if (!image) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(0,0,0,0.95)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
            }}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute', top: 20, right: 20,
                    background: 'transparent', border: 'none', color: 'white',
                    fontSize: '30px', cursor: 'pointer', zIndex: 1002
                }}
            >
                &times;
            </button>

            {/* Click Zones */}
            {/* Left Zone (Prev) */}
            <div
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                style={{
                    position: 'absolute', top: 0, left: 0, width: '50%', height: '100%',
                    cursor: 'w-resize', zIndex: 1001
                }}
                title="Previous Image"
            />

            {/* Right Zone (Next) */}
            <div
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                style={{
                    position: 'absolute', top: 0, right: 0, width: '50%', height: '100%',
                    cursor: 'e-resize', zIndex: 1001
                }}
                title="Next Image"
            />

            {/* Image */}
            <img
                src={image.path}
                alt={image.fileName}
                style={{
                    maxWidth: '90%',
                    maxHeight: '90%',
                    objectFit: 'contain',
                    pointerEvents: 'none', // Let clicks pass through to zones (or separate img from zones)
                    zIndex: 1000 // Below zones? No, if we want zones to handle clicks, they must be on top.
                    // But if zones cover the image, we can't right click save?
                    // User requested "click to the right to go next".
                    // Usually this means the zones cover the screen.
                }}
            />
        </div>
    );
};

export default Lightbox;
