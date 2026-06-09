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
      <section className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#4caf72]">
                League of Legends Universe
              </p>
              <h1 className="text-3xl font-semibold text-[#F2E8D5]">
                Champions ({filtered.length})
              </h1>
              <p className="text-[#6b6055]">
                Browse all champions with roles, regions, patches, and abilities.
              </p>
            </div>
            <Link
              href="/league"
              className="rounded-lg border border-[#1c1c22] px-4 py-2 text-sm font-semibold text-[#9a8c7e] transition hover:border-[#2a4a30] hover:bg-[#0e1c14]"
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
            className="mt-2 w-full rounded-lg border border-[#2c2c32] px-4 py-2 text-sm focus:border-[#1A5228] focus:outline-none focus:ring-2 focus:ring-[#0e1c14]"
          />

          {/* Sort + filter category tabs */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1 rounded-lg border border-[#1c1c22] bg-[#0c0c0e] p-1 w-fit">
              {(["name", "release"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { setSortBy(s); setPage(0); }}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                    sortBy === s
                      ? "bg-[#141418] text-[#F2E8D5] shadow-sm"
                      : "text-[#6b6055] hover:text-[#9a8c7e]"
                  }`}
                >
                  {s === "name" ? "A–Z" : "Release order"}
                </button>
              ))}
            </div>
          </div>

          {/* Filter category tabs */}
          <div className="flex gap-1 rounded-lg border border-[#1c1c22] bg-[#0c0c0e] p-1 w-fit">
            {(["role", "region", "species", "skinLine"] as FilterCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  filterCategory === cat
                    ? "bg-[#141418] text-[#F2E8D5] shadow-sm"
                    : "text-[#6b6055] hover:text-[#9a8c7e]"
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
                  ? "bg-[#1A5228] text-white"
                  : "bg-[#1c1c22] text-[#6b6055] hover:bg-[#252528]"
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
                    ? "bg-[#1A5228] text-white"
                    : "bg-[#1c1c22] text-[#6b6055] hover:bg-[#252528]"
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
            className="flex flex-col gap-3 rounded-2xl border border-[#1c1c22] bg-[#141418] p-4 shadow-sm transition hover:border-[#1c3622] hover:bg-[#0e1c14] hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <ImageWithFallback
                src={champion.image ? `/leaguecontent/${champion.image}` : "/globe.svg"}
                alt={`${champion.name} icon`}
                className="h-16 w-16 rounded-xl border border-[#1c1c22] object-cover"
              />
              <div className="flex-1">
                <p className="text-xs text-[#6b6055]">#{champion.id}</p>
                <h2 className="text-lg font-semibold text-[#F2E8D5]">{champion.name}</h2>
                {champion.species.length > 0 && (
                  <p className="text-xs text-[#6b6055]">{champion.species[0]}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {champion.positions?.[0] && (
                <span className="rounded-full bg-[#0e1c14] px-2 py-1 text-xs font-semibold text-[#4caf72]">
                  {champion.positions[0]}
                </span>
              )}
              {champion.roles.slice(0, 3).map((role, i) => (
                <span
                  key={i}
                  className="rounded-full bg-[#12122a] px-2 py-1 text-xs font-medium text-[#8892f0]"
                >
                  {role}
                </span>
              ))}
            </div>

            {champion.regions.length > 0 && (
              <p className="text-xs text-[#6b6055]">{champion.regions.slice(0, 2).join(", ")}</p>
            )}
          </Link>
        ))}
      </section>

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg border border-[#1c1c22] px-4 py-2 text-sm transition hover:bg-[#1c1c22] disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-[#6b6055]">
            Page {page + 1} of {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page === pageCount - 1}
            className="rounded-lg border border-[#1c1c22] px-4 py-2 text-sm transition hover:bg-[#1c1c22] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
