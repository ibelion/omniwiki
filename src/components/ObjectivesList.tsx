"use client";

import { useState, useMemo } from "react";
import type { ObjectiveRecord } from "@/lib/league/types";

const formatDate = (ms: number | null): string => {
  if (!ms) return "Unknown";
  const d = new Date(ms);
  if (isNaN(d.getTime())) return "Unknown";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export function ObjectivesList({ objectives }: { objectives: ObjectiveRecord[] }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<number | null>(null);

  const categories = useMemo(
    () => [...new Set(objectives.map((o) => o.category).filter(Boolean) as string[])].sort(),
    [objectives]
  );

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const o of objectives) {
      if (o.start) set.add(new Date(o.start).getFullYear());
    }
    return [...set].sort((a, b) => b - a);
  }, [objectives]);

  const filtered = useMemo(
    () =>
      objectives
        .filter((o) => {
          if (categoryFilter && o.category !== categoryFilter) return false;
          if (yearFilter != null) {
            if (!o.start) return false;
            if (new Date(o.start).getFullYear() !== yearFilter) return false;
          }
          if (!search) return true;
          const s = search.toLowerCase();
          return (
            o.title.toLowerCase().includes(s) ||
            (o.category && o.category.toLowerCase().includes(s)) ||
            (o.objectiveType && o.objectiveType.toLowerCase().includes(s)) ||
            (o.tag && o.tag.toLowerCase().includes(s))
          );
        })
        .sort((a, b) => {
          if (a.start && b.start) return b.start - a.start;
          if (a.start) return -1;
          if (b.start) return 1;
          return a.title.localeCompare(b.title);
        }),
    [objectives, search, categoryFilter, yearFilter]
  );

  // eslint-disable-next-line react-hooks/purity
  const now = useMemo(() => Date.now(), []);
  const active = filtered.filter((o) => (!o.end || o.end > now) && (!o.start || o.start <= now));

  return (
    <>
      <header className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#4caf72]">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-[#F2E8D5]">
          Missions & Objectives ({filtered.length})
        </h1>
        <p className="text-[#6b6055]">
          Seasonal missions, event objectives, and challenge tasks across League&apos;s history.
          {active.length > 0 && (
            <span className="ml-2 font-medium text-[#4caf72]">{active.length} currently active.</span>
          )}
        </p>

        <input
          type="text"
          placeholder="Search by title, category, or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-[#2c2c32] px-4 py-2 text-sm focus:border-[#1A5228] focus:outline-none focus:ring-2 focus:ring-[#0e1c14]"
        />

        {/* Year chips */}
        {years.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setYearFilter(null)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                yearFilter === null
                  ? "bg-[#1A5228] text-white"
                  : "bg-[#1c1c22] text-[#6b6055] hover:bg-[#252528]"
              }`}
            >
              All seasons
            </button>
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setYearFilter(yearFilter === y ? null : y)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  yearFilter === y
                    ? "bg-[#1A5228] text-white"
                    : "bg-[#1c1c22] text-[#6b6055] hover:bg-[#252528]"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        )}

        {/* Category chips */}
        {categories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                categoryFilter === null
                  ? "bg-[#12122a] text-[#8892f0]"
                  : "bg-[#1c1c22] text-[#6b6055] hover:bg-[#252528]"
              }`}
            >
              All categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  categoryFilter === cat
                    ? "bg-[#12122a] text-[#8892f0]"
                    : "bg-[#1c1c22] text-[#6b6055] hover:bg-[#252528]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((obj) => {
          const isActive = (!obj.end || obj.end > now) && (!obj.start || obj.start <= now);
          const isUpcoming = obj.start && obj.start > now;
          return (
            <article
              key={obj.objectiveId}
              className="flex flex-col gap-2 rounded-xl border border-[#1c1c22] bg-[#141418] px-4 py-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-[#4caf72]">
                  {obj.category || "General"}
                </p>
                {isActive && (
                  <span className="shrink-0 rounded-full bg-[#0e1c14] px-2 py-0.5 text-xs font-semibold text-[#4caf72]">
                    Active
                  </span>
                )}
                {isUpcoming && (
                  <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    Upcoming
                  </span>
                )}
              </div>
              <h2 className="text-sm font-semibold leading-snug text-[#F2E8D5]">{obj.title}</h2>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#6b6055]">
                {obj.objectiveType && <span>{obj.objectiveType}</span>}
                {obj.tag && <span className="text-[#6b6055]">#{obj.tag}</span>}
              </div>
              <div className="text-xs text-[#6b6055]">
                {obj.start && <span>{formatDate(obj.start)}</span>}
                {obj.start && obj.end && <span> → </span>}
                {obj.end && <span>{formatDate(obj.end)}</span>}
              </div>
            </article>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full text-sm text-[#6b6055]">No objectives match your search.</p>
        )}
      </section>
    </>
  );
}
