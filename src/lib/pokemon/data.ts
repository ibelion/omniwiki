import type { PokemonDataBundle } from "./types";
import { readFileSync } from "fs";
import { join } from "path";

// readFileSync is a runtime operation — webpack/esbuild never bundle the file
// content into handler.mjs. At Next.js SSG build time Node.js reads it from
// disk. Pre-rendered pages are served from ASSETS at Worker runtime so this
// module code never executes there.
const bundleData: PokemonDataBundle = JSON.parse(
  readFileSync(join(process.cwd(), "public/pokemoncontent/data/bundle.json"), "utf8")
);

export const pokemonData = bundleData;

export const getPokemonBySlug = (slug: string) =>
  pokemonData.pokemon.find((p) => p.slug === slug);
