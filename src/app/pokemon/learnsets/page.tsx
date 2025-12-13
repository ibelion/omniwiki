import { pokemonData } from "@/lib/pokemon/data";
import LearnsetsMovesStyleClient from "@/components/LearnsetsMovesStyleClient";
import type { MoveRecord } from "@/lib/pokemon/types";
import { BackLink } from "@/components/BackLink";

const GENERATION_ORDER = [
  "generation-i", "generation-ii", "generation-iii", "generation-iv",
  "generation-v", "generation-vi", "generation-vii", "generation-viii", "generation-ix"
];

const getGenerationWeight = (generation: string) => {
  const index = GENERATION_ORDER.indexOf(generation);
  return index === -1 ? GENERATION_ORDER.length : index;
};

export default function PokemonLearnsetsPage() {
  const learnsets = pokemonData.learnsets ?? {};
  const pokemonMap = new Map(pokemonData.pokemon.map(p => [p.slug, { id: p.id, generation: p.generation }]));
  const entries = Object.entries(learnsets).sort(([slugA], [slugB]) => {
    const aData = pokemonMap.get(slugA);
    const bData = pokemonMap.get(slugB);
    if (aData && bData) {
      if (aData.id !== bData.id) return aData.id - bData.id;
      const genDiff = getGenerationWeight(aData.generation) - getGenerationWeight(bData.generation);
      if (genDiff !== 0) return genDiff;
    }
    return slugA.localeCompare(slugB);
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <div className="flex items-center justify-between">
        <BackLink href="/pokemon" label="Back to Pokémon" />
      </div>
      <LearnsetsMovesStyleClient
        entries={entries}
        movesIndex={Object.fromEntries(pokemonData.moves.map((m: MoveRecord) => [m.slug, m]))}
        pokemonMap={pokemonMap}
      />
    </main>
  );
}
