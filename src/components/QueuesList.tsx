"use client";

import { useState, useMemo } from "react";
import type { QueueRecord } from "@/lib/league/types";

export function QueuesList({ queues }: { queues: QueueRecord[] }) {
  const [search, setSearch] = useState("");
  const [showDeprecated, setShowDeprecated] = useState(false);

  // Derive unique map names for filter chips
  const maps = useMemo(
    () => [...new Set(queues.filter((q) => !q.isDeprecated).map((q) => q.map))].sort(),
    [queues]
  );
  const [mapFilter, setMapFilter] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      queues
        .filter((q) => {
          if (!showDeprecated && q.isDeprecated) return false;
          if (mapFilter && q.map !== mapFilter) return false;
          if (!search) return true;
          const s = search.toLowerCase();
          return (
            q.map.toLowerCase().includes(s) ||
            (q.description && q.description.toLowerCase().includes(s)) ||
            q.id.toString().includes(s)
          );
        })
        .sort((a, b) => a.id - b.id),
    [queues, search, showDeprecated, mapFilter]
  );

  const activeCount = queues.filter((q) => !q.isDeprecated).length;
  const deprecatedCount = queues.filter((q) => q.isDeprecated).length;

  return (
    <>
      <header className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#4caf72]">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-[#F2E8D5]">
          Queue Types ({filtered.length})
        </h1>
        <p className="text-[#6b6055]">
          Every matchmaking queue League has ever offered — ranked, normal, event, and more.
        </p>

        <input
          type="text"
          placeholder="Search by map, name, or queue ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-[#2c2c32] px-4 py-2 text-sm focus:border-[#1A5228] focus:outline-none focus:ring-2 focus:ring-[#0e1c14]"
        />

        {/* Map filter chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setMapFilter(null)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              mapFilter === null
                ? "bg-[#1A5228] text-white"
                : "bg-[#1c1c22] text-[#6b6055] hover:bg-[#252528]"
            }`}
          >
            All maps
          </button>
          {maps.map((m) => (
            <button
              key={m}
              onClick={() => setMapFilter(mapFilter === m ? null : m)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                mapFilter === m
                  ? "bg-[#1A5228] text-white"
                  : "bg-[#1c1c22] text-[#6b6055] hover:bg-[#252528]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Deprecated toggle */}
        <div className="mt-3 flex items-center gap-2 text-sm text-[#6b6055]">
          <button
            onClick={() => setShowDeprecated((v) => !v)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              showDeprecated
                ? "bg-amber-500 text-white"
                : "bg-[#1c1c22] text-[#6b6055] hover:bg-[#252528]"
            }`}
          >
            {showDeprecated ? "Hiding retired" : "Show retired"} ({deprecatedCount})
          </button>
          <span>{activeCount} active queues</span>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((queue) => (
          <article
            key={queue.id}
            className={`flex flex-col gap-1 rounded-xl border px-4 py-3 text-sm ${
              queue.isDeprecated
                ? "border-[#1c1c22] bg-[#0c0c0e] opacity-60"
                : "border-[#1c1c22] bg-[#141418] shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-[#4caf72]">
                {queue.map}
              </p>
              <span className="shrink-0 text-xs text-[#6b6055]">#{queue.id}</span>
            </div>
            <p className="font-semibold text-[#F2E8D5]">
              {queue.description || "Unnamed queue"}
            </p>
            {queue.notes && (
              <p className="text-xs text-[#6b6055]">{queue.notes}</p>
            )}
            {queue.isDeprecated && (
              <span className="mt-0.5 w-fit rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                Retired
              </span>
            )}
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-sm text-[#6b6055]">No queues match your search.</p>
        )}
      </section>
    </>
  );
}
