"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BackLink } from "@/components/BackLink";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { SkinLineRecord } from "@/lib/league/types";

type SkinStub = { name: string; splash: string | null; tile: string | null };

type Props = {
  skinLines: SkinLineRecord[];
  skinById: Record<number, SkinStub>;
};

export function SkinLinesClient({ skinLines, skinById }: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"count" | "name">("count");

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
          if (sortBy === "name") return a.name.localeCompare(b.name);
          const aC = a.skinCount ?? a.skinIds?.length ?? 0;
          const bC = b.skinCount ?? b.skinIds?.length ?? 0;
          return bC - aC || a.name.localeCompare(b.name);
        }),
    [search, skinLines, sortBy]
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/league" label="Back to League" />

      <header className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#4caf72]">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-[#F2E8D5]">
          Skin Lines ({filtered.length})
        </h1>
        <p className="mt-1 text-[#6b6055]">
          Thematic collections — click any skin to view its full detail page.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Search skin lines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#2c2c32] px-4 py-2 text-sm focus:border-[#1A5228] focus:outline-none focus:ring-2 focus:ring-[#0e1c14]"
          />
          <div className="flex gap-1 rounded-lg border border-[#1c1c22] bg-[#0c0c0e] p-1 w-fit">
            {([["count", "Most skins"], ["name", "A–Z"]] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSortBy(val)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  sortBy === val
                    ? "bg-[#141418] text-[#F2E8D5] shadow-sm"
                    : "text-[#6b6055] hover:text-[#9a8c7e]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((skinLine) => {
          const skinIds = skinLine.skinIds ?? [];
          const skinCount = skinLine.skinCount ?? skinIds.length;
          const anchor = skinLine.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

          // Featured splash from first skin that has one
          const featuredSkin = skinIds
            .map((id) => skinById[id])
            .find((s) => s?.splash);

          // Up to 5 skins with tiles to show as thumbnails
          const thumbSkins = skinIds
            .map((id) => ({ id, ...skinById[id] }))
            .filter((s) => s.tile)
            .slice(0, 5);

          return (
            <article
              key={skinLine.id}
              id={anchor}
              className="overflow-hidden rounded-2xl border border-[#1c1c22] bg-[#141418] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {featuredSkin?.splash ? (
                <ImageWithFallback
                  src={`/leaguecontent/${featuredSkin.splash}`}
                  alt={skinLine.name}
                  className="h-40 w-full bg-[#1c1c22] object-cover"
                />
              ) : (
                <div className="h-40 w-full bg-gradient-to-br from-gray-100 via-white to-gray-200" />
              )}

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <Link
                    href={`/league/skin-lines/${skinLine.id}`}
                    className="text-lg font-semibold text-[#F2E8D5] hover:text-[#4caf72]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {skinLine.name}
                  </Link>
                  <span className="shrink-0 rounded-full bg-[#0e1c14] px-3 py-1 text-xs font-semibold text-[#4caf72]">
                    {skinCount} skins
                  </span>
                </div>

                {thumbSkins.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {thumbSkins.map((s) => (
                      <Link
                        key={s.id}
                        href={`/league/skins/${s.id}`}
                        title={s.name}
                        className="shrink-0 overflow-hidden rounded-lg border border-[#1c1c22] transition hover:border-[#2a4a30] hover:shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ImageWithFallback
                          src={`/leaguecontent/${s.tile}`}
                          alt={s.name ?? ""}
                          className="h-14 w-14 object-cover"
                        />
                      </Link>
                    ))}
                    {skinCount > thumbSkins.length && (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[#1c1c22] bg-[#0c0c0e] text-xs font-medium text-[#6b6055]">
                        +{skinCount - thumbSkins.length}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
