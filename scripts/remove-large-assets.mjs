import { rmSync, existsSync } from 'fs';

// These files exceed CF Pages' 25 MiB per-file static asset limit.
// They are consumed at build time by SSG pages but must not appear in the output.
const toRemove = [
  '.vercel/output/static/pokemoncontent/data/bundle.json',
];

for (const path of toRemove) {
  if (existsSync(path)) {
    rmSync(path);
    console.log(`removed ${path}`);
  } else {
    console.log(`not found (skipping): ${path}`);
  }
}
