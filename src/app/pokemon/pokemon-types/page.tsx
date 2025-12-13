import { pokemonData } from "@/lib/pokemon/data";
import { PokemonTypesSearchClient } from "@/components/PokemonTypesSearchClient";
import { BackLink } from "@/components/BackLink";

const GENERATION_ORDER = [
  "generation-i", "generation-ii", "generation-iii", "generation-iv",
  "generation-v", "generation-vi", "generation-vii", "generation-viii", "generation-ix"
];

const getGenerationWeight = (generation: string) => {
  const index = GENERATION_ORDER.indexOf(generation);
  return index === -1 ? GENERATION_ORDER.length : index;
};

export default function PokemonTypesMappingPage() {
  const pokemonMap = new Map(pokemonData.pokemon.map(p => [p.slug, { id: p.id, generation: p.generation }]));
  const pokemonTypes = [...(pokemonData.pokemonTypes ?? [])].sort((a, b) => {
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
      <PokemonTypesSearchClient types={pokemonTypes} />
    </main>
  );
}
