import React, { useState } from 'react';

export function SplashVideo({ onComplete }) {
  const [fading, setFading] = useState(false);

  const handleVideoEnd = () => {
    setFading(true);
    // Wait for the fade out transition to complete before unmounting
    setTimeout(onComplete, 1500); 
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0a0a0a',
      zIndex: 100,
      opacity: fading ? 0 : 1,
      transition: 'opacity 1.5s ease-in-out',
      pointerEvents: fading ? 'none' : 'auto', // Disables clicks while fading out
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <video
        src="https://reil.studio/bun/images/bunontherun.mp4"
        autoPlay
        muted // Muted to guarantee autoplay succeeds on most browsers
        playsInline
        onEnded={handleVideoEnd}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover' // Fullscreen immersion without aspect distortion
        }}
      />
    </div>
  );
}
