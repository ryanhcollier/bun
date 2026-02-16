import React, { useState, useEffect } from 'react';
import Gallery from './components/Gallery';
import Lightbox from './components/Lightbox';

function App() {
  const [images, setImages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    fetch('/images.json')
      .then(res => res.json())
      .then(setImages)
      .catch(console.error);
  }, []);

  const openLightbox = (index) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const showNext = () => {
    setSelectedIndex(prev => (prev + 1) % images.length);
  };

  const showPrev = () => {
    setSelectedIndex(prev => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="App">
      <h1 style={{ textAlign: 'center', color: '#333', marginTop: '2rem', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1rem' }}>_bunworld</h1>
      <Gallery images={images} onImageClick={openLightbox} />

      {selectedIndex !== null && (
        <Lightbox
          image={images[selectedIndex]}
          onClose={closeLightbox}
          onNext={showNext}
          onPrev={showPrev}
        />
      )}
    </div>
  );
}

export default App;
