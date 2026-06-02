// lib/pokemon-service.ts
import { getPokemonBundleEdge } from '@/lib/edge-data';
import type { OmniEntity } from '@/types/omni-schema';
import { cleanText, normalizeStat } from '@/lib/utils';

const GENERATION_YEAR: Record<string, number> = {
  'generation-i': 1996,
  'generation-ii': 1999,
  'generation-iii': 2002,
  'generation-iv': 2006,
  'generation-v': 2010,
  'generation-vi': 2013,
  'generation-vii': 2016,
  'generation-viii': 2019,
  'generation-ix': 2022,
};

// "solar-power" → "Solar Power"
const formatName = (s: string): string =>
  s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

// Flavor text can contain form-feed characters (\f) that act as line breaks.
const cleanFlavor = (text: string | null): string =>
  cleanText(text?.replace(/\f/g, ' ').replace(/\n/g, ' ') ?? '');

export const getPokemonData = async (
  // Default to base-form pokemon through Gen 9 (ids 1–1010).
  // Alternate forms, regional variants, etc. sit above 1010.
  limit = 1010
): Promise<OmniEntity[]> => {
  const bundle = await getPokemonBundleEdge();

  // Build species lookup by slug for O(1) access
  const speciesBySlug = new Map(bundle.species.map((s) => [s.slug, s]));

  return bundle.pokemon
    .filter((p) => p.id <= limit)
    .map((pokemon) => {
      const species = speciesBySlug.get(pokemon.slug);

      const atk = pokemon.stats['attack'] ?? 0;
      const def = pokemon.stats['defense'] ?? 0;
      const spAtk = pokemon.stats['special-attack'] ?? 0;
      const captureRate = species?.captureRate ?? 128;

      // Lower capture rate = rarer/harder → higher difficulty score.
      // Mewtwo (captureRate=3) → ~99, Caterpie (255) → 0.
      const difficulty = Math.round(((255 - captureRate) / 255) * 100);

      const tags: string[] = [
        ...pokemon.types,
        pokemon.generation,
        ...(species?.habitat ? [species.habitat] : []),
        ...(species?.color ? [species.color] : []),
        ...(species?.isLegendary ? ['legendary'] : []),
        ...(species?.isMythical ? ['mythical'] : []),
        ...(species?.isBaby ? ['baby'] : []),
      ].filter(Boolean);

      const flavorText = cleanFlavor(species?.flavorText ?? null);

      return {
        uid: `poke-${pokemon.id}`,
        name: formatName(pokemon.name),
        title: `#${pokemon.id} · ${pokemon.generation.replace('generation-', 'Gen ').toUpperCase()}`,
        universe: 'pokemon' as const,
        stats: {
          attack: normalizeStat(atk, 180),
          defense: normalizeStat(def, 180),
          magic: normalizeStat(spAtk, 180),
          difficulty,
        },
        images: {
          icon: `/pokemoncontent/${pokemon.sprites.default}`,
          portrait: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
        },
        lore: flavorText,
        abilities: pokemon.abilities.map(formatName),
        tags,
        releaseYear: GENERATION_YEAR[pokemon.generation] ?? null,
      };
    });
};
