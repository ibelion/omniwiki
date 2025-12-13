"use client";

import { useState } from "react";
import type { ObjectiveRecord } from "@/lib/league/types";

const formatDate = (value: number | null) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  return isNaN(date.getTime()) ? value.toString() : date.toISOString();
};

export function ObjectivesList({ objectives }: { objectives: ObjectiveRecord[] }) {
  const [search, setSearch] = useState("");
  
  const filtered = objectives
    .filter((objective) =>
      search === "" ||
      objective.title.toLowerCase().includes(search.toLowerCase()) ||
      (objective.category && objective.category.toLowerCase().includes(search.toLowerCase())) ||
      (objective.objectiveType && objective.objectiveType.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      const byTitle = a.title.localeCompare(b.title);
      if (byTitle !== 0) return byTitle;
      return (a.objectiveType || "").localeCompare(b.objectiveType || "");
    });

  return (
    <>
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Objectives & Missions ({filtered.length})
        </h1>
        <p className="text-gray-600">
          Raw mission/objective payload from `objectives.csv` for OmniGames
          ingestion.
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search objectives by title, category, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </header>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          {filtered.map((objective) => (
            <article
              key={objective.objectiveId}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm"
            >
              <p className="text-xs uppercase text-gray-500">
                {objective.category || "Uncategorized"}
              </p>
              <h2 className="text-lg font-semibold text-gray-900">
                {objective.title}
              </h2>
              <p className="text-xs text-gray-500">
                {objective.objectiveType || "unknown"} · Tag:{" "}
                {objective.tag || "N/A"}
              </p>
              <p className="text-xs text-gray-500">
                Start: {formatDate(objective.start)} · End:{" "}
                {formatDate(objective.end)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
