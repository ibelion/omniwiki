// lib/pokemon-service.ts
import { OmniEntity } from '@/types/omni-schema';
import { PokeApiPokemon, PokeApiSpecies } from '@/types/pokemon';
import { cleanText, normalizeStat } from '@/lib/utils';

const BASE_URL = 'https://pokeapi.co/api/v2';

/**
 * Transforms raw PokeAPI data into the Golden Schema
 */
const transformPokemon = (
  pokemon: PokeApiPokemon, 
  species: PokeApiSpecies
): OmniEntity => {
  // Find English flavor text
  const flavorEntry = species.flavor_text_entries.find(e => e.language.name === 'en');
  // Find English Genus (e.g. "Seed Pokemon")
  const genusEntry = species.genera.find(e => e.language.name === 'en');

  // Map stats (Order: HP, Atk, Def, SpAtk, SpDef, Spd)
  // We use 180 as a rough "max" for base stats to scale to 100%
  const atk = pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat || 0;
  const def = pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat || 0;
  const spAtk = pokemon.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 0;

  return {
    uid: `poke-${pokemon.id}`,
    name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1), // Capitalize
    title: genusEntry ? genusEntry.genus : 'Pokémon',
    universe: 'pokemon',
    stats: {
      attack: normalizeStat(atk, 180),
      defense: normalizeStat(def, 180),
      magic: normalizeStat(spAtk, 180), // Mapping Special Attack to Magic
      difficulty: 0, // Pokemon doesn't have a difficulty stat
    },
    images: {
      icon: pokemon.sprites.front_default,
      portrait: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default,
    },
    lore: cleanText(flavorEntry?.flavor_text),
    abilities: pokemon.abilities.map(a => a.ability.name),
    tags: pokemon.types.map(t => t.type.name),
  };
};

/**
 * Fetches details for a single Pokemon
 */
const fetchSinglePokemon = async (id: number): Promise<OmniEntity | null> => {
  try {
    const [pokeRes, speciesRes] = await Promise.all([
      fetch(`${BASE_URL}/pokemon/${id}`),
      fetch(`${BASE_URL}/pokemon-species/${id}`)
    ]);

    if (!pokeRes.ok || !speciesRes.ok) return null;

    const pokemon: PokeApiPokemon = await pokeRes.json();
    const species: PokeApiSpecies = await speciesRes.json();

    return transformPokemon(pokemon, species);
  } catch (error) {
    console.error(`Error fetching Pokemon ${id}:`, error);
    return null;
  }
};

/**
 * Main function to get Pokemon data for the CDN.
 * Defaults to Gen 1 (151) to keep performance high.
 */
export const getPokemonData = async (limit = 151): Promise<OmniEntity[]> => {
  // Create an array of promises [1, 2, ... limit]
  const ids = Array.from({ length: limit }, (_, i) => i + 1);
  
  // Fetch in parallel
  const results = await Promise.all(ids.map(id => fetchSinglePokemon(id)));
  
  // Filter out any failed fetches
  return results.filter((item): item is OmniEntity => item !== null);
};
