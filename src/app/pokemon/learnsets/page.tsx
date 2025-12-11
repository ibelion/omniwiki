import { pokemonData } from "@/lib/pokemon/data";

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
          bundle. Each row shows the first few moves for a Pokémon plus metadata
          (generation, method, level).
        </p>
      </header>
      <section className="flex flex-col gap-4">
        {entries.map(([slug, moves]) => (
          <article
            key={slug}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm text-gray-800"
          >
            <p className="text-xs uppercase text-gray-500">{slug}</p>
            <div className="mt-2 grid gap-1">
              {moves.slice(0, 10).map((move) => (
                <p key={`${move.move}-${move.method}-${move.level}`}>
                  <span className="font-semibold">{move.move}</span> · Gen{" "}
                  {move.generation} · Method {move.method} · Level{" "}
                  {move.level ?? "—"} · {move.versionGroup || "All versions"}
                </p>
              ))}
            </div>
            {moves.length > 10 && (
              <p className="mt-2 text-xs text-gray-500">
                … {moves.length - 10} additional moves not shown.
              </p>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
