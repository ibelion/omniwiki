import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

type DDItem = {
  id: number;
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

const DD_VERSION = '15.10.1';
const ITEMS_URL = `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/data/en_US/item.json`;
const PUBLIC_BUNDLE_PATH = path.resolve('public/leaguecontent/data/bundle.json');

async function main(): Promise<void> {
  try {
    if (!fs.existsSync(PUBLIC_BUNDLE_PATH)) {
      throw new Error(`Bundle not found: ${PUBLIC_BUNDLE_PATH}`);
    }

    console.log('Fetching items from Data Dragon...');
    const res = await fetch(ITEMS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const dd = (await res.json()) as DDItemsResponse;

    // id -> { from, into } — key in DD is the string ID (e.g. "1001"), no id field on the value
    const itemMap = new Map<number, { from: number[]; into: number[] }>();
    for (const [key, item] of Object.entries(dd.data)) {
      itemMap.set(parseInt(key, 10), {
        from: (item.from ?? []).map(Number),
        into: (item.into ?? []).map(Number),
      });
    }

    const rawBundle = fs.readFileSync(PUBLIC_BUNDLE_PATH, 'utf8');
    const bundle = JSON.parse(rawBundle) as Bundle;

    let patched = 0;
    for (const item of bundle.items) {
      const dd = itemMap.get(item.id);
      if (dd) {
        if (dd.from.length > 0) item.from = dd.from;
        if (dd.into.length > 0) item.into = dd.into;
        patched++;
      }
    }

    fs.writeFileSync(PUBLIC_BUNDLE_PATH, JSON.stringify(bundle, null, 2) + '\n', 'utf8');
    execSync('gzip -c public/leaguecontent/data/bundle.json > cdn/leaguecontent/data/bundle.json', {
      stdio: 'inherit',
    });
    console.log(`Patched build paths for ${patched} items. Done.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed: ${message}`);
    process.exitCode = 1;
  }
}

void main();
