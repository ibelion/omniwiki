"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { ChampionSkin } from "@/lib/league/types";

type SkinsListProps = {
  skins: ChampionSkin[];
  champions: { id: number; slug: string }[];
};

export function SkinsList({ skins, champions }: SkinsListProps) {
  const [search, setSearch] = useState("");
  
  const filtered = skins
    .filter((skin) =>
      search === "" ||
      skin.name.toLowerCase().includes(search.toLowerCase()) ||
      skin.championName.toLowerCase().includes(search.toLowerCase()) ||
      (skin.rarity && skin.rarity.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      const byChampion = a.championName.localeCompare(b.championName);
      if (byChampion !== 0) return byChampion;
      return a.name.localeCompare(b.name);
    });

  return (
    <>
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Skins ({filtered.length})
        </h1>
        <p className="text-gray-600">
          Champion skins with rarities, costs, and availability.
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search skins by name, champion, or rarity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </header>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((skin) => {
            const champion = champions.find(c => c.id === skin.championId);
            const championSlug = champion?.slug || '';
            return (
            <Link
              key={`${skin.championId}-${skin.skinId}`}
              href={`/league/${championSlug}`}
              className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
            >
              <p className="text-xs uppercase text-gray-500">
                {skin.championName}
              </p>
              <h2 className="text-lg font-semibold text-gray-900">
                {skin.name}
              </h2>
              {skin.rarity && (
                <p className="text-xs font-semibold text-emerald-600">
                  {skin.rarity}
                </p>
              )}
              <div className="flex gap-2 text-xs text-gray-500">
                {skin.cost && <span>Cost: {skin.cost} RP</span>}
                {skin.availability && <span>• {skin.availability}</span>}
              </div>
              {skin.releaseDate && (
                <p className="text-xs text-gray-500">
                  Released: {skin.releaseDate}
                </p>
              )}
              {(skin.splash || skin.tile || skin.loadScreen) && (
                <ImageWithFallback
                  src={`/leaguecontent/${skin.splash || skin.tile || skin.loadScreen}`}
                  alt={skin.name}
                  className="mt-2 h-36 w-full rounded-lg object-cover"
                />
              )}
            </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
