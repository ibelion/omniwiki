import { pokemonData } from "@/lib/pokemon/data";
import { aggregateLearnsets } from "@/lib/pokemon/learnsets";
import { formatVersionGroups, GENERATION_LABELS } from "@/lib/pokemon/versionGroups";

const learnsets = pokemonData.learnsets ?? {};

export default function PokemonLearnsetsPage() {
  const entries = Object.entries(learnsets);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Learnset Map ({entries.length} Pokémon)
        </h1>
        <p className="text-gray-600">
          This page exposes the `pokemon_moves.csv` aggregation used in the
          bundle. Each row shows aggregated moves for a Pokémon grouped by
          generation, method, and level.
        </p>
      </header>
      <section className="flex flex-col gap-4">
        {entries.map(([slug, moves]) => {
          const aggregated = aggregateLearnsets(moves);
          const totalEntries = Array.from(aggregated.values()).flat().length;

          return (
            <article
              key={slug}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm text-gray-800"
            >
              <p className="text-xs uppercase text-gray-500">{slug}</p>
              <div className="mt-2 space-y-3">
                {Array.from(aggregated.entries())
                  .sort(([a], [b]) => {
                    const order = [
                      "generation-i",
                      "generation-ii",
                      "generation-iii",
                      "generation-iv",
                      "generation-v",
                      "generation-vi",
                      "generation-vii",
                      "generation-viii",
                      "generation-ix",
                    ];
                    return order.indexOf(a) - order.indexOf(b);
                  })
                  .slice(0, 3)
                  .map(([generation, entries]) => (
                    <div key={generation} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
                        {GENERATION_LABELS[generation] || generation}
                      </p>
                      <div className="space-y-1">
                        {entries.slice(0, 5).map((entry, idx) => (
                          <p key={idx} className="text-xs">
                            <span className="font-semibold">{entry.method}</span>
                            {entry.level !== null && (
                              <> · Level {entry.level}</>
                            )}
                            {" · "}
                            {formatVersionGroups(
                              entry.versionGroups,
                              entry.generation
                            )}
                          </p>
                        ))}
                        {entries.length > 5 && (
                          <p className="text-xs text-gray-500">
                            +{entries.length - 5} more entries
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              {totalEntries > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  {totalEntries} aggregated entr{totalEntries === 1 ? "y" : "ies"} total
                </p>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
