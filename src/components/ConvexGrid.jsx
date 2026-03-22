import React, { useMemo } from 'react';
import { GridRow } from './GridRow';
import imageList from '../imageList.json';

// Utility to chunk array
const chunkArray = (array, size) => {
  const chunked_arr = [];
  for (let i = 0; i < array.length; i += size) {
    chunked_arr.push(array.slice(i, i + size));
  }
  return chunked_arr;
};

export function ConvexGrid() {
  // Configuration for tuning the design
  const imagesPerRow = 16; 
  const imageHeight = 1.4;
  const imageWidth = 2.1; 
  const gapY = 0.2; // vertical gap
  const horizontalGapRatio = 1.1; // multiplier 

  const chunkedImages = useMemo(() => {
    let list = [...imageList];
    const remainder = list.length % imagesPerRow;
    if (remainder !== 0) {
      // pad out the remainder so every row is fully populated
      list = list.concat(list.slice(0, imagesPerRow - remainder));
    }
    return chunkArray(list, imagesPerRow);
  }, []);

  // radius calculation based on circumference
  // circumference = imagesPerRow * imageWidth * horizontalGapRatio
  // R = circumference / (2 * PI)
  const radius = (imagesPerRow * imageWidth * horizontalGapRatio) / (Math.PI * 2);

  return (
    <group>
      {chunkedImages.map((rowImages, rowIndex) => {
        // We arrange the rows up and down around y=0
        const totalHeight = chunkedImages.length * (imageHeight + gapY);
        const startY = totalHeight / 2 - (imageHeight / 2) - gapY/2;
        const y = startY - rowIndex * (imageHeight + gapY);
        
        // Alternate scroll direction per row
        const direction = rowIndex % 2 === 0 ? 1 : -1;
        
        return (
          <GridRow 
            key={rowIndex} 
            images={rowImages} 
            y={y} 
            radius={radius} 
            direction={direction} 
            imageWidth={imageWidth}
            imageHeight={imageHeight}
          />
        );
      })}
    </group>
  );
}
