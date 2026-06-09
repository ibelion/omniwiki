"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { ItemRecord } from "@/lib/pokemon/types";

interface ItemsSearchClientProps {
  items: ItemRecord[];
}

export function ItemsSearchClient({ items }: ItemsSearchClientProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      if (item.category) set.add(item.category);
    }
    return ["all", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.shortEffect ?? "").toLowerCase().includes(q) ||
        (item.effect ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, search, categoryFilter]);

  return (
    <>
      <header className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#8892f0]">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-[#F2E8D5]">
          Items ({filtered.length.toLocaleString()})
        </h1>
        <p className="text-[#6b6055]">
          Held items, TMs, berries, and more. Click any item for full details.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by name or effect…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-lg border border-[#2c2c32] px-4 py-2 text-sm focus:border-[#3344aa] focus:outline-none focus:ring-2 focus:ring-[#12122a]"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-[#2c2c32] px-3 py-2 text-sm text-[#9a8c7e] focus:border-[#3344aa] focus:outline-none focus:ring-2 focus:ring-[#12122a]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>
        </div>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <Link
            key={item.slug}
            href={`/pokemon/items/${item.slug}`}
            className="flex items-start gap-3 rounded-xl border border-[#1c1c22] bg-[#141418] p-3 shadow-sm transition hover:border-[#22224a] hover:bg-[#12122a]"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-[#1c1c22] bg-[#0c0c0e]">
              {item.sprite ? (
                <ImageWithFallback
                  src={`/pokemoncontent/${item.sprite}`}
                  alt={item.name}
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <span className="text-xl text-gray-300">?</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-[#F2E8D5]">{item.name}</p>
              <p className="text-xs text-[#6b6055]">
                {item.category ?? "—"}
                {item.cost != null ? ` · ₽${item.cost.toLocaleString()}` : ""}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-[#6b6055]">
                {item.shortEffect ?? item.effect ?? "No description."}
              </p>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-[#6b6055]">
            No items match your search.
          </p>
        )}
      </section>
    </>
  );
}
