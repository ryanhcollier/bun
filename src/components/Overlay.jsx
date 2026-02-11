import React from 'react';

const Overlay = () => {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            paddingTop: '40px',
            textAlign: 'center',
            pointerEvents: 'none', // Allow clicks to pass through to canvas
            zIndex: 10
        }}>
            <h1 style={{
                margin: 0,
                color: '#333333',
                fontSize: '24pt', // User requested 24pt
                fontWeight: 'bold', // Assuming bold for title, or normal? "dark grey text and 24pt font"
                fontFamily: "'Inter', sans-serif" // Match index.css
            }}>
                _bunworld
            </h1>
        </div>
    );
};

export default Overlay;
