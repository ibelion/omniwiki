"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";
import type { TFTTraitRecord } from "@/lib/tft/types";

const TIER_STYLES: Record<number, string> = {
  1: "bg-[#1c1c22] text-[#9a8c7e]",
  2: "bg-[#12122a] text-[#8892f0]",
  3: "bg-[#1c0e2a] text-[#c084fc]",
  4: "bg-[#1c1208] text-[#d4933a]",
};

const stripTokens = (html: string) =>
  html.replace(/@\w+@/g, "").replace(/\(\s*\)/g, "").replace(/\s{2,}/g, " ").trim();

const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

export function TFTTraitsClient({
  traits,
  setNumber,
  champCountByTrait,
}: {
  traits: TFTTraitRecord[];
  setNumber: number;
  champCountByTrait: Record<string, number>;
}) {
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const filtered = [...traits]
    .filter((t) => !q || t.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/tft" label="Back to TFT" />
      <header className="relative overflow-hidden rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 120% at 100% 50%, rgba(74,184,200,0.10) 0%, transparent 70%)",
          }}
        />
        <p className="text-sm font-semibold uppercase tracking-wide text-[#4ab8c8]">
          TFT · Set {setNumber}
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-[#F2E8D5]">
          Traits ({filtered.length})
        </h1>
        <p className="mt-1 text-sm text-[#6b6055]">Origins and classes with unit activation breakpoints.</p>
        <input
          type="text"
          placeholder="Search traits..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-[#2c2c32] px-4 py-2 text-sm focus:border-[#1a4050] focus:outline-none focus:ring-2 focus:ring-[#0d181c]"
        />
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {filtered.map((trait) => (
          <Link key={trait.id} href={`/tft/traits/${toSlug(trait.name)}`} className="block">
            <article className="flex gap-3 rounded-2xl border border-[#1c1c22] bg-[#141418] p-4 shadow-sm transition hover:border-[#1a3038] hover:shadow-md">
              {trait.image && (
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-[#1c1c22] bg-[#0c0c0e]">
                  <ImageWithFallback
                    src={trait.image}
                    alt={trait.name}
                    className="h-10 w-10"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[#F2E8D5]">{trait.name}</h3>
                  {(champCountByTrait[trait.name] ?? 0) > 0 && (
                    <span className="shrink-0 rounded-full bg-[#0d181c] px-2 py-0.5 text-xs font-medium text-[#4ab8c8]">
                      {champCountByTrait[trait.name]} champs
                    </span>
                  )}
                </div>
                {trait.description && (
                  <p
                    className="mt-0.5 line-clamp-2 text-xs text-[#6b6055]"
                    dangerouslySetInnerHTML={{ __html: stripTokens(trait.description) }}
                  />
                )}
                {trait.tiers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {trait.tiers.map((tier, idx) => (
                      <span
                        key={idx}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIER_STYLES[tier.style] ?? "bg-[#1c1c22] text-[#6b6055]"}`}
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
