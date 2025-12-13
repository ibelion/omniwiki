"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { ChampionRecord } from "@/lib/league/types";

type ChampionWithPositions = ChampionRecord & { positions?: string[] };

export function ChampionsList({ champions }: { champions: ChampionWithPositions[] }) {
  const [search, setSearch] = useState("");
  
  const filtered = champions
    .filter((champion) =>
      search === "" ||
      champion.name.toLowerCase().includes(search.toLowerCase()) ||
      champion.regions.some((region) => region.toLowerCase().includes(search.toLowerCase())) ||
      (champion.positions && champion.positions.some((p) => p.toLowerCase().includes(search.toLowerCase())))
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                League of Legends Universe
              </p>
              <h1 className="text-3xl font-semibold text-gray-900">
                Champions ({filtered.length})
              </h1>
              <p className="text-gray-600">
                Browse all champions with roles, regions, patches, and abilities
                from your scraped data.
              </p>
            </div>
            <Link
              href="/league"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50"
              aria-label="Back to League home"
            >
              ← Home
            </Link>
          </div>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search champions by name, role, or region..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((champion) => (
          <Link
            key={champion.id}
            href={`/league/${champion.slug}`}
            className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <ImageWithFallback
                src={
                  champion.image
                    ? `/leaguecontent/${champion.image}`
                    : "/globe.svg"
                }
                alt={`${champion.name} icon`}
                className="h-16 w-16 rounded-xl border border-gray-100 object-cover"
              />
              <div className="flex-1">
                <p className="text-xs text-gray-500">#{champion.id}</p>
                <h2 className="text-lg font-semibold text-gray-900">
                  {champion.name}
                </h2>
              </div>
            </div>
            {/* Top row: main position + roles */}
            <div className="flex flex-wrap gap-2">
              {(() => {
                const positions = champion.positions || [];
                const main = positions[0];
                return (
                  <>
                    {main && (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                        {main}
                      </span>
                    )}
                  </>
                );
              })()}
              {champion.roles.slice(0, 3).map((role, idx) => (
                <span
                  key={`role-${idx}`}
                  className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700"
                >
                  {role}
                </span>
              ))}
            </div>
            {/* Bottom row: all positions */}
            <div className="mt-2 flex flex-wrap gap-2">
              {(() => {
                const positions = champion.positions || [];
                return positions.map((pos, idx) => (
                  <span
                    key={`pos-list-${idx}`}
                    className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                  >
                    {pos}
                  </span>
                ));
              })()}
            </div>
            {champion.regions.length > 0 && (
              <p className="text-xs text-gray-500">
                {champion.regions.slice(0, 2).join(", ")}
              </p>
            )}
          </Link>
        ))}
      </section>
    </>
  );
}
