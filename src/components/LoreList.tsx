"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { LoreRecord, ChampionRecord, FactionRecord } from "@/lib/league/types";

type Props = {
  lore: LoreRecord[];
  champions: ChampionRecord[];
  factions: FactionRecord[];
};

const PAGE_SIZE = 40;

export function LoreList({ lore, champions, factions }: Props) {
  const [search, setSearch] = useState("");
  const [faction, setFaction] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // champion slug → ChampionRecord for icon lookups
  const championBySlug = useMemo(
    () => new Map(champions.map((c) => [c.slug, c])),
    [champions]
  );

  // faction slug → display name
  const factionNameBySlug = useMemo(
    () => new Map(factions.map((f) => [f.slug, f.name])),
    [factions]
  );

  // only factions that have at least one lore entry, sorted by champion count desc
  const activeFactions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of lore) {
      if (!entry.faction || entry.faction === "unaffiliated") continue;
      counts.set(entry.faction, (counts.get(entry.faction) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([slug]) => ({ slug, name: factionNameBySlug.get(slug) ?? slug }));
  }, [lore, factionNameBySlug]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return lore.filter((entry) => {
      if (faction && entry.faction !== faction) return false;
      if (!q) return true;
      return (
        entry.champion.toLowerCase().includes(q) ||
        (entry.loreShort && entry.loreShort.toLowerCase().includes(q)) ||
        (entry.loreLong && entry.loreLong.toLowerCase().includes(q))
      );
    });
  }, [lore, search, faction]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(0);
  }

  function handleFaction(slug: string | null) {
    setFaction(slug);
    setPage(0);
  }

  function toggleExpanded(slug: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
  }

  return (
    <>
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Champion Lore ({filtered.length})
        </h1>
        <p className="text-gray-600">
          Runeterra&apos;s stories — filter by faction or search by name and lore text.
        </p>
        <input
          type="text"
          placeholder="Search by champion name or lore..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => handleFaction(null)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              faction === null
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {activeFactions.map((f) => (
            <button
              key={f.slug}
              onClick={() => handleFaction(faction === f.slug ? null : f.slug)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                faction === f.slug
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {visible.map((entry) => {
          const champ = championBySlug.get(entry.slug);
          const isOpen = expanded.has(entry.slug);
          const factionName = entry.faction && entry.faction !== "unaffiliated"
            ? factionNameBySlug.get(entry.faction) ?? entry.faction
            : null;

          return (
            <article
              key={entry.slug}
              className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                {champ && (
                  <Link href={`/league/${entry.slug}`} className="shrink-0">
                    <ImageWithFallback
                      src={`/leaguecontent/${champ.image}`}
                      alt={entry.champion}
                      className="h-12 w-12 rounded-xl border border-gray-100 object-cover transition hover:border-emerald-300"
                    />
                  </Link>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/league/${entry.slug}`}
                        className="font-semibold text-gray-900 hover:text-emerald-700"
                      >
                        {entry.champion}
                      </Link>
                      {entry.title && (
                        <p className="text-xs italic text-gray-500">{entry.title}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {factionName && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          {factionName}
                        </span>
                      )}
                      {entry.releaseDate && (
                        <span className="text-xs text-gray-400">{entry.releaseDate}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {(entry.loreShort || entry.loreLong) && (
                <div className="text-sm text-gray-600">
                  <p className={isOpen ? "" : "line-clamp-3"}>
                    {isOpen ? (entry.loreLong ?? entry.loreShort) : entry.loreShort}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    {entry.loreLong && entry.loreLong !== entry.loreShort && (
                      <button
                        onClick={() => toggleExpanded(entry.slug)}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-800"
                      >
                        {isOpen ? "Show less ↑" : "Expand ↓"}
                      </button>
                    )}
                    <Link
                      href={`/league/lore/${entry.slug}`}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-800"
                    >
                      Full lore page →
                    </Link>
                  </div>
                </div>
              )}
            </article>
          );
        })}
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
