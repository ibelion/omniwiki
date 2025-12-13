"use client";

import { useState } from "react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { MapRecord } from "@/lib/league/types";

export function MapsList({ maps }: { maps: MapRecord[] }) {
  const [search, setSearch] = useState("");
  
  const filtered = maps
    .filter((map) =>
      search === "" ||
      map.name.toLowerCase().includes(search.toLowerCase()) ||
      map.id.toString().includes(search)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Maps ({filtered.length})
        </h1>
        <p className="text-gray-600">
          Available map/queue surfaces with raw icons from the dataset.
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search maps by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </header>
      <section className="grid gap-4 sm:grid-cols-2">
        {filtered.map((map) => (
          <article
            key={map.id}
            className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <ImageWithFallback
                src={
                  map.image ? `/leaguecontent/${map.image}` : "/globe.svg"
                }
                alt={map.name}
                className="h-16 w-16 rounded-xl border border-gray-100 object-cover"
              />
              <div>
                <p className="text-xs uppercase text-gray-500">ID {map.id}</p>
                <p className="text-xl font-semibold text-gray-900">
                  {map.name}
                </p>
              </div>
            </div>
            {map.sourceUrl && (
              <p className="text-xs text-gray-500 break-all">
                {map.sourceUrl}
              </p>
            )}
          </article>
        ))}
      </section>
    </>
  );
}
