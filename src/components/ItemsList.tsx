"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { ItemRecord } from "@/lib/league/types";

const tierBadge = (tags: string[]) => {
  if (tags.some((tag) => tag.toLowerCase().includes("mythic"))) {
    return { label: "Mythic", color: "bg-orange-50 text-orange-700" };
  }
  if (tags.some((tag) => tag.toLowerCase().includes("legendary"))) {
    return { label: "Legendary", color: "bg-purple-50 text-purple-700" };
  }
  if (tags.some((tag) => tag.toLowerCase().includes("boots"))) {
    return { label: "Boots", color: "bg-blue-50 text-blue-700" };
  }
  return { label: "Standard", color: "bg-gray-100 text-gray-600" };
};

export function ItemsList({ items }: { items: ItemRecord[] }) {
  const [search, setSearch] = useState("");
  
  const filtered = items
    .filter((item) =>
      search === "" ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.plaintext && item.plaintext.toLowerCase().includes(search.toLowerCase())) ||
      item.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => a.name.localeCompare(b.name));

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
          Mythics, Legendaries, Boots, and component gear synced from the live
          `leaguecontent` dataset. Click an item for more context or to jump
          back to champions.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/league"
            className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            Back to champions
          </Link>
        </div>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search items by name, description, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => {
          const tier = tierBadge(item.tags);
          return (
            <article
              key={item.id}
              className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <ImageWithFallback
                  src={
                    item.image ? `/leaguecontent/${item.image}` : "/globe.svg"
                  }
                  alt={item.name}
                  className="h-12 w-12 rounded-lg border border-gray-100 object-contain"
                />
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${tier.color}`}
                >
                  {tier.label}
                </span>
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                {item.name}
              </h3>
              {item.plaintext && (
                <p className="text-xs text-gray-600">{item.plaintext}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {item.goldTotal !== null && item.goldTotal > 0 && (
                  <span className="font-medium text-yellow-600">
                    {item.goldTotal}g
                  </span>
                )}
                {item.tags.slice(0, 2).map((tag, idx) => (
                  <span key={idx}>#{tag}</span>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
