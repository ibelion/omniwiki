"use client";

import { useState } from "react";
import Link from "next/link";
import { tftData } from "@/lib/tft/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";

const TIER_STYLES: Record<number, string> = {
  1: "bg-gray-100 text-gray-700",
  2: "bg-blue-100 text-blue-700",
  3: "bg-purple-100 text-purple-700",
  4: "bg-yellow-100 text-yellow-700",
};

const stripTokens = (html: string) =>
  html.replace(/@\w+@/g, "").replace(/\(\s*\)/g, "").replace(/\s{2,}/g, " ").trim();

const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

export default function TFTTraitsPage() {
  const [search, setSearch] = useState("");

  // Pre-compute champion count per trait name
  const champCountByTrait = new Map<string, number>();
  for (const c of tftData.champions) {
    for (const t of c.traits) {
      champCountByTrait.set(t, (champCountByTrait.get(t) ?? 0) + 1);
    }
  }

  const q = search.trim().toLowerCase();
  const filtered = [...tftData.traits]
    .filter((t) => !q || t.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/tft" label="Back to TFT" />
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
          TFT · Set {tftData.setNumber ?? 17}
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-gray-900">
          Traits ({filtered.length})
        </h1>
        <p className="mt-1 text-sm text-gray-500">Origins and classes with unit activation breakpoints.</p>
        <input
          type="text"
          placeholder="Search traits..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
        />
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {filtered.map((trait) => (
          <Link key={trait.id} href={`/tft/traits/${toSlug(trait.name)}`} className="block">
            <article className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md">
              {trait.image && (
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                  <ImageWithFallback
                    src={trait.image}
                    alt={trait.name}
                    className="h-10 w-10"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">{trait.name}</h3>
                  {(champCountByTrait.get(trait.name) ?? 0) > 0 && (
                    <span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
                      {champCountByTrait.get(trait.name)} champs
                    </span>
                  )}
                </div>
                {trait.description && (
                  <p
                    className="mt-0.5 line-clamp-2 text-xs text-gray-500"
                    dangerouslySetInnerHTML={{ __html: stripTokens(trait.description) }}
                  />
                )}
                {trait.tiers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {trait.tiers.map((tier, idx) => (
                      <span
                        key={idx}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIER_STYLES[tier.style] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {tier.minUnits}
                        {tier.minUnits !== tier.maxUnits && tier.maxUnits < 9999
                          ? `–${tier.maxUnits}`
                          : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </Link>
        ))}
      </section>
    </main>
  );
}
