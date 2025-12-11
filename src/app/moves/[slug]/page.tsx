import Link from "next/link";
import { notFound } from "next/navigation";
import { pokemonData } from "@/lib/pokemon/data";
import type { LearnsetEntry, PokemonRecord, MoveRecord } from "@/lib/pokemon/types";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const moveMeta: { label: string; key: keyof MoveRecord }[] = [
  { label: "Power", key: "power" },
  { label: "Accuracy", key: "accuracy" },
  { label: "PP", key: "pp" },
  { label: "Priority", key: "priority" },
];

const renderMetaValue = (move: MoveRecord, key: keyof MoveRecord) => {
  const value = move[key];
  if (typeof value === "number" || typeof value === "string") {
    return value || "—";
  }
  return value ?? "—";
};

export default async function MoveDetail({ params }: PageProps) {
  const { slug } = await params;
  const move = pokemonData.moves.find((m) => m.slug === slug);
  if (!move) {
    notFound();
  }

  const pokemonMap = new Map<string, PokemonRecord>(
    pokemonData.pokemon.map((p) => [p.slug, p])
  );

  const learners: { pokemon: PokemonRecord; entry: LearnsetEntry }[] = [];
  const learnsetEntries = pokemonData.learnsets ?? {};
  for (const [pokemonSlug, entries] of Object.entries(learnsetEntries)) {
    for (const entry of entries) {
      if (entry.move !== move.slug) continue;
      const creature = pokemonMap.get(pokemonSlug);
      if (creature) {
        learners.push({ pokemon: creature, entry });
      }
    }
  }

  const featuredLearners = learners.slice(0, 12);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 bg-gray-50 px-6 py-10">
      <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link
              href="/"
              className="rounded px-2 py-1 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/moves"
              className="rounded px-2 py-1 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Moves
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="rounded px-2 py-1 text-gray-700">{move.name}</li>
        </ol>
      </nav>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Move
            </p>
            <h1 className="text-3xl font-semibold text-gray-900">{move.name}</h1>
            <p className="text-sm text-gray-600">
              {move.shortEffect || "No short effect text available."}
            </p>
            {move.effect && (
              <p className="mt-3 text-sm text-gray-500">{move.effect}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-semibold text-gray-900">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
              {move.type || "Typeless"}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
              {move.damageClass || "Neutral"}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
              {move.generation}
            </span>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {moveMeta.map(({ label, key }) => (
            <div
              key={key}
              className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700"
            >
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {label}
              </p>
              <p className="text-lg font-semibold">
                {renderMetaValue(move, key)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Learned by Pokémon
            </h2>
            <p className="text-sm text-gray-600">
              Showing {featuredLearners.length} of {learners.length} learners.
            </p>
          </div>
          <Link
            href="/pokemon"
            className="rounded-lg border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-700 transition hover:border-indigo-200 hover:bg-indigo-50"
          >
            View Pokédex
          </Link>
        </div>
        {featuredLearners.length === 0 ? (
          <p className="text-sm text-gray-500">
            No Pokémon learn this move in the current data set.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {featuredLearners.map(({ pokemon, entry }) => (
              <Link
                key={pokemon.slug}
                href={`/pokemon/${pokemon.slug}`}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-800 transition hover:border-indigo-200 hover:bg-white"
              >
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-gray-900">
                    {pokemon.name}
                  </p>
                  <span className="text-xs uppercase tracking-wide text-gray-500">
                    {entry.method}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Level {entry.level ?? "—"} · Gen {entry.generation} ·{" "}
                  {entry.versionGroup || "Any version"}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {pokemon.types.map((type) => (
                    <span
                      key={type}
                      className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
