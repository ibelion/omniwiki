"use client";

import { useState, useMemo } from "react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { EmoteRecord } from "@/lib/league/types";

const PAGE_SIZE = 80;

export function EmotesList({ emotes }: { emotes: EmoteRecord[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () =>
      emotes
        .filter(
          (e) =>
            search === "" ||
            (e.name && e.name.toLowerCase().includes(search.toLowerCase())) ||
            (e.description && e.description.toLowerCase().includes(search.toLowerCase()))
        )
        .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")),
    [emotes, search]
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
          Emotes ({filtered.length.toLocaleString()})
        </h1>
        <p className="text-gray-600">
          Every summoner emote with icon and description.
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search emotes by name or description..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((emote) => {
            const imgSrc = emote.image
              ? `/leaguecontent/${emote.image}`
              : emote.sourceUrl || null;
            return (
              <article
                key={emote.id}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm"
              >
                {imgSrc ? (
                  <ImageWithFallback
                    src={imgSrc}
                    alt={emote.name || `Emote ${emote.id}`}
                    className="h-12 w-12 flex-shrink-0 rounded-lg border border-gray-200 object-contain"
                  />
                ) : (
                  <div className="h-12 w-12 flex-shrink-0 rounded-lg border border-gray-100 bg-gray-200" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {emote.name || "Unnamed"}
                  </p>
                  {emote.description && (
                    <p className="truncate text-xs text-gray-500">
                      {emote.description}
                    </p>
                  )}
                </div>
              </article>
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
      </section>
    </>
  );
}
