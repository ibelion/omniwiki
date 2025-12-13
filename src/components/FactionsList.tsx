"use client";

import { useState } from "react";
import type { FactionRecord } from "@/lib/league/types";

export function FactionsList({ factions }: { factions: FactionRecord[] }) {
  const [search, setSearch] = useState("");
  
  const filtered = factions
    .filter((faction) =>
      search === "" ||
      faction.name.toLowerCase().includes(search.toLowerCase()) ||
      (faction.description && faction.description.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Factions ({filtered.length})
        </h1>
        <p className="text-gray-600">
          Reference descriptions for Runeterra&apos;s factions/regions sourced
          from `factions.csv`.
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search factions by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </header>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          {filtered.map((faction) => (
            <article
              key={faction.slug}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4"
            >
              <p className="text-xs uppercase text-gray-500">{faction.slug}</p>
              <h2 className="text-xl font-semibold text-gray-900">
                {faction.name}
              </h2>
              <p className="text-sm text-gray-700">
                {faction.description || "No description."}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
