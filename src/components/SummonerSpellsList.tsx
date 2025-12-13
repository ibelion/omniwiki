"use client";

import { useState } from "react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { SummonerSpellRecord } from "@/lib/league/types";

export function SummonerSpellsList({ spells }: { spells: SummonerSpellRecord[] }) {
  const [search, setSearch] = useState("");
  
  const filtered = spells
    .filter((spell) =>
      search === "" ||
      spell.name.toLowerCase().includes(search.toLowerCase()) ||
      spell.description.toLowerCase().includes(search.toLowerCase()) ||
      spell.id.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Summoner Spells ({filtered.length})
        </h1>
        <p className="text-gray-600">
          Every Summoner Spell available on the Rift pulled from CommunityDragon.
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search summoner spells by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((spell) => (
            <article
              key={spell.key}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src={
                    spell.image ? `/leaguecontent/${spell.image}` : "/globe.svg"
                  }
                  alt={`${spell.name} icon`}
                  className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
                />
                <div>
                  <p className="text-xs uppercase text-gray-500">
                    {spell.id}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {spell.name}
                  </h3>
                </div>
              </div>
              <p className="text-xs text-gray-600">{spell.description}</p>
              <p className="text-xs text-gray-500">
                Cooldown: {spell.cooldown}s · Level {spell.summonerLevel ?? "?"}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
