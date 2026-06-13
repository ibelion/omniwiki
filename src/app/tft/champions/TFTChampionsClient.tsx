"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";
import type { TFTChampionRecord } from "@/lib/tft/types";
import { TFT_COST_COLORS } from "@/lib/tft/utils";

const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

export function TFTChampionsClient({
  champions,
  setNumber,
}: {
  champions: TFTChampionRecord[];
  setNumber: number;
}) {
  const [search, setSearch] = useState("");
  const [costFilter, setCostFilter] = useState<number | null>(null);
  const [traitFilter, setTraitFilter] = useState<string | null>(null);

  const allTraits = Array.from(
    new Set(champions.flatMap((c) => c.traits))
  ).sort();

  const filtered = champions
    .filter((c) => {
      const matchSearch =
        search === "" || c.name.toLowerCase().includes(search.toLowerCase());
      const matchCost = costFilter === null || c.cost === costFilter;
      const matchTrait =
        traitFilter === null ||
        c.traits.includes(traitFilter);
      return matchSearch && matchCost && matchTrait;
    })
    .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
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
          Champions ({filtered.length})
        </h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {[null, 1, 2, 3, 4, 5].map((cost) => (
            <button
              key={cost ?? "all"}
              onClick={() => setCostFilter(cost)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                costFilter === cost
                  ? "bg-[#1a4050] text-white"
                  : "bg-[#1c1c22] text-[#9a8c7e] hover:bg-[#0d181c]"
              }`}
            >
              {cost === null ? "All" : `${cost}g`}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <input
            type="text"
            placeholder="Search champions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#2c2c32] px-4 py-2 text-sm focus:border-[#1a4050] focus:outline-none focus:ring-2 focus:ring-[#0d181c]"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {allTraits.map((trait) => (
            <button
              key={trait}
              type="button"
              onClick={() => setTraitFilter(traitFilter === trait ? null : trait)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                traitFilter === trait
                  ? "border-[#1a4050] bg-[#0d181c] text-[#4ab8c8]"
                  : "border-[#1c1c22] bg-[#0c0c0e] text-[#6b6055] hover:border-[#1a3038] hover:text-[#4ab8c8]"
              }`}
            >
              {trait}
            </button>
          ))}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((champ) => (
          <Link
            key={champ.id}
            href={`/tft/champions/${toSlug(champ.name)}`}
            className="block"
          >
            <article className="flex items-center gap-3 rounded-2xl border border-[#1c1c22] bg-[#141418] p-3 shadow-sm transition hover:border-[#1a3038] hover:shadow-md">
              {champ.image && (
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#1c1c22] bg-[#0c0c0e]">
                  <ImageWithFallback
                    src={champ.image}
                    alt={champ.name}
                    className="h-14 w-14"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-semibold text-[#F2E8D5]">
                    {champ.name}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${TFT_COST_COLORS[champ.cost] ?? "bg-[#1c1c22] text-[#9a8c7e]"}`}
                  >
                    {champ.cost}g
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {champ.traits.map((trait) => (
                    <span
                      key={trait}
                      className="rounded-full bg-[#0d181c] px-2 py-0.5 text-xs text-[#4ab8c8]"
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
