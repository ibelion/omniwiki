"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { ChampionRecord } from "@/lib/league/types";

type ChampionWithPositions = ChampionRecord & {
  positions?: string[];
  skinLines?: string[];
};

type FilterCategory = "role" | "region" | "species" | "skinLine";

const ROLES = ["Assassin", "Fighter", "Mage", "Marksman", "Support", "Tank"];

const CATEGORY_LABELS: Record<FilterCategory, string> = {
  role: "Role",
  region: "Region",
  species: "Species",
  skinLine: "Skin Line",
};

const PAGE_SIZE = 48;

export function ChampionsList({ champions }: { champions: ChampionWithPositions[] }) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("role");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "release">("name");
  const [page, setPage] = useState(0);

  // Derive unique values for each category, sorted by champion count descending
  const regionOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of champions) {
      for (const r of c.regions) counts.set(r, (counts.get(r) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([r]) => r);
  }, [champions]);

  const speciesOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of champions) {
      for (const s of c.species) counts.set(s, (counts.get(s) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([s]) => s);
  }, [champions]);

  // Cap skin line chips at 30 (by champion count) to keep the UI manageable
  const skinLineOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of champions) {
      for (const sl of c.skinLines ?? []) counts.set(sl, (counts.get(sl) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([sl]) => sl);
  }, [champions]);

  const chipOptions: string[] =
    filterCategory === "role"
      ? ROLES
      : filterCategory === "region"
      ? regionOptions
      : filterCategory === "species"
      ? speciesOptions
      : skinLineOptions;

  const filtered = useMemo(() => {
    return champions
      .filter((c) => {
        if (activeFilter) {
          if (filterCategory === "role" && !c.roles.includes(activeFilter)) return false;
          if (filterCategory === "region" && !c.regions.includes(activeFilter)) return false;
          if (filterCategory === "species" && !c.species.includes(activeFilter)) return false;
          if (
            filterCategory === "skinLine" &&
            !(c.skinLines ?? []).includes(activeFilter)
          )
            return false;
        }
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.regions.some((r) => r.toLowerCase().includes(q)) ||
          (c.positions ?? []).some((p) => p.toLowerCase().includes(q))
        );
      })
      .sort((a, b) =>
        sortBy === "release" ? a.id - b.id : a.name.localeCompare(b.name)
      );
  }, [champions, search, activeFilter, filterCategory, sortBy]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleCategory(cat: FilterCategory) {
    setFilterCategory(cat);
    setActiveFilter(null);
    setPage(0);
  }

  function handleChip(value: string) {
    setActiveFilter((prev) => (prev === value ? null : value));
    setPage(0);
  }

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
            onChange={(e) => {
              setSearch(e.target.value);
              setActiveFilter(null);
              setPage(0);
            }}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />

          {/* Sort + filter category tabs */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
              {(["name", "release"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { setSortBy(s); setPage(0); }}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                    sortBy === s
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {s === "name" ? "A–Z" : "Release order"}
                </button>
              ))}
            </div>
          </div>

          {/* Filter category tabs */}
          <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
            {(["role", "region", "species", "skinLine"] as FilterCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  filterCategory === cat
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Filter chips for the active category */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setActiveFilter(null); setPage(0); }}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                activeFilter === null
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {chipOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleChip(option)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  activeFilter === option
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((champion) => (
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
                {champion.species.length > 0 && (
                  <p className="text-xs text-gray-400">{champion.species[0]}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {champion.positions?.[0] && (
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

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm transition hover:bg-gray-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page + 1} of {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page === pageCount - 1}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm transition hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
