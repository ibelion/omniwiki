"use client";

import { useMemo, useState } from "react";
import { BackLink } from "@/components/BackLink";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { leagueData } from "@/lib/league/data";

export default function SkinLinesPage() {
  const [search, setSearch] = useState("");

  const skinById = useMemo(
    () => new Map(leagueData.skins.map((skin) => [skin.skinId, skin])),
    []
  );

  const filteredSkinLines = useMemo(
    () =>
      (leagueData.skinLines ?? [])
        .filter((skinLine) => (skinLine.skinCount ?? skinLine.skinIds?.length ?? 0) > 0)
        .filter(
          (skinLine) =>
            search === "" ||
            skinLine.name.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
          const aCount = a.skinCount ?? a.skinIds?.length ?? 0;
          const bCount = b.skinCount ?? b.skinIds?.length ?? 0;
          return bCount - aCount || a.name.localeCompare(b.name);
        }),
    [search]
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/league" label="Back to League" />

      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Skin Lines ({filteredSkinLines.length})
        </h1>
        <p className="mt-1 text-gray-600">
          Thematic collections with a featured splash and total skin count.
        </p>
        <input
          type="text"
          placeholder="Search skin lines..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredSkinLines.map((skinLine) => {
          const firstSkinId = skinLine.skinIds?.[0];
          const firstSkin = firstSkinId ? skinById.get(firstSkinId) : undefined;
          const skinCount = skinLine.skinCount ?? skinLine.skinIds?.length ?? 0;

          return (
            <article
              key={skinLine.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {firstSkin?.splash ? (
                <ImageWithFallback
                  src={`/leaguecontent/${firstSkin.splash}`}
                  alt={skinLine.name}
                  className="h-48 w-full bg-gray-100"
                />
              ) : (
                <div className="h-48 w-full bg-gradient-to-br from-gray-100 via-white to-gray-200" />
              )}

              <div className="flex items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900">{skinLine.name}</h2>
                  {firstSkin && (
                    <p className="mt-1 text-sm text-gray-500">
                      Featured skin: {firstSkin.name}
                    </p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {skinCount} skins
                </span>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
