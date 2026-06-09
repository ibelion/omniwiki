"use client";

import { useMemo, useState } from "react";
import type { MoveRecord, LearnsetEntry } from "@/lib/pokemon/types";
import { normalizeMoveSlug } from "@/lib/pokemon/moveNormalization";
import { PokemonMovesSection } from "@/components/PokemonMovesSection";
import { GENERATION_ORDER } from "@/lib/pokemon/versionGroups";

type Props = {
  entries: [
    string,
    LearnsetEntry[]
  ][];
  movesIndex: Record<string, MoveRecord>;
  pokemonMapEntries: Array<[string, { id: number; generation: string }]>;
};

export default function LearnsetsMovesStyleClient({ entries, movesIndex, pokemonMapEntries }: Props) {
  const [query, setQuery] = useState("");
  const [expandedGens, setExpandedGens] = useState<Set<string>>(
    new Set(GENERATION_ORDER.length > 0 ? [GENERATION_ORDER[0]] : [])
  );

  const pokemonMap = useMemo(() => new Map(pokemonMapEntries), [pokemonMapEntries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(([slug, moves]) =>
      slug.toLowerCase().includes(q) ||
      moves.some((m) =>
        (m.method ?? "").toLowerCase().includes(q) ||
        (m.generation ?? "").toLowerCase().includes(q) ||
        (m.move ?? "").toLowerCase().includes(q)
      )
    );
  }, [entries, query]);

  const groupedByGen = useMemo(() => {
    const grouped = new Map<string, typeof entries>();
    for (const gen of GENERATION_ORDER) grouped.set(gen, []);
    for (const entry of filtered) {
      const pkmnData = pokemonMap.get(entry[0]);
      if (!pkmnData) continue;
      const arr = grouped.get(pkmnData.generation) ?? [];
      arr.push(entry);
      grouped.set(pkmnData.generation, arr);
    }
    return Array.from(grouped.entries()).filter(([, arr]) => arr.length > 0);
  }, [filtered, pokemonMap]);

  const toggleGen = (gen: string) => {
    const newSet = new Set(expandedGens);
    if (newSet.has(gen)) newSet.delete(gen);
    else newSet.add(gen);
    setExpandedGens(newSet);
  };

  return (
    <>
      <header className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#8892f0]">Pokémon</p>
        <h1 className="text-3xl font-semibold text-[#F2E8D5]">Learnsets ({filtered.length} Pokémon)</h1>
        <p className="text-[#6b6055]">Rendered with the same grouping and UI as the Pokémon page’s moves section.</p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search by Pokémon slug, move, generation, or method..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-[#2c2c32] px-4 py-2 text-sm focus:border-[#3344aa] focus:outline-none focus:ring-2 focus:ring-[#12122a]"
          />
        </div>
      </header>
      <section className="flex flex-col gap-6">
        {groupedByGen.map(([gen, pokemonList]) => {
          const isExpanded = expandedGens.has(gen);
          const GENERATION_LABELS: Record<string, string> = {
            "generation-i": "Generation I",
            "generation-ii": "Generation II",
            "generation-iii": "Generation III",
            "generation-iv": "Generation IV",
            "generation-v": "Generation V",
            "generation-vi": "Generation VI",
            "generation-vii": "Generation VII",
            "generation-viii": "Generation VIII",
            "generation-ix": "Generation IX",
          };
          return (
            <div key={gen} className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
              <button
                type="button"
                onClick={() => toggleGen(gen)}
                className="w-full flex items-center justify-between text-left transition hover:opacity-70"
                aria-expanded={isExpanded}
              >
                <h2 className="text-2xl font-semibold text-[#F2E8D5]">
                  {GENERATION_LABELS[gen] || gen}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#6b6055]">
                    {pokemonList.length} Pokémon
                  </span>
                  <span className="text-xl text-[#6b6055]">
                    {isExpanded ? "−" : "+"}
                  </span>
                </div>
              </button>
              {isExpanded && (
                <div className="mt-4 flex flex-col gap-4">
                  {pokemonList.map(([slug, moves]) => {
          const movesByGeneration = new Map<string, { move: MoveRecord; entry: { generation: string; method: string; level: number | null; versionGroups: string[] } }[]>();
          for (const gen of GENERATION_ORDER) movesByGeneration.set(gen, []);
          
          // Build a normalized index so variant slugs map to base move
          const normalizedIndex = new Map<string, MoveRecord>(
            Object.entries(movesIndex).map(([slug, rec]) => [normalizeMoveSlug(slug), rec])
          );
          // Group by normalized-move+generation+method+level to aggregate version groups
          const aggregateMap = new Map<string, { move: MoveRecord; generation: string; method: string; level: number | null; versionGroups: string[] }>();
          for (const m of moves) {
            const baseSlug = normalizeMoveSlug(m.move);
            const mr = normalizedIndex.get(baseSlug);
            if (!mr) continue;
            const key = `${baseSlug}|${m.generation}|${m.method}|${m.level ?? "null"}`;
            const existing = aggregateMap.get(key);
            if (existing) {
              if (m.versionGroup && !existing.versionGroups.includes(m.versionGroup)) {
                existing.versionGroups.push(m.versionGroup);
              }
            } else {
              aggregateMap.set(key, {
                move: mr,
                generation: m.generation,
                method: m.method,
                level: m.level,
                versionGroups: m.versionGroup ? [m.versionGroup] : [],
              });
            }
          }
          
          // Build the movesByGeneration map from aggregated data
          for (const agg of aggregateMap.values()) {
            const arr = movesByGeneration.get(agg.generation) ?? [];
            arr.push({
              move: agg.move,
              entry: {
                generation: agg.generation,
                method: agg.method,
                level: agg.level,
                versionGroups: agg.versionGroups.sort(),
              },
            });
            movesByGeneration.set(agg.generation, arr);
          }

          return (
            <article key={slug} className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-4 shadow-sm">
              <p className="mb-2 text-xs uppercase text-[#6b6055]">{slug}</p>
              <PokemonMovesSection movesByGeneration={Object.fromEntries(movesByGeneration)} />
            </article>
                  );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </>
  );
}
