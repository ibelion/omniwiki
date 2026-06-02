"use client";

import { useState, useMemo } from "react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { EmoteRecord } from "@/lib/league/types";

type ChampionStub = { id: number; name: string };

type Props = {
  emotes: EmoteRecord[];
  champions: ChampionStub[];
};

const PAGE_SIZE = 80;

export function EmotesList({ emotes, champions }: Props) {
  const [search, setSearch] = useState("");
  const [championFilter, setChampionFilter] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  // Map champion id → name for quick lookup
  const championById = useMemo(
    () => new Map(champions.map((c) => [c.id, c.name])),
    [champions]
  );

  // Only champions that actually have emotes, sorted alphabetically
  const championsWithEmotes = useMemo(() => {
    const ids = new Set<number>();
    for (const emote of emotes) {
      for (const idStr of emote.championIds ?? []) {
        const id = Number(idStr);
        if (!isNaN(id)) ids.add(id);
      }
    }
    return champions
      .filter((c) => ids.has(c.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [emotes, champions]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return emotes
      .filter((e) => {
        if (championFilter !== null) {
          const ids = (e.championIds ?? []).map(Number);
          if (!ids.includes(championFilter)) return false;
        }
        if (!q) return true;
        return (
          (e.name && e.name.toLowerCase().includes(q)) ||
          (e.description && e.description.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [emotes, search, championFilter]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(0);
  }

  function handleChampion(id: number | null) {
    setChampionFilter(id);
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
          Every summoner emote — champion-specific and general.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search by name or description..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <select
            value={championFilter ?? ""}
            onChange={(e) => handleChampion(e.target.value ? Number(e.target.value) : null)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <option value="">All champions</option>
            <option value="">— General emotes —</option>
            {championsWithEmotes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((emote) => {
            const imgSrc = emote.image ? `/leaguecontent/${emote.image}` : null;
            const champNames = (emote.championIds ?? [])
              .map((id) => championById.get(Number(id)))
              .filter(Boolean) as string[];

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
                  {champNames.length > 0 && (
                    <p className="truncate text-xs text-emerald-600">
                      {champNames.join(", ")}
                    </p>
                  )}
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

        {filtered.length === 0 && (
          <p className="text-sm text-gray-500">No emotes match your search.</p>
        )}

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
