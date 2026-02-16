import React from 'react';

const Gallery = ({ images, onImageClick }) => {
    return (
        <div style={{
            columnCount: 5,
            columnGap: '1rem',
            padding: '1rem'
        }}>
            {images.map((image, index) => (
                <div
                    key={index}
                    style={{ breakInside: 'avoid', marginBottom: '1rem', cursor: 'pointer' }}
                    onClick={() => onImageClick(index)}
                >
                    <img
                        src={image.path}
                        alt={image.fileName}
                        style={{ width: '100%', display: 'block', borderRadius: '4px' }}
                        loading="lazy"
                    />
                </div>
            ))}
            <style>{`
                @media (max-width: 800px) { div[style*="column-count"] { column-count: 2 !important; } }
                @media (max-width: 500px) { div[style*="column-count"] { column-count: 1 !important; } }
            `}</style>
        </div>
    );
};

export default Gallery;
