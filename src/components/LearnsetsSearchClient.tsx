"use client";

import { useState, useMemo } from "react";
import { aggregateLearnsets } from "@/lib/pokemon/learnsets";
import { GENERATION_LABELS, formatVersionGroups } from "@/lib/pokemon/versionGroups";

type Props = {
  entries: [string, { move: string; generation: string; method: string; level: number | null; versionGroup: string | null }[]][];
};

export default function LearnsetsSearchClient({ entries }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const arr = q
      ? entries.filter(([slug, moves]) =>
          slug.toLowerCase().includes(q) ||
          moves.some((m) =>
            (m.method ?? "").toLowerCase().includes(q) ||
            (m.generation ?? "").toLowerCase().includes(q) ||
            (m.move ?? "").toLowerCase().includes(q)
          )
        )
      : entries.slice();
    return arr;
  }, [entries, query]);

  return (
    <>
      <header className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#8892f0]">Pokémon</p>
        <h1 className="text-3xl font-semibold text-[#F2E8D5]">Learnset Map ({filtered.length} Pokémon)</h1>
        <p className="text-[#6b6055]">Search aggregated moves by Pokémon slug, generation, method, or move name.</p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search Pokémon learnsets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-[#2c2c32] px-4 py-2 text-sm focus:border-[#3344aa] focus:outline-none focus:ring-2 focus:ring-[#12122a]"
          />
        </div>
      </header>
      <section className="flex flex-col gap-4">
        {filtered.map(([slug, moves]) => {
          const aggregated = aggregateLearnsets(moves);
          const totalEntries = Array.from(aggregated.values()).flat().length;

          return (
            <article key={slug} className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-4 shadow-sm text-sm text-[#d9cebe]">
              <p className="text-xs uppercase text-[#6b6055]">{slug}</p>
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
                    <div key={generation} className="rounded-lg border border-[#1c1c22] bg-[#0c0c0e] p-3">
                      <p className="mb-2 text-xs font-semibold uppercase text-[#6b6055]">
                        {GENERATION_LABELS[generation] || generation}
                      </p>
                      <div className="space-y-1">
                        {entries.slice(0, 5).map((entry, idx) => (
                          <p key={idx} className="text-xs">
                            <span className="font-semibold">{entry.method}</span>
                            {entry.level !== null && <> · Level {entry.level}</>}
                            {" · "}
                            {formatVersionGroups(entry.versionGroups, entry.generation)}
                          </p>
                        ))}
                        {entries.length > 5 && (
                          <p className="text-xs text-[#6b6055]">+{entries.length - 5} more entries</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              {totalEntries > 0 && (
                <p className="mt-2 text-xs text-[#6b6055]">{totalEntries} aggregated entr{totalEntries === 1 ? "y" : "ies"} total</p>
              )}
            </article>
          );
        })}
      </section>
    </>
  );
}
