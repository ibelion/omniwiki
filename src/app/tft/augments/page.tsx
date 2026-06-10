"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { BackLink } from "@/components/BackLink";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { tftData } from "@/lib/tft/data";

const TIER_LABELS: Record<number, string> = {
  1: "Silver",
  2: "Gold",
  3: "Prismatic",
};

const TIER_STYLES: Record<number, string> = {
  1: "bg-[#1c1c22] text-[#9a8c7e]",
  2: "bg-[#1c1208] text-[#d4933a]",
  3: "bg-[#1c0e2a] text-[#c084fc]",
};

const stripTokens = (html: string) =>
  html.replace(/@\w+@/g, "").replace(/\(\s*\)/g, "").replace(/\s{2,}/g, " ").trim();

type Augment = {
  id?: string;
  name?: string;
  description?: string;
  image?: string | null;
  tier?: number | null;
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

      <header className="relative overflow-hidden rounded-3xl border border-[#1c1c22] bg-[#141418] p-8 shadow-sm">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 120% at 100% 50%, rgba(74,184,200,0.10) 0%, transparent 70%)",
          }}
        />
        <p className="text-sm font-semibold uppercase tracking-widest text-[#4ab8c8]">
          TFT · Set {tftData.setNumber ?? 17}
        </p>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-[#F2E8D5]">
          Augments ({filteredAugments.length})
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#6b6055]">
          Silver, Gold, and Prismatic augments — search or filter by tier.
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-2xl border border-[#1c1c22] bg-[#141418] p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTierFilter(null)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              tierFilter === null
                ? "border-[#1a4050] bg-[#1a4050] text-white"
                : "border-[#1c1c22] bg-[#141418] text-[#9a8c7e] hover:border-[#1a3038] hover:text-[#4ab8c8]"
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
                  ? "border-[#1a4050] bg-[#1a4050] text-white"
                  : "border-[#1c1c22] bg-[#141418] text-[#9a8c7e] hover:border-[#1a3038] hover:text-[#4ab8c8]"
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
            className="w-full rounded-xl border border-[#1c1c22] bg-[#141418] px-4 py-3 text-sm text-[#F2E8D5] outline-none transition placeholder:text-[#6b6055] focus:border-[#1a4050] focus:ring-2 focus:ring-[#0d181c]"
          />
        </label>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAugments.map((augment) => {
          const tier = augment.tier ?? 1;

          return (
            <Link key={augment.id ?? `${augment.name ?? "augment"}-${tier}`} href={`/tft/augments/${augment.id}`} className="block">
            <article
              className="flex h-full flex-col gap-3 rounded-2xl border border-[#1c1c22] bg-[#141418] p-4 shadow-sm transition hover:border-[#1a3038] hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                {augment.image && (
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#1c1c22] bg-[#0c0c0e]">
                    <ImageWithFallback
                      src={augment.image}
                      alt={augment.name ?? ""}
                      className="h-10 w-10"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-semibold leading-snug text-[#F2E8D5]">
                      {augment.name ?? "Unknown Augment"}
                    </h2>
                    <span
                      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TIER_STYLES[tier] ?? TIER_STYLES[1]}`}
                    >
                      {TIER_LABELS[tier] ?? "Silver"}
                    </span>
                  </div>
                  {augment.description && (
                    <div
                      className="mt-1 text-xs leading-relaxed text-[#6b6055]"
                      dangerouslySetInnerHTML={{
                        __html: stripTokens(augment.description),
                      }}
                    />
                  )}
                </div>
              </div>
            </article>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
