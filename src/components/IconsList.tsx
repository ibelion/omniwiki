"use client";

import { useState, useMemo } from "react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { SummonerIconRecord } from "@/lib/league/types";

const PAGE_SIZE = 100;

export function IconsList({ icons }: { icons: SummonerIconRecord[] }) {
  const [search, setSearch] = useState("");
  const [legacyOnly, setLegacyOnly] = useState(false);
  const [yearFilter, setYearFilter] = useState<number | null | "unknown">(null);
  const [page, setPage] = useState(0);

  const legacyCount = useMemo(() => icons.filter((i) => i.isLegacy).length, [icons]);

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const icon of icons) {
      if (icon.year != null) set.add(icon.year);
    }
    return [...set].sort((a, b) => b - a);
  }, [icons]);

  const unknownYearCount = useMemo(() => icons.filter((i) => i.year == null).length, [icons]);

  const filtered = useMemo(
    () =>
      icons
        .filter((icon) => {
          if (legacyOnly && !icon.isLegacy) return false;
          if (yearFilter === "unknown" && icon.year != null) return false;
          if (typeof yearFilter === "number" && icon.year !== yearFilter) return false;
          if (!search) return true;
          return (
            icon.title.toLowerCase().includes(search.toLowerCase()) ||
            icon.id.toString().includes(search)
          );
        })
        .sort((a, b) => {
          if (a.year !== b.year) {
            if (a.year == null) return 1;
            if (b.year == null) return -1;
            return b.year - a.year;
          }
          return a.title.localeCompare(b.title);
        }),
    [icons, search, legacyOnly, yearFilter]
  );

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(0);
  }

  function handleLegacyToggle() {
    setLegacyOnly((v) => !v);
    setPage(0);
  }

  function handleYearChange(y: number | null | "unknown") {
    setYearFilter(y);
    setPage(0);
  }

  return (
    <>
      <header className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#4caf72]">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-[#F2E8D5]">
          Summoner Icons ({filtered.length.toLocaleString()})
        </h1>
        <p className="text-[#6b6055]">
          Profile icons — from default borders to event exclusives and legacy rewards.
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search by name or icon ID..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-[#2c2c32] px-4 py-2 text-sm focus:border-[#1A5228] focus:outline-none focus:ring-2 focus:ring-[#0e1c14]"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#6b6055]">
          <button
            onClick={() => { setLegacyOnly(false); setPage(0); }}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              !legacyOnly
                ? "bg-[#1A5228] text-white"
                : "bg-[#1c1c22] text-[#6b6055] hover:bg-[#252528]"
            }`}
          >
            All
          </button>
          <button
            onClick={handleLegacyToggle}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              legacyOnly
                ? "bg-amber-500 text-white"
                : "bg-[#1c1c22] text-[#6b6055] hover:bg-[#252528]"
            }`}
          >
            Legacy only ({legacyCount})
          </button>
        </div>

        {years.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => handleYearChange(null)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                yearFilter === null
                  ? "bg-[#1A5228] text-white"
                  : "bg-[#1c1c22] text-[#6b6055] hover:bg-[#252528]"
              }`}
            >
              All years
            </button>
            {years.map((y) => (
              <button
                key={y}
                onClick={() => handleYearChange(yearFilter === y ? null : y)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  yearFilter === y
                    ? "bg-[#1A5228] text-white"
                    : "bg-[#1c1c22] text-[#6b6055] hover:bg-[#252528]"
                }`}
              >
                {y}
              </button>
            ))}
            {unknownYearCount > 0 && (
              <button
                onClick={() => handleYearChange(yearFilter === "unknown" ? null : "unknown")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  yearFilter === "unknown"
                    ? "bg-[#1A5228] text-white"
                    : "bg-[#1c1c22] text-[#6b6055] hover:bg-[#252528]"
                }`}
              >
                Unknown year ({unknownYearCount})
              </button>
            )}
          </div>
        )}
      </header>

      <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((icon) => (
            <article
              key={icon.id}
              className="flex items-center gap-3 rounded-xl border border-[#1c1c22] bg-[#0c0c0e] p-3"
            >
              <ImageWithFallback
                src={icon.image ? `/leaguecontent/${icon.image}` : "/globe.svg"}
                alt={icon.title}
                className="h-14 w-14 flex-shrink-0 rounded-lg border border-[#1c1c22] object-cover"
              />
              <div className="min-w-0 text-sm">
                <p className="text-xs text-[#6b6055]">#{icon.id}</p>
                <p className="truncate font-semibold text-[#F2E8D5]">{icon.title}</p>
                {icon.isLegacy && (
                  <span className="mt-0.5 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                    Legacy
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

        {pageCount > 1 && (
          <div className="mt-6 flex items-center justify-between gap-4">
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
      </section>
    </>
  );
}
