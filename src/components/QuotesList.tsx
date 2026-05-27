"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { QuoteRecord } from "@/lib/league/types";

type QuotesListProps = {
  quotes: QuoteRecord[];
  champions: { name: string; slug: string }[];
};

const PAGE_SIZE = 60;

export function QuotesList({ quotes, champions }: QuotesListProps) {
  const [search, setSearch] = useState("");
  const [championFilter, setChampionFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const categories = useMemo(
    () => [...new Set(quotes.map((q) => q.category).filter(Boolean) as string[])].sort(),
    [quotes]
  );

  const filtered = useMemo(() => {
    return quotes
      .filter((q) => {
        const matchChamp = championFilter === null || q.champion === championFilter;
        const matchCat = categoryFilter === null || q.category === categoryFilter;
        const matchSearch =
          search === "" ||
          q.champion.toLowerCase().includes(search.toLowerCase()) ||
          q.text.toLowerCase().includes(search.toLowerCase());
        return matchChamp && matchCat && matchSearch;
      })
      .sort((a, b) => {
        const byChampion = a.champion.localeCompare(b.champion);
        if (byChampion !== 0) return byChampion;
        return a.text.localeCompare(b.text);
      });
  }, [quotes, search, championFilter, categoryFilter]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleFilterChange(fn: () => void) {
    fn();
    setPage(0);
  }

  const uniqueChampions = useMemo(
    () => [...new Set(quotes.map((q) => q.champion))].sort(),
    [quotes]
  );

  return (
    <>
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Voicelines ({filtered.length.toLocaleString()})
        </h1>
        <p className="text-gray-600">
          Champion quotes from in-game interactions, sorted by champion.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Search by champion or quote text..."
            value={search}
            onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={championFilter ?? ""}
              onChange={(e) =>
                handleFilterChange(() =>
                  setChampionFilter(e.target.value || null)
                )
              }
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="">All champions</option>
              {uniqueChampions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={categoryFilter ?? ""}
              onChange={(e) =>
                handleFilterChange(() =>
                  setCategoryFilter(e.target.value || null)
                )
              }
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {visible.length === 0 ? (
          <p className="text-sm text-gray-500">No quotes match your filters.</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {visible.map((quote, idx) => {
                const champion = champions.find(
                  (c) => c.name.toLowerCase() === quote.champion.toLowerCase()
                );
                const championSlug = champion?.slug ?? "";
                return (
                  <Link
                    key={`${quote.champion}-${idx}`}
                    href={`/league/${championSlug}`}
                    className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
                  >
                    <p className="text-xs font-semibold uppercase text-emerald-600">
                      {quote.champion}
                    </p>
                    <blockquote className="text-base italic font-medium text-gray-900">
                      &quot;{quote.text}&quot;
                    </blockquote>
                    {(quote.category || quote.language) && (
                      <div className="flex gap-2 text-xs text-gray-400">
                        {quote.category && <span>{quote.category}</span>}
                        {quote.language && <span>· {quote.language}</span>}
                      </div>
                    )}
                  </Link>
                );
              })}
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
          </>
        )}
      </section>
    </>
  );
}
