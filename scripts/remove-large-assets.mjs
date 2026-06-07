import { rmSync, existsSync, readdirSync, statSync } from 'fs';
import path from 'path';

// Remove any individual static asset that exceeds Cloudflare Workers' 25 MiB
// per-file limit. Files in this list are consumed at build time (SSG) and must
// not appear in the static-assets upload.
const explicitRemove = [
  // public/pokemoncontent/data/bundle.json is gitignored and not generated
  // by the build, so this entry is intentionally a no-op — kept for clarity.
  '.open-next/assets/pokemoncontent/data/bundle.json',
];

for (const p of explicitRemove) {
  if (existsSync(p)) {
    rmSync(p);
    console.log(`removed ${p}`);
  }
}

// Scan for any file that somehow exceeds 25 MiB and log it clearly so the
// next wrangler upload doesn't fail silently after 10 minutes.
const LIMIT_BYTES = 25 * 1024 * 1024;
const assetsDir = '.open-next/assets';

function walk(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else {
      const { size } = statSync(full);
      if (size > LIMIT_BYTES) {
        const mb = (size / 1024 / 1024).toFixed(1);
        console.error(`ERROR: ${full} is ${mb} MiB — exceeds CF 25 MiB limit. Remove or compress it.`);
        process.exitCode = 1;
      }
    }
  }
}

walk(assetsDir);
if (process.exitCode !== 1) {
  console.log('Asset size check passed — all files under 25 MiB.');
}
