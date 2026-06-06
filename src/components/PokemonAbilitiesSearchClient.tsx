"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { AbilityRecord } from "@/lib/pokemon/types";

type Props = {
  abilities: AbilityRecord[];
};

function AbilityCard({ ability }: { ability: AbilityRecord }) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW = 6;
  const shown = expanded ? ability.pokemon : ability.pokemon.slice(0, PREVIEW);

  return (
    <article className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
      <p className="text-xs uppercase text-gray-500">{ability.generation}</p>
      <Link
        href={`/pokemon/abilities/${ability.slug}`}
        className="group inline-block"
      >
        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700">
          {ability.name}
        </h2>
      </Link>
      {ability.shortEffect && <p className="mt-1 text-xs text-gray-700">{ability.shortEffect}</p>}
      {ability.pokemon.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold text-gray-500">
            {ability.pokemon.length} Pokémon
          </p>
          <div className="flex flex-wrap gap-1">
            {shown.map((slug) => (
              <Link
                key={slug}
                href={`/pokemon/${slug}`}
                className="rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                {slug.replace(/-/g, " ")}
              </Link>
            ))}
          </div>
          {ability.pokemon.length > PREVIEW && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
            >
              {expanded ? "Show less" : `+${ability.pokemon.length - PREVIEW} more`}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

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
            <AbilityCard key={a.slug} ability={a} />
          ))}
        </div>
      </section>
    </>
  );
}
