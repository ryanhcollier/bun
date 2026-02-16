import React, { useState } from 'react';

const Tile = ({ src, alt, x, y, size }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                transform: `translate(${x}px, ${y}px)`,
                width: size,
                height: size,
                padding: '10px', // Gap
                boxSizing: 'border-box',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                // Debug border: border: '1px solid #333' 
            }}
        >
            {!error ? (
                <img
                    src={src}
                    alt={alt}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: loaded ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                />
            ) : (
                <div style={{ width: '100%', height: '100%', background: '#eee', borderRadius: '8px' }} />
            )}
        </div>
    );
};

export default React.memo(Tile);
