"use client";

import { useState, useMemo } from "react";
import type { AbilityRecord } from "@/lib/pokemon/types";

type Props = {
  abilities: AbilityRecord[];
};

export default function PokemonAbilitiesSearchClient({ abilities }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const arr = q
      ? abilities.filter((a) =>
          a.name.toLowerCase().includes(q) ||
          (a.shortEffect ?? "").toLowerCase().includes(q) ||
          (a.effect ?? "").toLowerCase().includes(q) ||
          a.generation.toLowerCase().includes(q)
        )
      : abilities.slice();
    return arr.sort((a, b) => {
      const gen = a.generation.localeCompare(b.generation);
      if (gen !== 0) return gen;
      return a.name.localeCompare(b.name);
    });
  }, [abilities, query]);

  return (
    <>
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Pokémon</p>
        <h1 className="text-3xl font-semibold text-gray-900">Abilities ({filtered.length})</h1>
        <p className="text-gray-600">Browse and search all Pokémon abilities.</p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search by name, generation, or effect..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </header>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <article key={a.slug} className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
              <p className="text-xs uppercase text-gray-500">{a.generation}</p>
              <h2 className="text-lg font-semibold text-gray-900">{a.name}</h2>
              {a.shortEffect && <p className="mt-1 text-xs text-gray-700">{a.shortEffect}</p>}
              {a.effect && <p className="mt-1 text-xs text-gray-600">{a.effect}</p>}
              <a href={a.sourceUrl} target="_blank" className="mt-2 inline-block text-xs font-semibold text-indigo-600">Source →</a>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
