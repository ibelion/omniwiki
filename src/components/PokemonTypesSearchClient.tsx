"use client";

import { useState } from "react";
import Link from "next/link";

interface PokemonType {
  pokemonSlug: string;
  slot: number | null;
  typeSlug: string;
}

interface PokemonTypesSearchClientProps {
  types: PokemonType[];
  pokemonNames: Record<string, string>;
  typeNames: Record<string, string>;
}

export function PokemonTypesSearchClient({ types, pokemonNames, typeNames }: PokemonTypesSearchClientProps) {
  const [search, setSearch] = useState("");

  const filtered = types.filter((entry) => {
    if (search === "") return true;
    const q = search.toLowerCase();
    const pokemonName = (pokemonNames[entry.pokemonSlug] ?? entry.pokemonSlug).toLowerCase();
    const typeName = (typeNames[entry.typeSlug] ?? entry.typeSlug).toLowerCase();
    return (
      pokemonName.includes(q) ||
      entry.pokemonSlug.toLowerCase().includes(q) ||
      typeName.includes(q) ||
      entry.typeSlug.toLowerCase().includes(q)
    );
  });

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
          Direct mapping from pokemon_types data. Useful for verifying type slots and bridging to external systems.
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
        {filtered.map((entry) => {
          const pokemonName = pokemonNames[entry.pokemonSlug] ?? entry.pokemonSlug;
          const typeName = typeNames[entry.typeSlug] ?? entry.typeSlug;
          return (
            <article
              key={`${entry.pokemonSlug}-${entry.slot}-${entry.typeSlug}`}
              className="rounded-xl border border-[#1c1c22] bg-[#141418] p-4 shadow-sm"
            >
              <Link
                href={`/pokemon/${entry.pokemonSlug}`}
                className="text-xs uppercase text-[#4ab8c8] hover:underline"
              >
                {pokemonName}
              </Link>
              <p>
                <span className="text-[#6b6055]">Slot {entry.slot ?? "?"}: </span>
                <Link
                  href={`/pokemon/types/${entry.typeSlug}`}
                  className="font-semibold text-[#F2E8D5] hover:text-[#4ab8c8] hover:underline"
                >
                  {typeName}
                </Link>
              </p>
            </article>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-[#6b6055]">No results match your search.</p>
        )}
      </section>
    </>
  );
}
