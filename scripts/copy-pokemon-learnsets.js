const fs = require('fs');
const path = require('path');

const srcDir = 'public/exports/pokemon/learnsets';
const destDir = 'public/alljson/pokemon/learnsets';

// Create destination directory
fs.mkdirSync(destDir, { recursive: true });

// Recursively copy learnsets directory
function copyDir(src, dest) {
  const files = fs.readdirSync(src);
  
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${path.relative(srcDir, srcPath)}`);
    }
  });
}

copyDir(srcDir, destDir);
console.log(`✓ Pokemon learnsets copied to ${destDir}`);
