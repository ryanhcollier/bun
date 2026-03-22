import fs from 'fs';
import path from 'path';

const publicImagesDir = path.join(process.cwd(), 'public', 'images');
const outputFilePath = path.join(process.cwd(), 'src', 'imageList.json');

const files = fs.readdirSync(publicImagesDir);

const uniqueImages = {};

files.forEach(file => {
  const ext = path.extname(file).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    const baseName = path.basename(file, ext);
    if (!uniqueImages[baseName]) {
      uniqueImages[baseName] = file;
    }
  }
});

const imagePaths = Object.values(uniqueImages).map(file => `/images/${file}`);

fs.writeFileSync(outputFilePath, JSON.stringify(imagePaths, null, 2));
console.log(`Generated imageList.json with ${imagePaths.length} images.`);
