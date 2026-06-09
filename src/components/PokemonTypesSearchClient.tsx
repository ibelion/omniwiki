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
      <header className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#8892f0]">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-[#F2E8D5]">
          Pokémon Type Slots ({filtered.length})
        </h1>
        <p className="text-[#6b6055]">
          Direct mapping from `pokemon_types.csv`. Useful for verifying type
          slots and bridging to external systems.
        </p>
        <input
          type="text"
          placeholder="Search by Pokémon or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-[#2c2c32] px-4 py-2 text-sm focus:border-[#3344aa] focus:outline-none focus:ring-2 focus:ring-[#12122a]"
        />
      </header>
      <section className="flex flex-col gap-3 text-sm text-[#d9cebe]">
        {filtered.map((entry) => (
          <article
            key={`${entry.pokemonSlug}-${entry.slot}-${entry.typeSlug}`}
            className="rounded-xl border border-[#1c1c22] bg-[#141418] p-4 shadow-sm"
          >
            <p className="text-xs uppercase text-[#6b6055]">
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
