"use client";

import { useState } from "react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { EmoteRecord } from "@/lib/league/types";

export function EmotesList({ emotes }: { emotes: EmoteRecord[] }) {
  const [search, setSearch] = useState("");
  
  const filtered = emotes
    .filter((emote) =>
      search === "" ||
      (emote.name && emote.name.toLowerCase().includes(search.toLowerCase())) ||
      (emote.description && emote.description.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });

  return (
    <>
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Emotes ({filtered.length})
        </h1>
        <p className="text-gray-600">
          Simple reference for every emote ID with description and icon.
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search emotes by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </header>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((emote) => (
            <article
              key={emote.id}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm"
            >
              <ImageWithFallback
                src={
                  emote.image ? `/leaguecontent/${emote.image}` : "/globe.svg"
                }
                alt={emote.name || `Emote ${emote.id}`}
                className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
              />
              <div>
                <p className="text-xs uppercase text-gray-500">
                  ID {emote.id}
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {emote.name || "Unnamed emote"}
                </p>
                <p className="text-xs text-gray-500">
                  {emote.description || "No description"}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
