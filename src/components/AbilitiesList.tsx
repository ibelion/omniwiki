"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { ChampionAbility } from "@/lib/league/types";

type AbilitiesListProps = {
  abilities: ChampionAbility[];
  champions: { id: number; slug: string }[];
};

export function AbilitiesList({ abilities, champions }: AbilitiesListProps) {
  const [search, setSearch] = useState("");
  const slotOrder: Record<string, number> = { Passive: 0, P: 0, Q: 1, W: 2, E: 3, R: 4 };

  const filtered = abilities
    .filter((ability) =>
      search === "" ||
      ability.name.toLowerCase().includes(search.toLowerCase()) ||
      ability.championName.toLowerCase().includes(search.toLowerCase()) ||
      ability.description.toLowerCase().includes(search.toLowerCase()) ||
      ability.slot.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const byChampion = a.championName.localeCompare(b.championName);
      if (byChampion !== 0) return byChampion;
      const slotA = slotOrder[a.slot] ?? 99;
      const slotB = slotOrder[b.slot] ?? 99;
      if (slotA !== slotB) return slotA - slotB;
      return a.name.localeCompare(b.name);
    });

  return (
    <>
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Champion Abilities ({filtered.length})
        </h1>
        <p className="text-gray-600">
          All champion abilities including passives, basic abilities, and ultimates.
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search abilities by name, champion, or slot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </header>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ability, index) => {
            const champion = champions.find(c => c.id === ability.championId);
            const championSlug = champion?.slug || '';
            return (
            <Link
              key={`${ability.championId}-${ability.slot}-${index}`}
              href={`/league/${championSlug}`}
              className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
            >
              <p className="text-xs uppercase text-gray-500">
                {ability.championName} · {ability.slot}
              </p>
              <div className="flex items-center gap-3">
                {ability.image && (
                  <ImageWithFallback
                    src={`/leaguecontent/${ability.image}`}
                    alt={ability.name}
                    className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
                  />
                )}
                <h2 className="text-lg font-semibold text-gray-900">
                  {ability.name}
                </h2>
              </div>
              <p className="text-xs text-gray-600 line-clamp-3">
                {ability.description}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                {ability.cooldown && ability.cooldown !== "0" && (
                  <span>CD: {ability.cooldown}</span>
                )}
                {ability.cost && ability.cost !== "0" && (
                  <span>• Cost: {ability.cost}</span>
                )}
                {ability.range && ability.range !== "0" && (
                  <span>• Range: {ability.range}</span>
                )}
              </div>
            </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
