"use client";

import { useState, useMemo } from "react";
import { leagueData } from "@/lib/league/data";
import { BackLink } from "@/components/BackLink";
import { ImageWithFallback } from "@/components/ImageWithFallback";

export default function LootPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [rarityFilter, setRarityFilter] = useState<string | null>(null);

  const lootItems = useMemo(() => leagueData.lootItems ?? [], []);

  const types = useMemo(
    () =>
      [...new Set(lootItems.map((i) => i.type).filter(Boolean) as string[])].sort(),
    [lootItems]
  );

  const rarities = useMemo(
    () =>
      [...new Set(lootItems.map((i) => i.rarity).filter(Boolean) as string[])].sort(),
    [lootItems]
  );

  const filtered = useMemo(
    () =>
      lootItems
        .filter((item) => {
          const matchSearch =
            search === "" ||
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase());
          const matchType = typeFilter === null || item.type === typeFilter;
          const matchRarity = rarityFilter === null || item.rarity === rarityFilter;
          return matchSearch && matchType && matchRarity;
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [search, typeFilter, rarityFilter, lootItems]
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/league" label="Back to League" />
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Loot ({filtered.length})
        </h1>
        <p className="mt-1 text-gray-600">
          Hextech chests, capsules, shards, tokens, and more.
        </p>
        <input
          type="text"
          placeholder="Search loot by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter(null)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              typeFilter === null
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-emerald-50"
            }`}
          >
            All types
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(typeFilter === t ? null : t)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                typeFilter === t
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-emerald-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {rarities.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => setRarityFilter(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                rarityFilter === null
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-indigo-50"
              }`}
            >
              All rarities
            </button>
            {rarities.map((r) => (
              <button
                key={r}
                onClick={() => setRarityFilter(rarityFilter === r ? null : r)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  rarityFilter === r
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-indigo-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
          >
            {item.image && (
              <ImageWithFallback
                src={item.image}
                alt={item.name}
                className="h-14 w-14 rounded-xl border border-gray-100 object-contain"
              />
            )}
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {item.type && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                    {item.type}
                  </span>
                )}
                {item.rarity && (
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
                    {item.rarity}
                  </span>
                )}
              </div>
            </div>
            {item.description && (
              <p className="text-xs text-gray-600">{item.description}</p>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
