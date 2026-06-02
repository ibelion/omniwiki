"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { ItemRecord } from "@/lib/league/types";

const TIER_TAGS = ["Mythic", "Legendary", "Boots", "Trinket", "Consumable", "Jungle"];
const STAT_TAGS = [
  "Damage", "SpellDamage", "Health", "Mana",
  "ArmorPenetration", "MagicPenetration", "AttackSpeed",
  "CriticalStrike", "AbilityHaste", "Armor", "MagicResist",
];
const FILTER_TAGS = [...TIER_TAGS, ...STAT_TAGS];

const tierBadge = (tags: string[]) => {
  if (tags.includes("Mythic")) return { label: "Mythic", color: "bg-orange-50 text-orange-700" };
  if (tags.includes("Legendary")) return { label: "Legendary", color: "bg-purple-50 text-purple-700" };
  if (tags.includes("Boots")) return { label: "Boots", color: "bg-blue-50 text-blue-700" };
  if (tags.includes("Trinket")) return { label: "Trinket", color: "bg-teal-50 text-teal-700" };
  if (tags.includes("Consumable")) return { label: "Consumable", color: "bg-green-50 text-green-700" };
  return { label: "Standard", color: "bg-gray-100 text-gray-600" };
};

const PAGE_SIZE = 60;

export function ItemsList({ items }: { items: ItemRecord[] }) {
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "cost-asc" | "cost-desc">("name");
  const [page, setPage] = useState(0);

  const itemById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  const filtered = useMemo(
    () =>
      items
        .filter((item) => {
          if (tagFilter && !item.tags.includes(tagFilter)) return false;
          if (!search) return true;
          const q = search.toLowerCase();
          return (
            item.name.toLowerCase().includes(q) ||
            (item.plaintext && item.plaintext.toLowerCase().includes(q)) ||
            item.tags.some((t) => t.toLowerCase().includes(q))
          );
        })
        .sort((a, b) => {
          if (sortBy === "cost-asc") return (a.goldTotal ?? 0) - (b.goldTotal ?? 0);
          if (sortBy === "cost-desc") return (b.goldTotal ?? 0) - (a.goldTotal ?? 0);
          return a.name.localeCompare(b.name);
        }),
    [items, search, tagFilter, sortBy]
  );

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleFilterChange(fn: () => void) {
    fn();
    setPage(0);
  }

  return (
    <>
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Item Catalog ({filtered.length})
        </h1>
        <p className="text-gray-600">
          Mythics, legendaries, boots, and component gear.
        </p>

        <input
          type="text"
          placeholder="Search items by name, description, or tag..."
          value={search}
          onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
            {([["name", "A–Z"], ["cost-asc", "Cost ↑"], ["cost-desc", "Cost ↓"]] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => handleFilterChange(() => setSortBy(val))}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  sortBy === val
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange(() => setTagFilter(null))}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              tagFilter === null
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {FILTER_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleFilterChange(() => setTagFilter(tagFilter === tag ? null : tag))}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                tagFilter === tag
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => {
          const tier = tierBadge(item.tags);
          return (
            <Link
              key={item.id}
              href={`/league/items/${item.id}`}
              className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <ImageWithFallback
                  src={item.image ? `/leaguecontent/${item.image}` : "/globe.svg"}
                  alt={item.name}
                  className="h-12 w-12 rounded-lg border border-gray-100 object-contain"
                />
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tier.color}`}>
                  {tier.label}
                </span>
              </div>
              <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
              {item.plaintext && (
                <p className="text-xs text-gray-600">{item.plaintext}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {item.goldTotal !== null && item.goldTotal > 0 && (
                  <span className="font-medium text-yellow-600">{item.goldTotal}g</span>
                )}
                {item.tags.slice(0, 2).map((tag, idx) => (
                  <span key={idx}>#{tag}</span>
                ))}
              </div>
              {item.from && item.from.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-700">Built from</span>
                  <div className="flex flex-wrap gap-1">
                    {item.from.map((id) => {
                      const comp = itemById.get(id);
                      return (
                        <div key={id} className="group relative">
                          <ImageWithFallback
                            src={comp?.image ? `/leaguecontent/${comp.image}` : "/globe.svg"}
                            alt={comp?.name ?? `#${id}`}
                            className="h-8 w-8 rounded border border-gray-100 object-contain"
                          />
                          <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100">
                            {comp?.name ?? `#${id}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {item.into && item.into.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-700">Builds into</span>
                  <div className="flex flex-wrap gap-1">
                    {item.into.map((id) => {
                      const upgrade = itemById.get(id);
                      return (
                        <div key={id} className="group relative">
                          <ImageWithFallback
                            src={upgrade?.image ? `/leaguecontent/${upgrade.image}` : "/globe.svg"}
                            alt={upgrade?.name ?? `#${id}`}
                            className="h-8 w-8 rounded border border-gray-100 object-contain"
                          />
                          <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100">
                            {upgrade?.name ?? `#${id}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </section>

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm transition hover:bg-gray-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page + 1} of {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page === pageCount - 1}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm transition hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
