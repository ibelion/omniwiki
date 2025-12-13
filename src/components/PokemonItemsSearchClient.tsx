"use client";

import { useState } from "react";

interface PokemonItem {
  pokemonSlug: string;
  itemSlug: string;
  rarity: number | null;
  versions: string[];
}

interface PokemonItemsSearchClientProps {
  items: PokemonItem[];
}

export function PokemonItemsSearchClient({ items }: PokemonItemsSearchClientProps) {
  const [search, setSearch] = useState("");
  
  const filtered = items.filter((entry) =>
    search === "" ||
    entry.pokemonSlug.toLowerCase().includes(search.toLowerCase()) ||
    entry.itemSlug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Pokémon-to-Item Drops ({filtered.length} unique)
        </h1>
        <p className="text-gray-600">
          Held-item drops per Pokémon grouped by item, showing all versions where each item can be found.
        </p>
        <input
          type="text"
          placeholder="Search by Pokémon or item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </header>
      <section className="flex flex-col gap-3 text-sm text-gray-800">
        {filtered.map((entry) => (
          <article
            key={`${entry.pokemonSlug}-${entry.itemSlug}`}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs uppercase text-gray-500">
              {entry.pokemonSlug}
            </p>
            <p>
              <span className="font-semibold">{entry.itemSlug}</span> · Rarity{" "}
              {entry.rarity ?? "?"} 
              {entry.versions.length > 0 && (
                <> · Versions: {entry.versions.join(", ")}</>
              )}
            </p>
          </article>
        ))}
      </section>
    </>
  );
}
