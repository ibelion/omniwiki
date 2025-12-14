import fs from 'fs';
import path from 'path';

const srcDir = 'public/exports/pokemon';
const destDir = 'public/alljson/pokemon';

// Create destination directory
fs.mkdirSync(destDir, { recursive: true });

// Copy all files from pokemon exports (excluding learnsets)
fs.readdirSync(srcDir).forEach(file => {
  // Skip learnsets folder, we'll handle it separately
  if (file === 'learnsets') return;
  
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);
  
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied: ${file}`);
});

console.log(`✓ Pokemon exports copied to ${destDir}`);
