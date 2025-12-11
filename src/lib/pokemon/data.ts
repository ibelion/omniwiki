import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import type { PokemonDataBundle } from "./types";

const bundlePath = path.join(
  process.cwd(),
  "public",
  "pokemoncontent",
  "data",
  "bundle.json"
);

let cached: PokemonDataBundle | null = null;

const loadBundle = (): PokemonDataBundle => {
  if (!cached) {
    const buffer = fs.readFileSync(bundlePath);
    const isGzip = buffer[0] === 0x1f && buffer[1] === 0x8b;
    const text = isGzip
      ? zlib.gunzipSync(buffer).toString("utf8")
      : buffer.toString("utf8");
    cached = JSON.parse(text) as PokemonDataBundle;
  }
  return cached;
};

export const pokemonData = loadBundle();

export const getPokemonBySlug = (slug: string) =>
  pokemonData.pokemon.find((p) => p.slug === slug);
