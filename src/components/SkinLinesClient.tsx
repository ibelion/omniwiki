"use client";

import { useMemo, useState } from "react";
import { BackLink } from "@/components/BackLink";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { SkinLineRecord } from "@/lib/league/types";

type SkinStub = { name: string; splash: string | null };

type Props = {
  skinLines: SkinLineRecord[];
  skinById: Record<number, SkinStub>;
};

export function SkinLinesClient({ skinLines, skinById }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      skinLines
        .filter((sl) => (sl.skinCount ?? sl.skinIds?.length ?? 0) > 0)
        .filter(
          (sl) =>
            search === "" ||
            sl.name.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
          const aC = a.skinCount ?? a.skinIds?.length ?? 0;
          const bC = b.skinCount ?? b.skinIds?.length ?? 0;
          return bC - aC || a.name.localeCompare(b.name);
        }),
    [search, skinLines]
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
          Thematic collections with a featured splash and total skin count.
        </p>
        <input
          type="text"
          placeholder="Search skin lines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((skinLine) => {
          const firstSkinId = skinLine.skinIds?.[0];
          const firstSkin = firstSkinId !== undefined ? skinById[firstSkinId] : undefined;
          const skinCount = skinLine.skinCount ?? skinLine.skinIds?.length ?? 0;
          const anchor = skinLine.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

          return (
            <article
              key={skinLine.id}
              id={anchor}
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
