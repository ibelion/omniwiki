"use client";

import { useState } from "react";
import { ImageWithFallback } from "@/components/ImageWithFallback";

interface Sprite {
  pokemonSlug: string;
  spriteType: string;
  image: string;
}

interface SpritesSearchClientProps {
  sprites: Sprite[];
}

export function SpritesSearchClient({ sprites }: SpritesSearchClientProps) {
  const [search, setSearch] = useState("");

  const filtered = sprites.filter((sprite) =>
    search === "" ||
    sprite.pokemonSlug.toLowerCase().includes(search.toLowerCase()) ||
    sprite.spriteType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#8892f0]">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-[#F2E8D5]">
          Sprite Catalog ({filtered.length})
        </h1>
        <p className="text-[#6b6055]">
          Sprite entries from `pokemon_sprites.csv`. Useful for verifying asset
          availability or powering external ingestion.
        </p>
        <input
          type="text"
          placeholder="Search by Pokémon or sprite type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-[#2c2c32] px-4 py-2 text-sm focus:border-[#3344aa] focus:outline-none focus:ring-2 focus:ring-[#12122a]"
        />
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((sprite, idx) => (
          <article
            key={`${sprite.pokemonSlug}-${sprite.spriteType}-${sprite.image}-${idx}`}
            className="flex flex-col gap-2 rounded-2xl border border-[#1c1c22] bg-[#141418] p-4 shadow-sm text-sm"
          >
            <p className="text-xs uppercase text-[#6b6055]">
              {sprite.pokemonSlug}
            </p>
            <p className="text-lg font-semibold text-[#F2E8D5]">
              {sprite.spriteType}
            </p>
            <ImageWithFallback
              src={`/pokemoncontent/${sprite.image}`}
              alt={`${sprite.pokemonSlug} ${sprite.spriteType}`}
              className="h-32 w-full rounded-lg border border-[#1c1c22] object-contain bg-[#0c0c0e]"
            />
            <p className="text-xs text-[#6b6055] break-all">{sprite.image}</p>
          </article>
        ))}
      </section>
    </>
  );
}
