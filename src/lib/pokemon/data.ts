import type { PokemonDataBundle } from "./types";
import { readFileSync } from "fs";
import { gunzipSync } from "zlib";
import { join } from "path";

// Read the gzip-compressed bundle from cdn/ (3.9 MB) rather than the 109 MB
// plain-JSON that used to live in public/ under git LFS.  zlib.gunzipSync is
// synchronous and available in Node; this code only runs at Next.js SSG build
// time and in scripts/split-learnsets.ts — never in the CF Worker runtime.
const gzipped = readFileSync(join(process.cwd(), "cdn/pokemoncontent/data/bundle.json"));
const bundleData: PokemonDataBundle = JSON.parse(gunzipSync(gzipped).toString("utf8"));

export const pokemonData = bundleData;

export const getPokemonBySlug = (slug: string) =>
  pokemonData.pokemon.find((p) => p.slug === slug);
