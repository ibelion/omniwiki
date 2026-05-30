import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import zlib from 'node:zlib';

type DDItem = {
  from?: string[];
  into?: string[];
};

type DDItemsResponse = {
  data: Record<string, DDItem>;
};

type BundleItem = {
  id: number;
  from?: number[];
  into?: number[];
  [key: string]: unknown;
};

type Bundle = {
  items: BundleItem[];
  [key: string]: unknown;
};

const PUBLIC_BUNDLE_PATH = path.resolve('public/leaguecontent/data/bundle.json');
const CDN_BUNDLE_PATH = path.resolve('cdn/leaguecontent/data/bundle.json');

async function getLatestVersion(): Promise<string> {
  const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
  if (!res.ok) throw new Error(`versions fetch HTTP ${res.status}`);
  const versions = (await res.json()) as string[];
  return versions[0];
}

async function main(): Promise<void> {
  try {
    if (!fs.existsSync(PUBLIC_BUNDLE_PATH)) {
      throw new Error(`Bundle not found: ${PUBLIC_BUNDLE_PATH}`);
    }

    const version = await getLatestVersion();
    console.log(`Using Data Dragon version: ${version}`);

    const itemsUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`;
    console.log('Fetching items from Data Dragon...');
    const res = await fetch(itemsUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const dd = (await res.json()) as DDItemsResponse;

    const itemMap = new Map<number, { from: number[]; into: number[] }>();
    for (const [key, item] of Object.entries(dd.data)) {
      itemMap.set(parseInt(key, 10), {
        from: (item.from ?? []).map(Number),
        into: (item.into ?? []).map(Number),
      });
    }

    const bundle = JSON.parse(fs.readFileSync(PUBLIC_BUNDLE_PATH, 'utf8')) as Bundle;

    let patched = 0;
    for (const item of bundle.items) {
      const ddItem = itemMap.get(item.id);
      if (ddItem) {
        if (ddItem.from.length > 0) item.from = ddItem.from;
        if (ddItem.into.length > 0) item.into = ddItem.into;
        patched++;
      }
    }

    fs.writeFileSync(PUBLIC_BUNDLE_PATH, JSON.stringify(bundle) + '\n', 'utf8');

    await pipeline(
      fs.createReadStream(PUBLIC_BUNDLE_PATH),
      zlib.createGzip(),
      fs.createWriteStream(CDN_BUNDLE_PATH)
    );

    console.log(`Patched build paths for ${patched} items. Bundle written and compressed.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed: ${message}`);
    process.exitCode = 1;
  }
}

void main();
