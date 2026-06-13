"use client";

import { useState } from "react";
import Link from "next/link";

interface PokemonItem {
  pokemonSlug: string;
  itemSlug: string;
  rarity: number | null;
  versions: string[];
}

interface PokemonItemsSearchClientProps {
  items: PokemonItem[];
  pokemonNames: Record<string, string>;
  itemNames: Record<string, string>;
}

export function PokemonItemsSearchClient({ items, pokemonNames, itemNames }: PokemonItemsSearchClientProps) {
  const [search, setSearch] = useState("");

  const filtered = items.filter((entry) => {
    if (search === "") return true;
    const q = search.toLowerCase();
    const pokemonName = (pokemonNames[entry.pokemonSlug] ?? entry.pokemonSlug).toLowerCase();
    const itemName = (itemNames[entry.itemSlug] ?? entry.itemSlug).toLowerCase();
    return (
      pokemonName.includes(q) ||
      entry.pokemonSlug.toLowerCase().includes(q) ||
      itemName.includes(q) ||
      entry.itemSlug.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <header className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#8892f0]">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-[#F2E8D5]">
          Pokémon-to-Item Drops ({filtered.length} unique)
        </h1>
        <p className="text-[#6b6055]">
          Held-item drops per Pokémon grouped by item, showing all versions where each item can be found.
        </p>
        <input
          type="text"
          placeholder="Search by Pokémon or item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-[#2c2c32] px-4 py-2 text-sm focus:border-[#3344aa] focus:outline-none focus:ring-2 focus:ring-[#12122a]"
        />
      </header>
      <section className="flex flex-col gap-3 text-sm text-[#d9cebe]">
        {filtered.map((entry) => {
          const pokemonName = pokemonNames[entry.pokemonSlug] ?? entry.pokemonSlug;
          const itemName = itemNames[entry.itemSlug] ?? entry.itemSlug;
          return (
            <article
              key={`${entry.pokemonSlug}-${entry.itemSlug}`}
              className="rounded-xl border border-[#1c1c22] bg-[#141418] p-4 shadow-sm"
            >
              <Link
                href={`/pokemon/${entry.pokemonSlug}`}
                className="text-xs uppercase text-[#4ab8c8] hover:underline"
              >
                {pokemonName}
              </Link>
              <p>
                <Link
                  href={`/pokemon/items/${entry.itemSlug}`}
                  className="font-semibold text-[#F2E8D5] hover:text-[#4ab8c8] hover:underline"
                >
                  {itemName}
                </Link>
                {entry.rarity != null && (
                  <span className="ml-2 text-[#6b6055]">· Rarity {entry.rarity}%</span>
                )}
                {entry.versions.length > 0 && (
                  <span className="ml-2 text-[#6b6055]">· {entry.versions.join(", ")}</span>
                )}
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
