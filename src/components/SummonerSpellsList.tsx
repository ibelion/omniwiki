"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { SummonerSpellRecord } from "@/lib/league/types";

const MODE_LABELS: Record<string, string> = {
  CLASSIC: "Summoner's Rift",
  ARAM: "ARAM",
  URF: "URF",
  TUTORIAL: "Tutorial",
  NEXUSBLITZ: "Nexus Blitz",
  CHERRY: "Arena",
};

export function SummonerSpellsList({ spells }: { spells: SummonerSpellRecord[] }) {
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState<string | null>(null);

  // Collect all unique modes across all spells, sorted
  const modes = useMemo(() => {
    const all = new Set<string>();
    for (const spell of spells) {
      for (const m of spell.modes ?? []) all.add(m);
    }
    return [...all].sort();
  }, [spells]);

  const filtered = useMemo(
    () =>
      spells
        .filter((spell) => {
          if (modeFilter && !(spell.modes ?? []).includes(modeFilter)) return false;
          if (!search) return true;
          const q = search.toLowerCase();
          return (
            spell.name.toLowerCase().includes(q) ||
            spell.description.toLowerCase().includes(q) ||
            spell.id.toLowerCase().includes(q)
          );
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [spells, search, modeFilter]
  );

  return (
    <>
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Summoner Spells ({filtered.length})
        </h1>
        <p className="text-gray-600">
          Every summoner spell across all game modes — Flash, Ignite, ARAM exclusives, and more.
        </p>
        <input
          type="text"
          placeholder="Search by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />

        {/* Mode filter chips */}
        {modes.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setModeFilter(null)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                modeFilter === null
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All modes
            </button>
            {modes.map((m) => (
              <button
                key={m}
                onClick={() => setModeFilter(modeFilter === m ? null : m)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  modeFilter === m
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {MODE_LABELS[m] ?? m}
              </button>
            ))}
          </div>
        )}
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((spell) => (
            <Link
              key={spell.key}
              href={`/league/summoner-spells/${spell.id}`}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src={spell.image ? `/leaguecontent/${spell.image}` : "/globe.svg"}
                  alt={`${spell.name} icon`}
                  className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
                />
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{spell.name}</h3>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {(spell.modes ?? []).map((m) => (
                      <span
                        key={m}
                        className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                      >
                        {MODE_LABELS[m] ?? m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600">{spell.description}</p>
              <p className="text-xs text-gray-500">
                Cooldown: {spell.cooldown}s
                {spell.summonerLevel != null && ` · Level ${spell.summonerLevel} required`}
              </p>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-sm text-gray-500">No spells match your search.</p>
        )}
      </section>
    </>
  );
}
