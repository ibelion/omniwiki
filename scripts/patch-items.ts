import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

type CdItem = {
  id: number;
  description?: string | null;
  categories?: string[] | null;
  name: string;
};

type BundleItem = {
  id: number;
  name: string;
  description?: string | null;
  tags?: string[] | null;
  [key: string]: unknown;
};

type Bundle = {
  items: BundleItem[];
  [key: string]: unknown;
};

type PatchSource = {
  description: string;
  categories: string[];
};

const ROOT_DIR = process.cwd();
const PUBLIC_BUNDLE_PATH = path.resolve(
  ROOT_DIR,
  'public/leaguecontent/data/bundle.json',
);
const CDN_BUNDLE_PATH = path.resolve(
  ROOT_DIR,
  'cdn/leaguecontent/data/bundle.json',
);
const CD_ITEMS_URL =
  'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/items.json';

function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

function stripHtml(description: string | null | undefined): string {
  if (!description) {
    return '';
  }

  return description.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function hasNoTags(tags: string[] | null | undefined): boolean {
  return !tags || tags.length === 0;
}

async function fetchCdItems(): Promise<Map<number, PatchSource>> {
  const response = await fetch(CD_ITEMS_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch CommunityDragon items: ${response.status} ${response.statusText}`);
  }

  const payload: unknown = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error('Unexpected CommunityDragon response: expected an array');
  }

  const itemMap = new Map<number, PatchSource>();

  for (const entry of payload) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }

    const candidate = entry as Partial<CdItem>;

    if (typeof candidate.id !== 'number') {
      continue;
    }

    const description = stripHtml(candidate.description ?? '');
    const categories = Array.isArray(candidate.categories)
      ? candidate.categories.filter((category): category is string => typeof category === 'string')
      : [];

    itemMap.set(candidate.id, {
      description,
      categories,
    });
  }

  return itemMap;
}

function readBundle(): Bundle {
  const raw = fs.readFileSync(PUBLIC_BUNDLE_PATH, 'utf8');
  const parsed: unknown = JSON.parse(raw);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Unexpected bundle format: expected an object');
  }

  const bundle = parsed as Partial<Bundle>;

  if (!Array.isArray(bundle.items)) {
    throw new Error('Unexpected bundle format: expected items to be an array');
  }

  return bundle as Bundle;
}

function writeBundle(bundle: Bundle): void {
  const output = `${JSON.stringify(bundle, null, 2)}\n`;
  fs.writeFileSync(PUBLIC_BUNDLE_PATH, output, 'utf8');
  fs.writeFileSync(CDN_BUNDLE_PATH, zlib.gzipSync(output));
}

async function main(): Promise<void> {
  const bundle = readBundle();
  const cdItems = await fetchCdItems();

  let descriptionsUpdated = 0;
  let tagsUpdated = 0;

  for (const item of bundle.items) {
    const source = cdItems.get(item.id);

    if (!source) {
      continue;
    }

    if (isBlank(item.description) && source.description) {
      item.description = source.description;
      descriptionsUpdated += 1;
    }

    if (hasNoTags(item.tags) && source.categories.length > 0) {
      item.tags = source.categories;
      tagsUpdated += 1;
    }
  }

  writeBundle(bundle);

  console.log(`Updated item descriptions: ${descriptionsUpdated}`);
  console.log(`Updated item tags: ${tagsUpdated}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
