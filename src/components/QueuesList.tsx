"use client";

import { useState } from "react";
import type { QueueRecord } from "@/lib/league/types";

export function QueuesList({ queues }: { queues: QueueRecord[] }) {
  const [search, setSearch] = useState("");
  
  const filtered = queues
    .filter((queue) =>
      search === "" ||
      queue.map.toLowerCase().includes(search.toLowerCase()) ||
      (queue.description && queue.description.toLowerCase().includes(search.toLowerCase())) ||
      queue.id.toString().includes(search)
    )
    .sort((a, b) => {
      const byMap = a.map.localeCompare(b.map);
      if (byMap !== 0) return byMap;
      return a.id - b.id;
    });

  return (
    <>
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Queue Catalogue ({filtered.length})
        </h1>
        <p className="text-gray-600">
          Queue IDs, map associations, and notes mirrored from
          `queues.csv`.
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search queues by map, description, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </header>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          {filtered.map((queue) => (
            <article
              key={queue.id}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm"
            >
              <p className="text-xs uppercase text-gray-500">
                Queue {queue.id}
              </p>
              <h2 className="text-lg font-semibold text-gray-900">
                {queue.map}
              </h2>
              <p className="text-xs text-gray-500">
                {queue.description || "No description"}
              </p>
              {queue.notes && (
                <p className="text-xs text-gray-400">Notes: {queue.notes}</p>
              )}
              <p className="text-xs text-gray-500">
                Deprecated: {queue.isDeprecated ? "Yes" : "No"}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
