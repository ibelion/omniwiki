"use client";

import { useMemo, useState } from "react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { WardSkinRecord } from "@/lib/league/types";

const PAGE_SIZE = 60;

export function WardsList({ wards }: { wards: WardSkinRecord[] }) {
  const [search, setSearch] = useState("");
  const [legacyOnly, setLegacyOnly] = useState(false);
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () =>
      wards
        .filter((w) => {
          if (legacyOnly && !w.isLegacy) return false;
          if (!search) return true;
          const q = search.toLowerCase();
          return (
            w.name.toLowerCase().includes(q) ||
            (w.description && w.description.toLowerCase().includes(q))
          );
        })
        .sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [wards, search, legacyOnly]
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

  return (
    <>
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Ward Skins ({filtered.length})
        </h1>
        <p className="text-gray-600">Ward cosmetics and trinket skins.</p>
        <input
          type="text"
          placeholder="Search ward skins..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => { setLegacyOnly(false); setPage(0); }}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              !legacyOnly
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={handleLegacyToggle}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              legacyOnly
                ? "bg-amber-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Legacy only
          </button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((ward) => (
          <article
            key={ward.id}
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <ImageWithFallback
              src={ward.image ? `/leaguecontent/${ward.image}` : "/globe.svg"}
              alt={ward.name}
              className="h-16 w-16 flex-shrink-0 rounded-xl border border-gray-100 object-contain"
            />
            <div className="min-w-0">
              <p className="text-xs text-gray-400">#{ward.id}</p>
              <p className="truncate font-semibold text-gray-900">{ward.name}</p>
              {ward.description && (
                <p className="truncate text-xs text-gray-500">{ward.description}</p>
              )}
              {ward.isLegacy && (
                <span className="mt-0.5 inline-block text-xs font-medium text-amber-600">
                  Legacy
                </span>
              )}
            </div>
          </article>
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
