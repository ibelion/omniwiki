export const runtime = 'edge';

import Link from "next/link";
import { notFound } from "next/navigation";
import { pokemonData } from "@/lib/pokemon/data";
import type {
  LearnsetEntry,
  PokemonRecord,
  MoveRecord,
} from "@/lib/pokemon/types";
import { formatVersionGroups } from "@/lib/pokemon/versionGroups";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type AggregatedLearnsetEntry = {
  method: string;
  generation: string;
  level: number | null;
  versionGroups: string[];
};

type PokemonLearnerSummary = {
  pokemon: PokemonRecord;
  entries: AggregatedLearnsetEntry[];
};

const moveMeta: { label: string; key: keyof MoveRecord }[] = [
  { label: "Power", key: "power" },
  { label: "Accuracy", key: "accuracy" },
  { label: "PP", key: "pp" },
  { label: "Priority", key: "priority" },
];

const GENERATION_ORDER = [
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

const GENERATION_LABELS: Record<string, string> = {
  "generation-i": "Gen I",
  "generation-ii": "Gen II",
  "generation-iii": "Gen III",
  "generation-iv": "Gen IV",
  "generation-v": "Gen V",
  "generation-vi": "Gen VI",
  "generation-vii": "Gen VII",
  "generation-viii": "Gen VIII",
  "generation-ix": "Gen IX",
};

const METHOD_ORDER = [
  "level-up",
  "machine",
  "tutor",
  "egg",
  "light-ball-egg",
  "form-change",
  "special",
  "transfer",
];

const LEARN_VARIATION_PREVIEW_LIMIT = 4;

const renderMetaValue = (move: MoveRecord, key: keyof MoveRecord) => {
  const value = move[key];
  if (typeof value === "number" || typeof value === "string") {
    return value || "—";
  }
  return value ?? "—";
};

const getGenerationWeight = (generation: string) => {
  const index = GENERATION_ORDER.indexOf(generation);
  return index === -1 ? GENERATION_ORDER.length : index;
};

const getMethodWeight = (method: string) => {
  const index = METHOD_ORDER.indexOf(method);
  return index === -1 ? METHOD_ORDER.length : index;
};

const compareAggregatedEntries = (
  a: AggregatedLearnsetEntry,
  b: AggregatedLearnsetEntry
) => {
  const generationDiff =
    getGenerationWeight(a.generation) - getGenerationWeight(b.generation);
  if (generationDiff !== 0) return generationDiff;

  const methodDiff = getMethodWeight(a.method) - getMethodWeight(b.method);
  if (methodDiff !== 0) return methodDiff;

  const levelA = a.level ?? Number.MAX_SAFE_INTEGER;
  const levelB = b.level ?? Number.MAX_SAFE_INTEGER;
  if (levelA !== levelB) return levelA - levelB;

  return a.versionGroups.length - b.versionGroups.length;
};

const formatGenerationLabel = (generation: string) =>
  GENERATION_LABELS[generation] ??
  generation.replace("generation-", "Gen ").toUpperCase();

const startCase = (value: string) =>
  value
    .split("-")
    .map((segment) => {
      if (!segment) return segment;
      if (segment.toLowerCase() === "xd") return "XD";
      if (segment.toLowerCase() === "tm") return "TM";
      if (segment.toLowerCase() === "go") return "Go";
      if (segment.toLowerCase() === "lets") return "Let's";
      return segment[0].toUpperCase() + segment.slice(1);
    })
    .join(" ");

const formatMethodLabel = (method: string) => startCase(method);

const formatVersionGroupSummary = (
  versionGroups: string[],
  generation: string
) => {
  return formatVersionGroups(versionGroups, generation);
};

const summarizeLearners = (
  moveSlug: string,
  learnsetEntries: Record<string, LearnsetEntry[]>,
  pokemonMap: Map<string, PokemonRecord>
) => {
  const summaries = new Map<
    string,
    {
      pokemon: PokemonRecord;
      entries: Map<
        string,
        {
          method: string;
          generation: string;
          level: number | null;
          versionGroups: Set<string>;
        }
      >;
    }
  >();

  for (const [pokemonSlug, entries] of Object.entries(learnsetEntries)) {
    const creature = pokemonMap.get(pokemonSlug);
    if (!creature) continue;

    const relevantEntries = entries.filter((entry) => entry.move === moveSlug);
    if (relevantEntries.length === 0) continue;

    let existing = summaries.get(pokemonSlug);
    if (!existing) {
      existing = { pokemon: creature, entries: new Map() };
      summaries.set(pokemonSlug, existing);
    }

    for (const entry of relevantEntries) {
      const bucketKey = `${entry.method}|${entry.generation}|${
        entry.level ?? "—"
      }`;
      let bucket = existing.entries.get(bucketKey);
      if (!bucket) {
        bucket = {
          method: entry.method,
          generation: entry.generation,
          level: entry.level ?? null,
          versionGroups: new Set<string>(),
        };
        existing.entries.set(bucketKey, bucket);
      }
      if (entry.versionGroup) {
        bucket.versionGroups.add(entry.versionGroup);
      }
    }
  }

  const summariesList: PokemonLearnerSummary[] = Array.from(
    summaries.values()
  ).map(({ pokemon, entries }) => {
    const aggregatedEntries: AggregatedLearnsetEntry[] = Array.from(
      entries.values()
    )
      .map((entry) => ({
        method: entry.method,
        generation: entry.generation,
        level: entry.level,
        versionGroups: Array.from(entry.versionGroups).sort((a, b) =>
          a.localeCompare(b)
        ),
      }))
      .sort(compareAggregatedEntries);

    return { pokemon, entries: aggregatedEntries };
  });

  return summariesList.sort((a, b) => a.pokemon.id - b.pokemon.id);
};

export default async function MoveDetail({ params }: PageProps) {
  const { slug } = await params;
  const move = pokemonData.moves.find((m) => m.slug === slug);
  if (!move) {
    notFound();
  }
  // Sort moves by generation, then alphabetically for consistent quick nav
  const moveIndex = [...pokemonData.moves]
    .map((m) => ({ slug: m.slug, name: m.name, generation: m.generation }))
    .sort((a, b) => {
      const genDiff = getGenerationWeight(a.generation) - getGenerationWeight(b.generation);
      if (genDiff !== 0) return genDiff;
      return a.name.localeCompare(b.name);
    });
  const currentIndex = moveIndex.findIndex((entry) => entry.slug === move.slug);
  const previous = currentIndex > 0 ? moveIndex[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < moveIndex.length - 1
      ? moveIndex[currentIndex + 1]
      : null;

  const pokemonMap = new Map<string, PokemonRecord>(
    pokemonData.pokemon.map((p) => [p.slug, p])
  );

  const learnsetEntries = pokemonData.learnsets ?? {};
  const learnerSummaries = summarizeLearners(
    move.slug,
    learnsetEntries,
    pokemonMap
  );
  const totalLearners = learnerSummaries.length;
  const featuredLearners = learnerSummaries.slice(0, 12);

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
              href="/pokemon/moves"
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
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">Quick navigation</p>
            <div className="flex flex-wrap gap-2">
              {previous && (
                <Link
                  href={`/moves/${previous.slug}`}
                  className="rounded-lg border border-gray-200 px-3 py-1 transition hover:border-indigo-200 hover:bg-indigo-50"
                >
                  ← {previous.name}
                </Link>
              )}
              {next && (
                <Link
                  href={`/moves/${next.slug}`}
                  className="rounded-lg border border-gray-200 px-3 py-1 transition hover:border-indigo-200 hover:bg-indigo-50"
                >
                  {next.name} →
                </Link>
              )}
              <Link
                href="/moves"
                className="rounded-lg border border-gray-200 px-3 py-1 transition hover:border-gray-300 hover:bg-gray-50"
                aria-label="Back to Moves list"
              >
                Index
              </Link>
            </div>
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
              Showing {featuredLearners.length} of {totalLearners} learners.
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
            {featuredLearners.map(({ pokemon, entries }) => {
              const preview = entries.slice(0, LEARN_VARIATION_PREVIEW_LIMIT);
              return (
                <Link
                  key={pokemon.slug}
                  href={`/pokemon/${pokemon.slug}`}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-800 transition hover:border-indigo-200 hover:bg-white"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-gray-900">
                      {pokemon.name}
                    </p>
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {entries.length} pattern{entries.length === 1 ? "" : "s"}
                    </span>
                  </div>
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
                  <div className="mt-3 space-y-2">
                    {preview.map((entrySummary) => (
                      <div
                        key={`${entrySummary.method}-${entrySummary.generation}-${entrySummary.level ?? "none"}`}
                        className="rounded-lg border border-gray-100 bg-white/80 px-3 py-2"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                          <span>{formatMethodLabel(entrySummary.method)}</span>
                          <span className="text-[11px] font-medium uppercase text-gray-500">
                            {formatGenerationLabel(entrySummary.generation)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {entrySummary.level !== null
                            ? `Level ${entrySummary.level}`
                            : "No level requirement"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatVersionGroupSummary(
                            entrySummary.versionGroups,
                            entrySummary.generation
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                  {entries.length > LEARN_VARIATION_PREVIEW_LIMIT && (
                    <p className="mt-2 text-xs text-gray-500">
                      +
                      {entries.length - LEARN_VARIATION_PREVIEW_LIMIT} more learn
                      variation
                      {entries.length - LEARN_VARIATION_PREVIEW_LIMIT === 1
                        ? ""
                        : "s"}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
