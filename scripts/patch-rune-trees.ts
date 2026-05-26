import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

type RuneTree = {
  id: number;
  key: string;
  name: string;
  icon: string;
};

type DataDragonRuneTree = {
  id: number;
  key: string;
  name: string;
};

type Bundle = {
  runeTrees?: RuneTree[];
  [key: string]: unknown;
};

const RUNES_URL = 'https://ddragon.leagueoflegends.com/cdn/15.10.1/data/en_US/runesReforged.json';
const PUBLIC_BUNDLE_PATH = path.resolve('public/leaguecontent/data/bundle.json');

async function main(): Promise<void> {
  try {
    if (!fs.existsSync(PUBLIC_BUNDLE_PATH)) {
      throw new Error(`Bundle not found: ${PUBLIC_BUNDLE_PATH}`);
    }

    const response = await fetch(RUNES_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch rune trees: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as DataDragonRuneTree[];
    if (!Array.isArray(data)) {
      throw new Error('Unexpected rune tree response format.');
    }

    const runeTrees: RuneTree[] = data.map((tree) => ({
      id: tree.id,
      key: tree.key,
      name: tree.name,
      icon: `images/runes/${tree.key.toLowerCase()}.png`,
    }));

    const rawBundle = fs.readFileSync(PUBLIC_BUNDLE_PATH, 'utf8');
    const bundle = JSON.parse(rawBundle) as Bundle;
    bundle.runeTrees = runeTrees;

    fs.writeFileSync(PUBLIC_BUNDLE_PATH, JSON.stringify(bundle, null, 2) + '\n', 'utf8');
    execSync('gzip -c public/leaguecontent/data/bundle.json > cdn/leaguecontent/data/bundle.json', {
      shell: true,
      stdio: 'inherit',
    });

    console.log(`Patched runeTrees with ${runeTrees.length} entries and recompressed bundle.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to patch rune trees: ${message}`);
    process.exitCode = 1;
  }
}

void main();
