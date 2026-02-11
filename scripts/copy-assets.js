import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = '/Users/collier/bun/_bun_generated';
const destDir = path.join(__dirname, '../public/images');
const metaFile = path.join(__dirname, '../src/data/images.json');

// Create directories if they don't exist
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// Ensure the directory for the metadata file exists
const metaDir = path.dirname(metaFile);
if (!fs.existsSync(metaDir)) {
    fs.mkdirSync(metaDir, { recursive: true });
}

fs.readdir(sourceDir, (err, files) => {
    if (err) {
        console.error("Could not list the directory.", err);
        process.exit(1);
    }

    const imageFiles = [];
    files.forEach((file) => {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
            const srcPath = path.join(sourceDir, file);
            const destPath = path.join(destDir, file);

            fs.copyFile(srcPath, destPath, (err) => {
                if (err) throw err;
                console.log(`${file} was copied to ${destDir}`);
            });
            imageFiles.push(file);
        }
    });

    const jsonContent = JSON.stringify(imageFiles, null, 2);
    fs.writeFile(metaFile, jsonContent, 'utf8', (err) => {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        console.log("JSON file has been saved.");
    });
});

