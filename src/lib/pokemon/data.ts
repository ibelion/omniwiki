import bundle from "../../../public/pokemoncontent/data/bundle.json";
import { PokemonDataBundle } from "./types";

export const pokemonData = bundle as PokemonDataBundle;

export const getPokemonBySlug = (slug: string) =>
  pokemonData.pokemon.find((p) => p.slug === slug);
