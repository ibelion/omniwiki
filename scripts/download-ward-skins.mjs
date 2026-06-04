/**
 * download-ward-skins.mjs
 *
 * Downloads ward skin images from communitydragon using the sourceUrl fields
 * in bundle.json and saves them to cdn/leaguecontent/images/ward_skins/.
 *
 * Usage: node scripts/download-ward-skins.mjs [--dry-run]
 */

import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUNDLE_PATH = path.resolve(__dirname, '../public/leaguecontent/data/bundle.json');
const OUT_DIR = path.resolve(__dirname, '../cdn/leaguecontent/images/ward_skins');
const DRY_RUN = process.argv.includes('--dry-run');
const DELAY_MS = 150; // polite delay between requests

const bundle = JSON.parse(fs.readFileSync(BUNDLE_PATH, 'utf8'));

if (!bundle.wardSkins || bundle.wardSkins.length === 0) {
  console.error('No wardSkins found in bundle.json');
  process.exit(1);
}

if (!DRY_RUN) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, { headers: { 'User-Agent': 'omniwiki-asset-downloader/1.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        return download(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// The bundle sourceUrls were scraped with an extra /assets/ segment that
// communitydragon no longer serves. Strip it back to the working path.
function fixSourceUrl(url) {
  return url.replace(
    /\/plugins\/(rcp-be-lol-game-data\/global\/default\/)assets\//,
    '/plugins/$1'
  );
}

// Derive filename from the ward's image field, e.g. "images/ward_skins/default_ward.png" -> "default_ward.png"
// Fall back to extracting from the sourceUrl if image field is missing.
function getFilename(ward) {
  if (ward.image) {
    return path.basename(ward.image);
  }
  return path.basename(new URL(ward.sourceUrl).pathname);
}

console.log(`Ward skins to download: ${bundle.wardSkins.length}`);
if (DRY_RUN) console.log('[dry-run] No files will be written.\n');

let ok = 0, skip = 0, fail = 0;

for (const ward of bundle.wardSkins) {
  if (!ward.sourceUrl) {
    console.warn(`  SKIP (no sourceUrl): ${ward.name}`);
    skip++;
    continue;
  }

  const filename = getFilename(ward);
  const destPath = path.join(OUT_DIR, filename);

  if (!DRY_RUN && fs.existsSync(destPath)) {
    skip++;
    continue;
  }

  if (DRY_RUN) {
    console.log(`  [dry] ${ward.name} → ${filename}`);
    console.log(`        ${fixSourceUrl(ward.sourceUrl)}`);
    ok++;
    continue;
  }

  const downloadUrl = fixSourceUrl(ward.sourceUrl);
  process.stdout.write(`  [${ok + fail + skip + 1}/${bundle.wardSkins.length}] ${ward.name} ... `);
  try {
    await download(downloadUrl, destPath);
    console.log('ok');
    ok++;
  } catch (err) {
    console.log(`FAIL: ${err.message}`);
    fail++;
  }

  await sleep(DELAY_MS);
}

console.log(`\nDone. ok=${ok} skip=${skip} fail=${fail}`);
if (!DRY_RUN) {
  console.log(`Output: ${OUT_DIR}`);
}
