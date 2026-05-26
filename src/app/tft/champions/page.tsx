"use client";

import { useState } from "react";
import Link from "next/link";
import { tftData } from "@/lib/tft/data";
import { BackLink } from "@/components/BackLink";

const COST_COLORS: Record<number, string> = {
  1: "bg-gray-100 text-gray-700",
  2: "bg-green-100 text-green-700",
  3: "bg-blue-100 text-blue-700",
  4: "bg-purple-100 text-purple-700",
  5: "bg-yellow-100 text-yellow-700",
};

export default function TFTChampionsPage() {
  const [search, setSearch] = useState("");
  const [costFilter, setCostFilter] = useState<number | null>(null);

  const filtered = tftData.champions
    .filter((c) => {
      const matchSearch =
        search === "" || c.name.toLowerCase().includes(search.toLowerCase());
      const matchCost = costFilter === null || c.cost === costFilter;
      return matchSearch && matchCost;
    })
    .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/tft" label="Back to TFT" />
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">TFT</p>
        <h1 className="text-3xl font-semibold text-gray-900">Champions ({filtered.length})</h1>
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
              {cost === null ? "All" : `${cost}⭐`}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search champions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
        />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((champ) => (
          <article
            key={champ.id}
            className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">{champ.name}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${COST_COLORS[champ.cost] ?? "bg-gray-100 text-gray-700"}`}
              >
                {champ.cost}g
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {champ.traits.map((trait) => (
                <Link
                  key={trait}
                  href={`/tft/traits#${trait.toLowerCase().replace(/\s+/g, "-")}`}
                  className="rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-700 hover:bg-teal-100"
                >
                  {trait}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
