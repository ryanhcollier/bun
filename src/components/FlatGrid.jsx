import React, { useMemo } from 'react';
import { FlatGridRow } from './FlatGridRow';
import imageList from '../imageList.json';

// Stable shuffle to randomize the grid placement
const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const shuffledImageList = shuffleArray(imageList);

const splitIntoRows = (array, numRows) => {
  const rows = Array.from({ length: numRows }, () => []);
  array.forEach((item, index) => {
    rows[index % numRows].push(item);
  });
  return rows;
};

export function FlatGrid() {
  const numRows = 12; // Increased to 12 to safely allow 8-9 fully visible rows at max zoom without pop-in
  const imageHeight = 1.6;
  const imageWidth = 2.4; 
  const gapY = 0.2; 

  const rows = useMemo(() => {
    // We multiply the list to guarantee exceptionally wide rows that can cover any ultra-wide or full-screen aspect ratio 
    // at the maximum zoom out level without exposing the horizontal wrapping void.
    const multipliedList = [...shuffledImageList, ...shuffledImageList, ...shuffledImageList];
    if (window.gridState) {
      window.gridState.totalImages = multipliedList.length;
    }
    return splitIntoRows(multipliedList, numRows);
  }, []);

  return (
    <group>
      {rows.map((rowImages, rowIndex) => (
        <FlatGridRow 
          key={rowIndex} 
          images={rowImages} 
          rowIndex={rowIndex}
          numRows={numRows}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
          gapY={gapY}
        />
      ))}
    </group>
  );
}
