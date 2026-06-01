"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { ChampionRecord } from "@/lib/league/types";

type ChampionWithPositions = ChampionRecord & { positions?: string[] };

const ROLES = ["Assassin", "Fighter", "Mage", "Marksman", "Support", "Tank"];

export function ChampionsList({ champions }: { champions: ChampionWithPositions[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      champions
        .filter((c) => {
          if (roleFilter && !c.roles.includes(roleFilter)) return false;
          if (!search) return true;
          const q = search.toLowerCase();
          return (
            c.name.toLowerCase().includes(q) ||
            c.regions.some((r) => r.toLowerCase().includes(q)) ||
            (c.positions ?? []).some((p) => p.toLowerCase().includes(q))
          );
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [champions, search, roleFilter]
  );

  return (
    <>
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                League of Legends Universe
              </p>
              <h1 className="text-3xl font-semibold text-gray-900">
                Champions ({filtered.length})
              </h1>
              <p className="text-gray-600">
                Browse all champions with roles, regions, patches, and abilities.
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

          <input
            type="text"
            placeholder="Search by name, region, or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRoleFilter(null)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                roleFilter === null
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(roleFilter === role ? null : role)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  roleFilter === role
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {role}
              </button>
            ))}
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
                src={champion.image ? `/leaguecontent/${champion.image}` : "/globe.svg"}
                alt={`${champion.name} icon`}
                className="h-16 w-16 rounded-xl border border-gray-100 object-cover"
              />
              <div className="flex-1">
                <p className="text-xs text-gray-500">#{champion.id}</p>
                <h2 className="text-lg font-semibold text-gray-900">{champion.name}</h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(champion.positions?.[0]) && (
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                  {champion.positions[0]}
                </span>
              )}
              {champion.roles.slice(0, 3).map((role, i) => (
                <span
                  key={i}
                  className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700"
                >
                  {role}
                </span>
              ))}
            </div>

            {champion.regions.length > 0 && (
              <p className="text-xs text-gray-500">{champion.regions.slice(0, 2).join(", ")}</p>
            )}
          </Link>
        ))}
      </section>
    </>
  );
}
