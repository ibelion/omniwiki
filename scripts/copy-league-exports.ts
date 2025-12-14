import fs from 'fs';
import path from 'path';

const srcDir = 'public/exports/league';
const destDir = 'public/alljson/league';

// Create destination directory
fs.mkdirSync(destDir, { recursive: true });

// Copy all files from league exports
fs.readdirSync(srcDir).forEach(file => {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);
  
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied: ${file}`);
});

console.log(`✓ League exports copied to ${destDir}`);
