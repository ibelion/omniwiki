import { pokemonData } from "../src/lib/pokemon/data";
import fs from "fs";
import path from "path";

const outDir = path.join(process.cwd(), "public", "exports", "pokemon", "learnsets");
fs.mkdirSync(outDir, { recursive: true });

const learnsets = pokemonData.learnsets ?? {};
const entries = Object.entries(learnsets);

// Split by generation to keep files small
const byGen: Record<string, Record<string, typeof entries[number][1]>> = {};
for (const [slug, list] of entries) {
  for (const item of list) {
    const gen = item.generation;
    byGen[gen] ||= {};
    byGen[gen][slug] ||= [] as any;
    (byGen[gen][slug] as any).push(item);
  }
}

for (const [gen, data] of Object.entries(byGen)) {
  const file = path.join(outDir, `${gen}.json`);
  fs.writeFileSync(file, JSON.stringify(data));
  const size = fs.statSync(file).size;
  console.log(`✓ ${gen}.json -> ${(size/1024/1024).toFixed(2)} MB`);
}

// Index file listing chunks
const index = { chunks: Object.keys(byGen).map(gen => ({ gen, path: `/exports/pokemon/learnsets/${gen}.json` })) };
fs.writeFileSync(path.join(outDir, "index.json"), JSON.stringify(index));
console.log("✓ index.json written");