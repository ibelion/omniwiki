import { pokemonData } from "../src/lib/pokemon/data";
import fs from "fs";
import path from "path";
import zlib from "zlib";

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

// Write gzip-compressed output so files match the Content-Encoding: gzip
// header declared in public/_headers. Compressed gen-i drops from 23.9 MB → ~3 MB.
for (const [gen, data] of Object.entries(byGen)) {
  const file = path.join(outDir, `${gen}.json`);
  const compressed = zlib.gzipSync(Buffer.from(JSON.stringify(data), "utf8"));
  fs.writeFileSync(file, compressed);
  const rawSize = JSON.stringify(data).length;
  console.log(`✓ ${gen}.json -> ${(compressed.length/1024/1024).toFixed(2)} MB (gzip, was ${(rawSize/1024/1024).toFixed(2)} MB raw)`);
}

// Index file — plain JSON, no encoding header in _headers
const index = { chunks: Object.keys(byGen).map(gen => ({ gen, path: `/exports/pokemon/learnsets/${gen}.json` })) };
fs.writeFileSync(path.join(outDir, "index.json"), JSON.stringify(index));
console.log("✓ index.json written");