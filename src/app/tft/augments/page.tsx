"use client";

import { useMemo, useState } from "react";

import { BackLink } from "@/components/BackLink";
import { tftData } from "@/lib/tft/data";

const TIER_LABELS: Record<number, string> = {
  1: "Silver",
  2: "Gold",
  3: "Prismatic",
};

const TIER_STYLES: Record<number, string> = {
  1: "bg-gray-100 text-gray-700",
  2: "bg-yellow-100 text-yellow-700",
  3: "bg-purple-100 text-purple-700",
};

type Augment = {
  name?: string;
  description?: string;
  tier?: number;
};

const augments = (tftData.augments ?? []) as Augment[];

export default function TftAugmentsPage() {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<number | null>(null);

  const filteredAugments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...augments]
      .filter((augment) => {
        const name = augment.name ?? "";
        const description = augment.description ?? "";
        const matchesSearch =
          normalizedSearch.length === 0 ||
          name.toLowerCase().includes(normalizedSearch) ||
          description.toLowerCase().includes(normalizedSearch);
        const matchesTier =
          tierFilter === null ? true : augment.tier === tierFilter;

        return matchesSearch && matchesTier;
      })
      .sort((a, b) => {
        const tierDiff = (a.tier ?? Number.MAX_SAFE_INTEGER) - (b.tier ?? Number.MAX_SAFE_INTEGER);
        if (tierDiff !== 0) {
          return tierDiff;
        }

        return (a.name ?? "").localeCompare(b.name ?? "");
      });
  }, [search, tierFilter]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <BackLink href="/tft" label="Back to TFT" />

      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
          TFT
        </p>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Augments ({filteredAugments.length})
          </h1>
          <p className="max-w-3xl text-sm text-slate-600 sm:text-base">
            Silver, Gold, and Prismatic augments for Set {tftData.setNumber ?? 17}.
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTierFilter(null)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              tierFilter === null
                ? "border-teal-600 bg-teal-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:text-teal-700"
            }`}
          >
            All
          </button>
          {[1, 2, 3].map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setTierFilter(tier)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                tierFilter === tier
                  ? "border-teal-600 bg-teal-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:text-teal-700"
              }`}
            >
              {TIER_LABELS[tier]}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="sr-only">Search augments</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search augments by name or description"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </label>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAugments.map((augment) => {
          const tier = augment.tier ?? 1;

          return (
            <article
              key={`${augment.name ?? "augment"}-${tier}`}
              className="flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  {augment.name ?? "Unknown Augment"}
                </h2>
                <span
                  className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${TIER_STYLES[tier] ?? TIER_STYLES[1]}`}
                >
                  {TIER_LABELS[tier] ?? "Silver"}
                </span>
              </div>

              <div
                className="text-sm leading-6 text-slate-600 [&_a]:text-teal-600 [&_a]:underline-offset-2 hover:[&_a]:text-teal-700 [&_a]:hover:underline"
                dangerouslySetInnerHTML={{
                  __html: augment.description ?? "",
                }}
              />
            </article>
          );
        })}
      </section>
    </div>
  );
}
