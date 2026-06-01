"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { FactionRecord, LoreRecord, ChampionRecord } from "@/lib/league/types";

type Props = {
  factions: FactionRecord[];
  lore: LoreRecord[];
  champions: ChampionRecord[];
};

export function FactionsList({ factions, lore, champions }: Props) {
  const [search, setSearch] = useState("");

  const championBySlug = useMemo(
    () => new Map(champions.map((c) => [c.slug, c])),
    [champions]
  );

  // Build faction slug → sorted champion list from lore
  const championsByFaction = useMemo(() => {
    const map = new Map<string, ChampionRecord[]>();
    for (const entry of lore) {
      if (!entry.faction || entry.faction === "unaffiliated") continue;
      const champ = championBySlug.get(entry.slug);
      if (!champ) continue;
      const list = map.get(entry.faction) ?? [];
      list.push(champ);
      map.set(entry.faction, list);
    }
    // sort each list alphabetically
    for (const [key, list] of map) {
      map.set(key, list.sort((a, b) => a.name.localeCompare(b.name)));
    }
    return map;
  }, [lore, championBySlug]);

  const filtered = useMemo(
    () =>
      factions
        .filter(
          (f) =>
            search === "" ||
            f.name.toLowerCase().includes(search.toLowerCase()) ||
            (f.description && f.description.toLowerCase().includes(search.toLowerCase()))
        )
        .sort((a, b) => {
          // sort by champion count descending, then name
          const aC = championsByFaction.get(a.slug)?.length ?? 0;
          const bC = championsByFaction.get(b.slug)?.length ?? 0;
          return bC - aC || a.name.localeCompare(b.name);
        }),
    [factions, search, championsByFaction]
  );

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
          Runeterra&apos;s regions and factions — click any champion icon to go to their page.
        </p>
        <input
          type="text"
          placeholder="Search factions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {filtered.map((faction) => {
          const factionChampions = championsByFaction.get(faction.slug) ?? [];
          const shown = factionChampions.slice(0, 10);
          const overflow = factionChampions.length - shown.length;

          return (
            <article
              key={faction.slug}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              {faction.image && (
                <ImageWithFallback
                  src={`/leaguecontent/${faction.image}`}
                  alt={`${faction.name} banner`}
                  className="h-28 w-full object-cover"
                />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      {faction.slug}
                    </p>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {faction.name}
                    </h2>
                  </div>
                  {factionChampions.length > 0 && (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {factionChampions.length} champions
                    </span>
                  )}
                </div>

                {faction.description && (
                  <p className="mt-2 text-sm text-gray-600">{faction.description}</p>
                )}

                {shown.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {shown.map((champ) => (
                      <Link
                        key={champ.slug}
                        href={`/league/${champ.slug}`}
                        title={champ.name}
                        className="group relative shrink-0"
                      >
                        <ImageWithFallback
                          src={`/leaguecontent/${champ.image}`}
                          alt={champ.name}
                          className="h-10 w-10 rounded-xl border border-gray-100 object-cover transition group-hover:border-emerald-300 group-hover:shadow-sm"
                        />
                        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100">
                          {champ.name}
                        </span>
                      </Link>
                    ))}
                    {overflow > 0 && (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
                        +{overflow}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
