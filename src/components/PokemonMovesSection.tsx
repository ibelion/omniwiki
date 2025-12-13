"use client";

import { useState } from "react";
import Link from "next/link";
import type { MoveRecord } from "@/lib/pokemon/types";
import type { AggregatedLearnsetEntry } from "@/lib/pokemon/learnsets";
import { GENERATION_ORDER, GENERATION_LABELS, formatVersionGroups } from "@/lib/pokemon/versionGroups";

type MoveWithEntry = {
  move: MoveRecord;
  entry: AggregatedLearnsetEntry;
};

type GenerationGroup = {
  generation: string;
  moves: MoveWithEntry[];
};

type PokemonMovesSectionProps = {
  movesByGeneration: Map<string, MoveWithEntry[]>;
};

const METHOD_LABELS: Record<string, string> = {
  "level-up": "Level-up",
  "machine": "TM/HM",
  "tutor": "Tutor",
  "egg": "Egg",
  "light-ball-egg": "Light Ball Egg",
  "form-change": "Form Change",
  "special": "Special",
  "transfer": "Transfer",
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
] as const;

export const PokemonMovesSection = ({
  movesByGeneration,
}: PokemonMovesSectionProps) => {
  const [expandedGenerations, setExpandedGenerations] = useState<Set<string>>(
    new Set(GENERATION_ORDER.length > 0 ? [GENERATION_ORDER[0]] : [])
  );

  const handleToggleGeneration = (generation: string) => {
    const newExpanded = new Set(expandedGenerations);
    if (newExpanded.has(generation)) {
      newExpanded.delete(generation);
    } else {
      newExpanded.add(generation);
    }
    setExpandedGenerations(newExpanded);
  };

  const generations: GenerationGroup[] = GENERATION_ORDER.map((gen) => ({
    generation: gen,
    moves: movesByGeneration.get(gen) || [],
  })).filter((group) => group.moves.length > 0);

  if (generations.length === 0) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Moves</h2>
          <Link
            href="/pokemon/moves"
            className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
          >
            Browse moves →
          </Link>
        </div>
        <p className="text-sm text-gray-500">
          No learnset data is available for this Pokémon.
        </p>
      </section>
    );
  }

  const groupedByMethod = (moves: MoveWithEntry[]) => {
    const grouped = new Map<string, MoveWithEntry[]>();
    for (const moveEntry of moves) {
      const method = moveEntry.entry.method;
      if (!grouped.has(method)) {
        grouped.set(method, []);
      }
      grouped.get(method)!.push(moveEntry);
    }
    return grouped;
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Moves</h2>
        <Link
          href="/pokemon/moves"
          className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
        >
          Browse moves →
        </Link>
      </div>
      <div className="space-y-3">
        {generations.map(({ generation, moves }) => {
          const isExpanded = expandedGenerations.has(generation);
          const methodGroups = groupedByMethod(moves);

          return (
            <div
              key={generation}
              className="rounded-lg border border-gray-100 bg-gray-50"
            >
              <button
                type="button"
                onClick={() => handleToggleGeneration(generation)}
                className="w-full flex items-center justify-between px-4 py-3 text-left transition hover:bg-gray-100"
                aria-expanded={isExpanded}
              >
                <span className="text-sm font-semibold text-gray-900">
                  {GENERATION_LABELS[generation] || generation}
                </span>
                <span className="text-xs text-gray-500">
                  {moves.length} move{moves.length === 1 ? "" : "s"}
                </span>
                <span className="text-gray-400">
                  {isExpanded ? "−" : "+"}
                </span>
              </button>
              {isExpanded && (
                <div className="border-t border-gray-200 p-4">
                  <div className="space-y-4">
                    {Array.from(methodGroups.entries())
                      .sort(([a], [b]) => {
                        const indexA = (METHOD_ORDER as readonly string[]).indexOf(a);
                        const indexB = (METHOD_ORDER as readonly string[]).indexOf(b);
                        const orderA = indexA === -1 ? METHOD_ORDER.length : indexA;
                        const orderB = indexB === -1 ? METHOD_ORDER.length : indexB;
                        return orderA - orderB;
                      })
                      .map(([method, methodMoves]) => (
                        <div key={method}>
                          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {METHOD_LABELS[method] || method}
                          </h3>
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {methodMoves
                              .sort((a, b) => {
                                const levelA = a.entry.level ?? Number.MAX_SAFE_INTEGER;
                                const levelB = b.entry.level ?? Number.MAX_SAFE_INTEGER;
                                if (levelA !== levelB) return levelA - levelB;
                                return a.move.name.localeCompare(b.move.name);
                              })
                              .map(({ move, entry }) => (
                                <Link
                                  key={`${move.id}-${entry.generation}-${entry.method}-${entry.level ?? "none"}-${entry.versionGroups.join(",")}`}
                                  href={`/moves/${move.slug}`}
                                  className="rounded-lg border border-gray-100 bg-white p-3 text-sm text-gray-700 transition hover:border-indigo-200 hover:bg-indigo-50"
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="font-semibold text-gray-900">
                                      {move.name}
                                    </p>
                                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                                      {move.type || "—"}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs text-gray-600">
                                    {move.shortEffect}
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-gray-500">
                                    {entry.level !== null && (
                                      <span className="rounded bg-gray-100 px-1.5 py-0.5">
                                        Lv. {entry.level}
                                      </span>
                                    )}
                                    <span className="rounded bg-gray-100 px-1.5 py-0.5">
                                      {formatVersionGroups(
                                        entry.versionGroups,
                                        entry.generation
                                      )}
                                    </span>
                                  </div>
                                </Link>
                              ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

