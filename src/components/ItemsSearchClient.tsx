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
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Items ({filtered.length.toLocaleString()})
        </h1>
        <p className="text-gray-600">
          Held items, TMs, berries, and more. Click any item for full details.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by name or effect…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
            className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50">
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
              <p className="truncate font-semibold text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-400">
                {item.category ?? "—"}
                {item.cost != null ? ` · ₽${item.cost.toLocaleString()}` : ""}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                {item.shortEffect ?? item.effect ?? "No description."}
              </p>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-gray-500">
            No items match your search.
          </p>
        )}
      </section>
    </>
  );
}
