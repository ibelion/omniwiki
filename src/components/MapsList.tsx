"use client";

import { useState } from "react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { MapRecord } from "@/lib/league/types";

// Human-readable descriptions for the handful of League maps
const MAP_DESCRIPTIONS: Record<number, string> = {
  1:  "The original Summoner's Rift — 5v5 on the classic three-lane map.",
  2:  "Twisted Treeline — the old two-lane 3v3 battleground (retired 2019).",
  3:  "The Proving Grounds — the original ARAM testing ground.",
  4:  "Twisted Treeline (updated) — the reworked Gothic 3v3 map.",
  8:  "The Crystal Scar — Dominion's capture-point arena (retired 2016).",
  10: "Twisted Treeline (v2) — another iteration of the 3v3 map.",
  11: "Summoner's Rift (current) — the definitive 5v5 map used since Season 3.",
  12: "Howling Abyss — the single-lane ARAM battleground.",
  14: "Butcher's Bridge — ARAM's Bilgewater-themed alternate map.",
  16: "Cosmic Ruins — a cosmic-horror-themed ARAM variant.",
  18: "Substructure 43 — a Void-themed ARAM variant.",
  19: "Nexus Blitz — the fast-paced experimental arcade map.",
  21: "Nexus Blitz (updated) — the refreshed version of the Nexus Blitz map.",
  22: "Teamfight Tactics — the auto-battler board.",
  30: "Convergence — the main TFT arena.",
};

export function MapsList({ maps }: { maps: MapRecord[] }) {
  const [search, setSearch] = useState("");

  const filtered = maps
    .filter((map) =>
      search === "" ||
      map.name.toLowerCase().includes(search.toLowerCase()) ||
      map.id.toString().includes(search)
    )
    .sort((a, b) => a.id - b.id);

  return (
    <>
      <header className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#4caf72]">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-[#F2E8D5]">
          Maps ({filtered.length})
        </h1>
        <p className="text-[#6b6055]">
          Every map surface in League history, including retired and event arenas.
        </p>
        <input
          type="text"
          placeholder="Search by name or map ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-[#2c2c32] px-4 py-2 text-sm focus:border-[#1A5228] focus:outline-none focus:ring-2 focus:ring-[#0e1c14]"
        />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((map) => (
          <article
            key={map.id}
            className="flex flex-col gap-3 rounded-2xl border border-[#1c1c22] bg-[#141418] p-5 shadow-sm"
          >
            <ImageWithFallback
              src={map.image ? `/leaguecontent/${map.image}` : "/globe.svg"}
              alt={map.name}
              className="h-32 w-full rounded-xl border border-[#1c1c22] object-cover"
            />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#4caf72]">
                Map {map.id}
              </p>
              <p className="text-lg font-semibold text-[#F2E8D5]">{map.name}</p>
              {MAP_DESCRIPTIONS[map.id] && (
                <p className="mt-1 text-sm text-[#6b6055]">{MAP_DESCRIPTIONS[map.id]}</p>
              )}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
