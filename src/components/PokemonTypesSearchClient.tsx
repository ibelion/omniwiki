"use client";

import { useState } from "react";

interface PokemonType {
  pokemonSlug: string;
  slot: number | null;
  typeSlug: string;
}

interface PokemonTypesSearchClientProps {
  types: PokemonType[];
}

export function PokemonTypesSearchClient({ types }: PokemonTypesSearchClientProps) {
  const [search, setSearch] = useState("");
  
  const filtered = types.filter((entry) =>
    search === "" ||
    entry.pokemonSlug.toLowerCase().includes(search.toLowerCase()) ||
    entry.typeSlug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Pokémon Type Slots ({filtered.length})
        </h1>
        <p className="text-gray-600">
          Direct mapping from `pokemon_types.csv`. Useful for verifying type
          slots and bridging to external systems.
        </p>
        <input
          type="text"
          placeholder="Search by Pokémon or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </header>
      <section className="flex flex-col gap-3 text-sm text-gray-800">
        {filtered.map((entry) => (
          <article
            key={`${entry.pokemonSlug}-${entry.slot}-${entry.typeSlug}`}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs uppercase text-gray-500">
              {entry.pokemonSlug}
            </p>
            <p>
              Slot {entry.slot ?? "?"}: {entry.typeSlug}
            </p>
          </article>
        ))}
      </section>
    </>
  );
}
