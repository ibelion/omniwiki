import { pokemonData } from "@/lib/pokemon/data";
import type { SpeciesRecord } from "@/lib/pokemon/types";
import { SpeciesSearchClient } from "@/components/SpeciesSearchClient";
import { BackLink } from "@/components/BackLink";

export default function PokemonSpeciesPage() {
  const species = pokemonData.species;

  // Build slug → sprite map from the pokemon records
  const spritesBySlug: Record<string, string> = {};
  for (const p of pokemonData.pokemon) {
    if (p.sprites.default) spritesBySlug[p.slug] = p.sprites.default;
  }

  const groupedSpecies = new Map<number, SpeciesRecord[]>();
  for (const entry of species) {
    if (!groupedSpecies.has(entry.id)) groupedSpecies.set(entry.id, []);
    groupedSpecies.get(entry.id)!.push(entry);
  }

  const groupedArray = Array.from(groupedSpecies.entries())
    .map(([id, entries]) => ({
      id,
      entries: entries.sort((a, b) => a.generation.localeCompare(b.generation)),
      representative: entries[0],
    }))
    .sort((a, b) => a.id - b.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <div className="flex items-center justify-between">
        <BackLink href="/pokemon" label="Back to Pokémon" />
      </div>
      <SpeciesSearchClient groups={groupedArray} spritesMap={spritesBySlug} />
    </main>
  );
}
