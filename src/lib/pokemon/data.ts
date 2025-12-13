import type { PokemonDataBundle } from "./types";

// Only load on server - this prevents webpack from trying to bundle Node modules
let cached: PokemonDataBundle | null = null;

const loadBundle = (): PokemonDataBundle => {
  if (!cached) {
    if (typeof window !== "undefined") {
      throw new Error("pokemonData can only be loaded on the server");
    }
    // Dynamic require at runtime to avoid webpack processing at build time
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("node:fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("node:path");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const zlib = require("node:zlib");

    const bundlePath = path.join(
      process.cwd(),
      "public",
      "pokemoncontent",
      "data",
      "bundle.json"
    );

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
