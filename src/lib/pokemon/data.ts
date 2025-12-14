import type { PokemonDataBundle } from "./types";
import bundleData from "../../../public/pokemoncontent/data/bundle.json";

export const pokemonData = bundleData as PokemonDataBundle;

export const getPokemonBySlug = (slug: string) =>
  pokemonData.pokemon.find((p) => p.slug === slug);

