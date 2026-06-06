import Link from "next/link";
import { notFound } from "next/navigation";
import { pokemonData } from "@/lib/pokemon/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";
import { normalizeMoveSlug, createNormalizedMoveIndex } from "@/lib/pokemon/moveNormalization";
import type { LearnsetEntry, MoveRecord } from "@/lib/pokemon/types";

type PageProps = {
  params: Promise<{ slug: string }>;
};


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

const METHOD_LABELS: Record<string, string> = {
  "level-up": "Level Up",
  machine: "TM / HM",
  tutor: "Move Tutor",
  egg: "Egg Moves",
  "light-ball-egg": "Light Ball Egg",
  "form-change": "Form Change",
  special: "Special",
  transfer: "Transfer",
};

function genLabel(gen: string) {
  return GENERATION_LABELS[gen] ?? gen.replace("generation-", "Gen ").toUpperCase();
}

function methodLabel(method: string) {
  return (
    METHOD_LABELS[method] ??
    method
      .split("-")
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join(" ")
  );
}

function sortByGeneration(gens: string[]) {
  return [...gens].sort((a, b) => {
    const ai = GENERATION_ORDER.indexOf(a);
    const bi = GENERATION_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

function sortMethods(methods: string[]) {
  return [...methods].sort((a, b) => {
    const ai = METHOD_ORDER.indexOf(a);
    const bi = METHOD_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

type GroupedEntry = {
  moveSlug: string;
  move: MoveRecord | undefined;
  level: number | null;
  generations: string[];
};

function groupByMethod(
  entries: LearnsetEntry[],
  moveIndex: Map<string, MoveRecord>
): Map<string, GroupedEntry[]> {
  const methodMap = new Map<string, Map<string, GroupedEntry>>();

  for (const entry of entries) {
    const normalSlug = normalizeMoveSlug(entry.move);
    const move = moveIndex.get(normalSlug);

    if (!methodMap.has(entry.method)) {
      methodMap.set(entry.method, new Map());
    }
    const moveMap = methodMap.get(entry.method)!;

    // Include level in the key so same move learned at multiple levels appears separately
    const key = `${normalSlug}|${entry.level ?? ""}`;
    if (!moveMap.has(key)) {
      moveMap.set(key, {
        moveSlug: normalSlug,
        move,
        level: entry.level ?? null,
        generations: [],
      });
    }
    const agg = moveMap.get(key)!;
    if (!agg.generations.includes(entry.generation)) {
      agg.generations.push(entry.generation);
    }
  }

  const result = new Map<string, GroupedEntry[]>();
  for (const [method, moveMap] of methodMap.entries()) {
    const sorted = Array.from(moveMap.values()).sort((a, b) => {
      if (a.level !== null && b.level !== null) return a.level - b.level;
      if (a.level !== null) return -1;
      if (b.level !== null) return 1;
      const nameA = a.move?.name ?? a.moveSlug;
      const nameB = b.move?.name ?? b.moveSlug;
      return nameA.localeCompare(nameB);
    });
    result.set(method, sorted);
  }

  return result;
}

export default async function LearnsetDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const pokemon = pokemonData.pokemon.find((p) => p.slug === slug);
  if (!pokemon) notFound();

  const entries = (pokemonData.learnsets ?? {})[slug] ?? [];
  if (entries.length === 0) notFound();

  const moveIndex = createNormalizedMoveIndex(pokemonData.moves);
  const grouped = groupByMethod(entries, moveIndex);
  const methods = sortMethods(Array.from(grouped.keys()));

  const totalMoves = Array.from(grouped.values()).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 bg-gray-50 px-6 py-10">
      <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="rounded px-2 py-1 transition hover:bg-gray-100 hover:text-gray-900">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/pokemon" className="rounded px-2 py-1 transition hover:bg-gray-100 hover:text-gray-900">
              Pokémon
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/pokemon/learnsets" className="rounded px-2 py-1 transition hover:bg-gray-100 hover:text-gray-900">
              Learnsets
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="rounded px-2 py-1 text-gray-700">{pokemon.name}</li>
        </ol>
      </nav>

      {/* Header */}
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <ImageWithFallback
            src={`/pokemoncontent/${pokemon.sprites.default}`}
            alt={`${pokemon.name} sprite`}
            className="h-24 w-24 flex-shrink-0 rounded-2xl border border-gray-100 bg-gray-50 object-contain"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Learnset
            </p>
            <h1 className="text-3xl font-semibold text-gray-900">{pokemon.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              #{pokemon.id.toString().padStart(3, "0")} ·{" "}
              {pokemon.generation.replace("generation-", "Gen ")} ·{" "}
              {totalMoves} move{totalMoves !== 1 ? "s" : ""} across {methods.length} method{methods.length !== 1 ? "s" : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {pokemon.types.map((type) => (
                <Link
                  key={type}
                  href={`/pokemon/types/${type}`}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold capitalize text-indigo-700 transition hover:bg-indigo-100"
                >
                  {type}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <Link
              href={`/pokemon/${slug}`}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              View Pokédex entry →
            </Link>
          </div>
        </div>
      </section>

      {/* Learnset tables by method */}
      {methods.map((method) => {
        const moves = grouped.get(method)!;
        return (
          <section
            key={method}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              {methodLabel(method)}{" "}
              <span className="text-sm font-normal text-gray-400">
                ({moves.length})
              </span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {method === "level-up" && <th className="pb-2 pr-4 w-10">Lv</th>}
                    <th className="pb-2 pr-4">Move</th>
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4">Class</th>
                    <th className="pb-2 pr-4 w-12">Pwr</th>
                    <th className="pb-2 pr-4 w-12">Acc</th>
                    <th className="pb-2">Gens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {moves.map((entry) => (
                    <tr
                      key={`${entry.moveSlug}-${entry.level ?? ""}`}
                      className="hover:bg-gray-50"
                    >
                      {method === "level-up" && (
                        <td className="py-2 pr-4 font-mono text-xs text-gray-400">
                          {entry.level ?? "—"}
                        </td>
                      )}
                      <td className="py-2 pr-4">
                        <Link
                          href={`/pokemon/moves/${entry.moveSlug}`}
                          className="font-semibold text-indigo-700 hover:underline"
                        >
                          {entry.move?.name ?? entry.moveSlug}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">
                        {entry.move?.type ? (
                          <Link
                            href={`/pokemon/types/${entry.move.type}`}
                            className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold capitalize text-indigo-700 transition hover:bg-indigo-100"
                          >
                            {entry.move.type}
                          </Link>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-xs capitalize text-gray-500">
                        {entry.move?.damageClass ?? "—"}
                      </td>
                      <td className="py-2 pr-4 text-xs text-gray-500">
                        {entry.move?.power ?? "—"}
                      </td>
                      <td className="py-2 pr-4 text-xs text-gray-500">
                        {entry.move?.accuracy ?? "—"}
                      </td>
                      <td className="py-2 text-xs text-gray-400">
                        {sortByGeneration(entry.generations).map(genLabel).join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      <div className="flex gap-3">
        <BackLink href="/pokemon/learnsets" label="Back to Learnsets" />
      </div>
    </main>
  );
}
