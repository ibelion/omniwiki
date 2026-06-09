import { getPokemonBundleEdge } from "@/lib/edge-data";
import { BackLink } from "@/components/BackLink";
import LearnsetsIndexClient from "@/components/LearnsetsIndexClient";

export type PokemonLearnsetSummary = {
  slug: string;
  name: string;
  id: number;
  generation: string;
  types: string[];
  spriteDefault: string;
  totalMoves: number;
  byMethod: Record<string, number>;
};

export default async function PokemonLearnsetsPage() {
  const data = await getPokemonBundleEdge();
  const pokemonMap = new Map(data.pokemon.map((p) => [p.slug, p]));
  const learnsets = data.learnsets ?? {};

  const summaries: PokemonLearnsetSummary[] = Object.entries(learnsets)
    .flatMap(([slug, entries]) => {
      const pokemon = pokemonMap.get(slug);
      if (!pokemon || entries.length === 0) return [];

      const allMoves = new Set<string>();
      const movesPerMethod = new Map<string, Set<string>>();
      for (const entry of entries) {
        allMoves.add(entry.move);
        if (!movesPerMethod.has(entry.method)) {
          movesPerMethod.set(entry.method, new Set());
        }
        movesPerMethod.get(entry.method)!.add(entry.move);
      }
      const byMethod: Record<string, number> = {};
      for (const [method, moves] of movesPerMethod.entries()) {
        byMethod[method] = moves.size;
      }

      return [
        {
          slug: pokemon.slug,
          name: pokemon.name,
          id: pokemon.id,
          generation: pokemon.generation,
          types: pokemon.types,
          spriteDefault: pokemon.sprites.default,
          totalMoves: allMoves.size,
          byMethod,
        },
      ];
    })
    .sort((a, b) => a.id - b.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <div className="flex items-center justify-between">
        <BackLink href="/pokemon" label="Back to Pokémon" />
      </div>
      <LearnsetsIndexClient summaries={summaries} />
    </main>
  );
}
