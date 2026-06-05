"use client";

import { useState } from "react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { ItemRecord } from "@/lib/pokemon/types";

interface ItemsSearchClientProps {
  items: ItemRecord[];
}

export function ItemsSearchClient({ items }: ItemsSearchClientProps) {
  const [search, setSearch] = useState("");
  
  const filtered = items.filter((item) =>
    search === "" ||
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.category || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Held Items ({filtered.length})
        </h1>
        <p className="text-gray-600">
          Raw held items from `items.csv`, including categories, costs, and
          descriptions for OmniGames ingestion.
        </p>
        <input
          type="text"
          placeholder="Search by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <article
            key={item.slug}
            className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              {item.sprite && (
                <ImageWithFallback
                  src={`/pokemoncontent/${item.sprite}`}
                  alt={item.name}
                  className="h-10 w-10 flex-shrink-0 rounded-lg border border-gray-100 bg-gray-50 object-contain"
                />
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{item.name}</h2>
                <p className="text-xs text-gray-500">
                  {item.category || "—"} · Gen {item.generation || "?"}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Cost: {item.cost ?? "—"}</p>
            <p className="text-sm text-gray-600">
              {item.shortEffect || item.effect || "No description available."}
            </p>
          </article>
        ))}
      </section>
    </>
  );
}
