"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { cleanText } from "@/lib/utils";
import type { ChampionAbility } from "@/lib/league/types";

type ChampionStub = { id: number; slug: string; image?: string | null };

type AbilitiesListProps = {
  abilities: ChampionAbility[];
  champions: ChampionStub[];
};

const SLOTS = ["All", "Passive", "Q", "W", "E", "R"] as const;
type SlotFilter = (typeof SLOTS)[number];

const slotOrder: Record<string, number> = { Passive: 0, P: 0, Q: 1, W: 2, E: 3, R: 4 };

const PAGE_SIZE = 60;

export function AbilitiesList({ abilities, champions }: AbilitiesListProps) {
  const [search, setSearch] = useState("");
  const [slotFilter, setSlotFilter] = useState<SlotFilter>("All");
  const [championFilter, setChampionFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const championById = useMemo(
    () => new Map(champions.map((c) => [c.id, c])),
    [champions]
  );

  const championNames = useMemo(
    () => [...new Set(abilities.map((a) => a.championName))].sort(),
    [abilities]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return abilities
      .filter((ability) => {
        if (championFilter !== null && ability.championName !== championFilter) return false;
        // Slot filter — "Passive" matches both slot "Passive" and "P"
        if (slotFilter !== "All") {
          const slot = ability.slot.toUpperCase();
          if (slotFilter === "Passive") {
            if (slot !== "PASSIVE" && slot !== "P") return false;
          } else if (slot !== slotFilter) {
            return false;
          }
        }
        if (!q) return true;
        return (
          ability.name.toLowerCase().includes(q) ||
          ability.championName.toLowerCase().includes(q) ||
          ability.description.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const byChampion = a.championName.localeCompare(b.championName);
        if (byChampion !== 0) return byChampion;
        const slotA = slotOrder[a.slot] ?? 99;
        const slotB = slotOrder[b.slot] ?? 99;
        if (slotA !== slotB) return slotA - slotB;
        return a.name.localeCompare(b.name);
      });
  }, [abilities, search, slotFilter, championFilter]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleFilterChange(fn: () => void) {
    fn();
    setPage(0);
  }

  return (
    <>
      <header className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#4caf72]">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-[#F2E8D5]">
          Champion Abilities ({filtered.length})
        </h1>
        <p className="text-[#6b6055]">
          All champion abilities including passives, basic abilities, and ultimates.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search by name, champion, or description..."
            value={search}
            onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
            className="flex-1 rounded-lg border border-[#2c2c32] px-4 py-2 text-sm focus:border-[#1A5228] focus:outline-none focus:ring-2 focus:ring-[#0e1c14]"
          />
          <select
            value={championFilter ?? ""}
            onChange={(e) => handleFilterChange(() => setChampionFilter(e.target.value || null))}
            className="rounded-lg border border-[#2c2c32] px-3 py-2 text-sm focus:border-[#1A5228] focus:outline-none focus:ring-2 focus:ring-[#0e1c14]"
          >
            <option value="">All champions</option>
            {championNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Slot filter chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {SLOTS.map((slot) => (
            <button
              key={slot}
              onClick={() => handleFilterChange(() => setSlotFilter(slot))}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                slotFilter === slot
                  ? "bg-[#1A5228] text-white"
                  : "bg-[#1c1c22] text-[#6b6055] hover:bg-[#252528]"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </header>

      <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        {filtered.length === 0 ? (
          <p className="text-sm text-[#6b6055]">No abilities match your search.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((ability, index) => {
              const champion = championById.get(ability.championId);
              const championSlug = champion?.slug ?? "";
              const abilityId = championSlug
                ? `${championSlug}-${ability.slot.toLowerCase()}`
                : "";

              return (
                <Link
                  key={`${ability.championId}-${ability.slot}-${index}`}
                  href={
                    abilityId
                      ? `/league/abilities/${abilityId}`
                      : `/league/${championSlug}`
                  }
                  className="flex flex-col gap-2 rounded-xl border border-[#1c1c22] bg-[#0c0c0e] p-4 text-sm transition hover:border-[#1c3622] hover:bg-[#0e1c14] hover:shadow-md"
                >
                  {/* Slot label + champion name */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        ability.slot === "R"
                          ? "bg-rose-100 text-rose-700"
                          : ability.slot === "Passive" || ability.slot === "P"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-[#0e1c14] text-[#4caf72]"
                      }`}
                    >
                      {ability.slot}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-[#6b6055]">
                      {champion?.image && (
                        <ImageWithFallback
                          src={`/leaguecontent/${champion.image}`}
                          alt={ability.championName}
                          className="h-5 w-5 rounded object-cover"
                        />
                      )}
                      {ability.championName}
                    </span>
                  </div>

                  {/* Ability icon + name */}
                  <div className="flex items-center gap-3">
                    {ability.image && (
                      <ImageWithFallback
                        src={`/leaguecontent/${ability.image}`}
                        alt={ability.name}
                        className="h-12 w-12 shrink-0 rounded-lg border border-[#1c1c22] object-cover"
                      />
                    )}
                    <h2 className="text-base font-semibold leading-snug text-[#F2E8D5]">
                      {ability.name}
                    </h2>
                  </div>

                  {/* Description */}
                  <p className="text-xs leading-relaxed text-[#6b6055] line-clamp-3">
                    {cleanText(ability.description)}
                  </p>

                  {/* Stats row */}
                  {(ability.cooldown || ability.cost || ability.range) && (
                    <div className="flex flex-wrap gap-3 text-xs text-[#6b6055]">
                      {ability.cooldown && ability.cooldown !== "0" && (
                        <span>CD: {ability.cooldown}s</span>
                      )}
                      {ability.cost && ability.cost !== "0" && (
                        <span>Cost: {ability.cost}</span>
                      )}
                      {ability.range && ability.range !== "0" && (
                        <span>Range: {ability.range}</span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg border border-[#1c1c22] px-4 py-2 text-sm transition hover:bg-[#1c1c22] disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-[#6b6055]">
            Page {page + 1} of {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page === pageCount - 1}
            className="rounded-lg border border-[#1c1c22] px-4 py-2 text-sm transition hover:bg-[#1c1c22] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
      </section>
    </>
  );
}
