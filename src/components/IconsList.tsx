"use client";

import { useState } from "react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { SummonerIconRecord } from "@/lib/league/types";

export function IconsList({ icons }: { icons: SummonerIconRecord[] }) {
  const [search, setSearch] = useState("");
  
  const filtered = icons
    .filter((icon) =>
      search === "" ||
      icon.title.toLowerCase().includes(search.toLowerCase()) ||
      icon.id.toString().includes(search)
    )
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <>
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Summoner Icons ({filtered.length})
        </h1>
        <p className="text-gray-600">
          Profile icons with year/legacy state mirrored from
          `summoner_icons.csv`.
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search icons by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((icon) => (
          <article
            key={icon.id}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <ImageWithFallback
              src={
                icon.image ? `/leaguecontent/${icon.image}` : "/globe.svg"
              }
              alt={icon.title}
              className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
            />
            <div className="text-sm">
              <p className="text-xs uppercase text-gray-500">
                #{icon.id} · {icon.year ?? "Year?"}
              </p>
              <p className="font-semibold text-gray-900">{icon.title}</p>
              <p className="text-xs text-gray-500">
                Legacy: {icon.isLegacy ? "Yes" : "No"}
              </p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
