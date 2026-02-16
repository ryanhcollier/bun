import fs from 'fs';
import path from 'path';

const SOURCE_DIR = '/Users/collier/bun/_Fullsize';
const TARGET_DIR = path.join(process.cwd(), 'public', 'images');
const MANIFEST_FILE = path.join(process.cwd(), 'public', 'images.json');

// Ensure target directory exists
if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Get all files from source
try {
    const files = fs.readdirSync(SOURCE_DIR);
    const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    console.log(`Found ${imageFiles.length} images.`);

    // Copy files and build manifest
    const manifest = [];
    imageFiles.forEach(file => {
        const sourcePath = path.join(SOURCE_DIR, file);
        const targetPath = path.join(TARGET_DIR, file);

        fs.copyFileSync(sourcePath, targetPath);

        manifest.push({
            fileName: file,
            path: `/images/${file}`
        });
    });

    // Write manifest
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
    console.log(`Copied ${manifest.length} images and generated manifest at ${MANIFEST_FILE}`);

} catch (err) {
    console.error("Error processing images:", err);
    process.exit(1);
}
