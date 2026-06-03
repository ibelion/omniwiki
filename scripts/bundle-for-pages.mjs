import { cpSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

// Activates Cloudflare Pages Advanced Mode by placing _worker.js and all its
// runtime dependencies inside the pages_build_output_dir (.open-next/assets/).
//
// CF Pages detects _worker.js in the build output → bundles it with wrangler →
// ALL requests route through the Worker → env.ASSETS binding is available.
//
// This is required because @opennextjs/cloudflare's static-assets-incremental-cache
// calls env.ASSETS.fetch() to serve pre-rendered pages. Without a running Worker
// the ASSETS binding doesn't exist and all cached pages return 404.

const openNext = '.open-next';
const assets = path.join(openNext, 'assets');

const workerSrc = path.join(openNext, 'worker.js');
if (!existsSync(workerSrc)) {
  console.error(`ERROR: ${workerSrc} not found — run opennextjs-cloudflare build first.`);
  process.exit(1);
}

mkdirSync(assets, { recursive: true });

// Place worker.js as _worker.js — CF Pages Advanced Mode trigger.
copyFileSync(workerSrc, path.join(assets, '_worker.js'));
console.log('  worker.js → assets/_worker.js');

// Worker dependency directories that must be co-located with _worker.js
// so wrangler can resolve their imports during the Pages bundling step.
const deps = [
  'cloudflare',       // compiled init.js, images.js, skew-protection.js
  'middleware',       // middleware/handler.mjs
  'server-functions', // server-functions/default/handler.mjs (Next.js server bundle)
  '.build',           // durable-objects stubs (present when DO features are enabled)
];

for (const dir of deps) {
  const src = path.join(openNext, dir);
  if (!existsSync(src)) continue;
  const dest = path.join(assets, dir);
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log(`  ${dir}/ → assets/${dir}/`);
}

console.log('Done. Cloudflare Pages Advanced Mode ready.');
