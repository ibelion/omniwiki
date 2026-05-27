"use client";

import { useState, useMemo } from "react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { SummonerIconRecord } from "@/lib/league/types";

const PAGE_SIZE = 100;

export function IconsList({ icons }: { icons: SummonerIconRecord[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () =>
      icons
        .filter(
          (icon) =>
            search === "" ||
            icon.title.toLowerCase().includes(search.toLowerCase()) ||
            icon.id.toString().includes(search)
        )
        .sort((a, b) => a.title.localeCompare(b.title)),
    [icons, search]
  );

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(0);
  }

  return (
    <>
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Summoner Icons ({filtered.length.toLocaleString()})
        </h1>
        <p className="text-gray-600">
          Profile icons and avatars.
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search icons by name or ID..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((icon) => (
            <article
              key={icon.id}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
            >
              <ImageWithFallback
                src={icon.image ? `/leaguecontent/${icon.image}` : "/globe.svg"}
                alt={icon.title}
                className="h-14 w-14 flex-shrink-0 rounded-lg border border-gray-200 object-cover"
              />
              <div className="min-w-0 text-sm">
                <p className="text-xs text-gray-400">#{icon.id}</p>
                <p className="truncate font-semibold text-gray-900">{icon.title}</p>
                {icon.isLegacy && (
                  <span className="text-xs text-amber-600">Legacy</span>
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
      </section>
    </>
  );
}
