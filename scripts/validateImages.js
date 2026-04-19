import fs from 'fs';
import path from 'path';

const imageListPath = path.join(process.cwd(), 'src', 'imageList.json');
const currentImages = JSON.parse(fs.readFileSync(imageListPath, 'utf8'));

const validImages = [];

async function checkImage(urlPath) {
  const url = `https://reil.studio/bun/images${urlPath.replace('/images', '')}`;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.ok && res.headers.get('content-type')?.startsWith('image/')) {
      validImages.push(urlPath);
    } else {
      console.log(`Missing: ${urlPath} (${res.status} ${res.headers.get('content-type')})`);
    }
  } catch (e) {
    console.log(`Error: ${urlPath} - ${e.message}`);
  }
}

async function main() {
  console.log(`Checking ${currentImages.length} images...`);
  for (let i = 0; i < currentImages.length; i += 10) {
    const batch = currentImages.slice(i, i + 10);
    await Promise.all(batch.map(checkImage));
  }
  
  fs.writeFileSync(imageListPath, JSON.stringify(validImages, null, 2));
  console.log(`\nValidation complete. Filtered from ${currentImages.length} to ${validImages.length} actual hosted images.`);
}

main();
