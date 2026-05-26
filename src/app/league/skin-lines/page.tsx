"use client";

import { useState, useMemo } from "react";
import { leagueData } from "@/lib/league/data";
import { BackLink } from "@/components/BackLink";
import { ImageWithFallback } from "@/components/ImageWithFallback";

export default function SkinLinesPage() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const skinLines = useMemo(() => leagueData.skinLines ?? [], []);

  const skinsBySkinLine = useMemo(() => {
    const map = new Map<number, typeof leagueData.skins>();
    for (const skin of leagueData.skins) {
      if (!skin.skinLineIds) continue;
      for (const lineId of skin.skinLineIds) {
        if (!map.has(lineId)) map.set(lineId, []);
        map.get(lineId)!.push(skin);
      }
    }
    return map;
  }, []);

  const filtered = useMemo(
    () =>
      skinLines
        .filter((line) => skinsBySkinLine.has(line.id))
        .filter(
          (line) =>
            search === "" ||
            line.name.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
          const aCount = skinsBySkinLine.get(a.id)?.length ?? 0;
          const bCount = skinsBySkinLine.get(b.id)?.length ?? 0;
          return bCount - aCount || a.name.localeCompare(b.name);
        }),
    [search, skinLines, skinsBySkinLine]
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/league" label="Back to League" />
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Skin Lines ({filtered.length})
        </h1>
        <p className="mt-1 text-gray-600">
          Thematic collections of champion skins, sorted by size.
        </p>
        <input
          type="text"
          placeholder="Search skin lines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </header>

      <section className="flex flex-col gap-4">
        {filtered.map((line) => {
          const skins = skinsBySkinLine.get(line.id) ?? [];
          const isOpen = expanded === line.id;

          return (
            <article
              key={line.id}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <button
                onClick={() => setExpanded(isOpen ? null : line.id)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-gray-50"
              >
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {line.name}
                  </h3>
                  <p className="text-xs text-gray-500">{skins.length} skins</p>
                </div>
                <span className="text-sm text-gray-400">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 p-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {skins.map((skin) => (
                      <div
                        key={skin.skinId}
                        className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-gray-50 p-3"
                      >
                        {skin.splash && (
                          <ImageWithFallback
                            src={`/leaguecontent/${skin.splash}`}
                            alt={skin.name}
                            className="h-28 w-full rounded-lg object-cover"
                          />
                        )}
                        <p className="text-xs font-semibold text-gray-900">
                          {skin.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {skin.championName}
                          {skin.rarity ? ` · ${skin.rarity}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
