"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { ChromaRecord } from "@/lib/league/types";

type ChromasListProps = {
  chromas: ChromaRecord[];
  champions: { name: string; slug: string }[];
};

export function ChromasList({ chromas, champions }: ChromasListProps) {
  const [search, setSearch] = useState("");
  
  const filtered = chromas
    .filter((chroma) =>
      search === "" ||
      chroma.name.toLowerCase().includes(search.toLowerCase()) ||
      chroma.champion.toLowerCase().includes(search.toLowerCase()) ||
      chroma.skinName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const byChampion = a.champion.localeCompare(b.champion);
      if (byChampion !== 0) return byChampion;
      const bySkin = a.skinName.localeCompare(b.skinName);
      if (bySkin !== 0) return bySkin;
      return a.name.localeCompare(b.name);
    });

  return (
    <>
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Chromas ({filtered.length})
        </h1>
        <p className="text-gray-600">
          Raw chorma list grouped by champion/skin, sourced from
          `leaguecontent/data/chromas.csv`.
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search chromas by name, champion, or skin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </header>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((chroma) => {
            const champion = champions.find(c => c.name.toLowerCase() === chroma.champion.toLowerCase());
            const championSlug = champion?.slug || '';
            return (
            <Link
              key={`${chroma.skinId}-${chroma.chromaId}`}
              href={`/league/${championSlug}`}
              className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
            >
              <p className="text-xs uppercase text-gray-500">
                {chroma.champion}
              </p>
              <h2 className="text-lg font-semibold text-gray-900">
                {chroma.name}
              </h2>
              <p className="text-xs text-gray-500">
                Base skin: {chroma.skinName} (#{chroma.skinId})
              </p>
              <p className="text-xs text-gray-500">
                Colors: {chroma.colors.join(", ") || "Unknown"}
              </p>
              {chroma.image && (
                <ImageWithFallback
                  src={`/leaguecontent/${chroma.image}`}
                  alt={chroma.name}
                  className="mt-2 h-36 w-full rounded-lg object-cover"
                />
              )}
            </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
