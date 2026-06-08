"use client";

import { useState } from "react";
import Link from "next/link";
import { tftData } from "@/lib/tft/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";

const COST_COLORS: Record<number, string> = {
  1: "bg-gray-100 text-gray-700",
  2: "bg-green-100 text-green-700",
  3: "bg-blue-100 text-blue-700",
  4: "bg-purple-100 text-purple-700",
  5: "bg-yellow-100 text-yellow-700",
};
const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

export default function TFTChampionsPage() {
  const [search, setSearch] = useState("");
  const [costFilter, setCostFilter] = useState<number | null>(null);
  const [traitFilter, setTraitFilter] = useState("");

  const filtered = tftData.champions
    .filter((c) => {
      const matchSearch =
        search === "" || c.name.toLowerCase().includes(search.toLowerCase());
      const matchCost = costFilter === null || c.cost === costFilter;
      const matchTrait =
        traitFilter === "" ||
        c.traits.some((t) => t.toLowerCase().includes(traitFilter.toLowerCase()));
      return matchSearch && matchCost && matchTrait;
    })
    .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/tft" label="Back to TFT" />
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
          TFT · Set {tftData.setNumber ?? 17}
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-gray-900">
          Champions ({filtered.length})
        </h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {[null, 1, 2, 3, 4, 5].map((cost) => (
            <button
              key={cost ?? "all"}
              onClick={() => setCostFilter(cost)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                costFilter === cost
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-teal-50"
              }`}
            >
              {cost === null ? "All" : `${cost}g`}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder="Search champions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
          <input
            type="text"
            placeholder="Filter by trait..."
            value={traitFilter}
            onChange={(e) => setTraitFilter(e.target.value)}
            className="w-40 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((champ) => (
          <Link
            key={champ.id}
            href={`/tft/champions/${toSlug(champ.name)}`}
            className="block"
          >
            <article className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-teal-200 hover:shadow-md">
              {champ.image && (
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                  <ImageWithFallback
                    src={champ.image}
                    alt={champ.name}
                    className="h-14 w-14"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-semibold text-gray-900">
                    {champ.name}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${COST_COLORS[champ.cost] ?? "bg-gray-100 text-gray-700"}`}
                  >
                    {champ.cost}g
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {champ.traits.map((trait) => (
                    <span
                      key={trait}
                      className="rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-700"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </main>
  );
}
