import fs from "node:fs";
import path from "node:path";
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
    const raw = fs.readFileSync(bundlePath, "utf8");
    cached = JSON.parse(raw) as PokemonDataBundle;
  }
  return cached;
};

export const pokemonData = loadBundle();

export const getPokemonBySlug = (slug: string) =>
  pokemonData.pokemon.find((p) => p.slug === slug);
