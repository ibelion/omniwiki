import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT_DIR = process.cwd();
const PUBLIC_BUNDLE_PATH = path.join(ROOT_DIR, 'public', 'leaguecontent', 'data', 'bundle.json');
const CDN_BUNDLE_PATH = path.join(ROOT_DIR, 'cdn', 'leaguecontent', 'data', 'bundle.json');
const CD_QUEUES_URL =
  'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/queues.json';

type BundleQueue = {
  id: number;
  map: string;
  description: string | null;
  notes: string | null;
  isDeprecated: boolean;
};

type Bundle = {
  queues: BundleQueue[];
  [key: string]: unknown;
};

type CdQueue = {
  id: number;
  name?: string;
  shortName?: string;
  description?: string;
  detailedDescription?: string;
};

async function main(): Promise<void> {
  const bundle = JSON.parse(fs.readFileSync(PUBLIC_BUNDLE_PATH, 'utf8')) as Bundle;
  const nullQueues = bundle.queues.filter((q) => !q.description || q.description.trim() === '');

  if (nullQueues.length === 0) {
    console.log('No queues with null description.');
    return;
  }

  const response = await fetch(CD_QUEUES_URL);
  if (!response.ok) {
    throw new Error(`CommunityDragon fetch failed: ${response.status} ${response.statusText}`);
  }

  const cdData: unknown = await response.json();
  if (!Array.isArray(cdData)) {
    throw new Error('Unexpected CommunityDragon game-queues response: expected array');
  }

  const cdQueues = cdData as CdQueue[];
  const cdById = new Map(cdQueues.map((q) => [q.id, q]));

  let updated = 0;

  for (const queue of nullQueues) {
    const cd = cdById.get(queue.id);
    const shortName = cd?.shortName?.trim();
    const name = cd?.name?.trim();
    const fromCd = shortName || name || null;

    if (fromCd) {
      queue.description = fromCd;
      updated += 1;
    } else if (queue.id === 0) {
      // id=0 has duplicate entries in CD with conflicting names; use canonical label
      queue.description = 'Custom Games';
      updated += 1;
    }
  }

  const serialized = `${JSON.stringify(bundle, null, 2)}\n`;
  fs.writeFileSync(PUBLIC_BUNDLE_PATH, serialized, 'utf8');
  fs.writeFileSync(CDN_BUNDLE_PATH, zlib.gzipSync(serialized));

  console.log(`Updated ${updated} queue descriptions (${nullQueues.length - updated} still null)`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
