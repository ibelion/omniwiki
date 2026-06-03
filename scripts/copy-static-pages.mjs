import { cpSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import path from 'path';

// Copy pre-rendered HTML files from Next.js build output to Cloudflare Pages assets dir.
// Static files in pages_build_output_dir are served directly by Cloudflare Pages CDN
// without going through the Worker, bypassing any incremental cache lookup entirely.
// This fixes routes where the Worker's cache lookup fails at runtime.

const nextAppDir = path.join('.next', 'server', 'app');
const assetsDir = path.join('.open-next', 'assets');

if (!existsSync(nextAppDir)) {
  console.log(`skip: ${nextAppDir} not found`);
  process.exit(0);
}

let copied = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (entry.endsWith('.html')) {
      const rel = path.relative(nextAppDir, full);
      const dest = path.join(assetsDir, rel);
      mkdirSync(path.dirname(dest), { recursive: true });
      cpSync(full, dest);
      const kb = Math.round(statSync(full).size / 1024);
      console.log(`  ${rel} (${kb} KB)`);
      copied++;
    }
  }
}

console.log('Copying pre-rendered HTML to Cloudflare Pages assets...');
walk(nextAppDir);
console.log(`Done: ${copied} file(s) copied to ${assetsDir}`);
