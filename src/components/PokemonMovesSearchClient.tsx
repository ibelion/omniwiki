"use client";

import { useState, useMemo } from "react";
import type { MoveRecord } from "@/lib/pokemon/types";

type Props = {
  moves: MoveRecord[];
};

export default function PokemonMovesSearchClient({ moves }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const arr = q
      ? moves.filter((m) =>
          m.name.toLowerCase().includes(q) ||
          (m.shortEffect ?? "").toLowerCase().includes(q) ||
          (m.effect ?? "").toLowerCase().includes(q) ||
          (m.type ?? "").toLowerCase().includes(q) ||
          m.generation.toLowerCase().includes(q) ||
          (m.damageClass ?? "").toLowerCase().includes(q)
        )
      : moves.slice();
    return arr.sort((a, b) => {
      const gen = a.generation.localeCompare(b.generation);
      if (gen !== 0) return gen;
      return a.name.localeCompare(b.name);
    });
  }, [moves, query]);

  return (
    <>
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Pokémon</p>
        <h1 className="text-3xl font-semibold text-gray-900">Moves ({filtered.length})</h1>
        <p className="text-gray-600">Browse and search all Pokémon moves.</p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search by name, type, generation, or effect..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </header>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <article key={m.slug} className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
              <p className="text-xs uppercase text-gray-500">{m.generation}</p>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{m.name}</h2>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">{m.type ?? "—"}</span>
              </div>
              {m.shortEffect && <p className="mt-1 text-xs text-gray-700">{m.shortEffect}</p>}
              {m.effect && <p className="mt-1 text-xs text-gray-600">{m.effect}</p>}
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-600">
                {m.damageClass && <span className="rounded bg-gray-100 px-1.5 py-0.5">{m.damageClass}</span>}
                {m.power != null && <span className="rounded bg-gray-100 px-1.5 py-0.5">Power {m.power}</span>}
                {m.accuracy != null && <span className="rounded bg-gray-100 px-1.5 py-0.5">Acc {m.accuracy}</span>}
                {m.pp != null && <span className="rounded bg-gray-100 px-1.5 py-0.5">PP {m.pp}</span>}
                {m.priority != null && <span className="rounded bg-gray-100 px-1.5 py-0.5">Prio {m.priority}</span>}
              </div>
              <a href={m.sourceUrl} target="_blank" className="mt-2 inline-block text-xs font-semibold text-indigo-600">Source →</a>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
