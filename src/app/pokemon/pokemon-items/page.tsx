import { pokemonData } from "@/lib/pokemon/data";
import { PokemonItemsSearchClient } from "@/components/PokemonItemsSearchClient";
import { BackLink } from "@/components/BackLink";

const GENERATION_ORDER = [
  "generation-i", "generation-ii", "generation-iii", "generation-iv",
  "generation-v", "generation-vi", "generation-vii", "generation-viii", "generation-ix"
];

const getGenerationWeight = (generation: string) => {
  const index = GENERATION_ORDER.indexOf(generation);
  return index === -1 ? GENERATION_ORDER.length : index;
};

export default function PokemonItemsMappingPage() {
  const pokemonMap = new Map(pokemonData.pokemon.map(p => [p.slug, { id: p.id, generation: p.generation }]));
  
  // Group by pokemon + item, aggregate versions
  const grouped = new Map<string, { pokemonSlug: string; itemSlug: string; rarity: number | null; versions: string[] }>();
  for (const entry of pokemonData.pokemonItems ?? []) {
    const key = `${entry.pokemonSlug}|${entry.itemSlug}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        pokemonSlug: entry.pokemonSlug,
        itemSlug: entry.itemSlug,
        rarity: entry.rarity,
        versions: []
      });
    }
    const group = grouped.get(key)!;
    if (entry.version && !group.versions.includes(entry.version)) {
      group.versions.push(entry.version);
    }
  }
  
  const pokemonItems = Array.from(grouped.values()).sort((a, b) => {
    const aData = pokemonMap.get(a.pokemonSlug);
    const bData = pokemonMap.get(b.pokemonSlug);
    if (aData && bData) {
      if (aData.id !== bData.id) return aData.id - bData.id;
      const genDiff = getGenerationWeight(aData.generation) - getGenerationWeight(bData.generation);
      if (genDiff !== 0) return genDiff;
    }
    return a.pokemonSlug.localeCompare(b.pokemonSlug);
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <div className="flex items-center justify-between">
        <BackLink href="/pokemon" label="Back to Pokémon" />
      </div>
      <PokemonItemsSearchClient items={pokemonItems} />
    </main>
  );
}
