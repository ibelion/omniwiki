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

export function AbilitiesList({ abilities, champions }: AbilitiesListProps) {
  const [search, setSearch] = useState("");
  const [slotFilter, setSlotFilter] = useState<SlotFilter>("All");
  const [championFilter, setChampionFilter] = useState<string | null>(null);

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

  return (
    <>
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Champion Abilities ({filtered.length})
        </h1>
        <p className="text-gray-600">
          All champion abilities including passives, basic abilities, and ultimates.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search by name, champion, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <select
            value={championFilter ?? ""}
            onChange={(e) => setChampionFilter(e.target.value || null)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
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
              onClick={() => setSlotFilter(slot)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                slotFilter === slot
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500">No abilities match your search.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ability, index) => {
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
                  className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
                >
                  {/* Slot label + champion name */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        ability.slot === "R"
                          ? "bg-rose-100 text-rose-700"
                          : ability.slot === "Passive" || ability.slot === "P"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {ability.slot}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
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
                        className="h-12 w-12 shrink-0 rounded-lg border border-gray-200 object-cover"
                      />
                    )}
                    <h2 className="text-base font-semibold leading-snug text-gray-900">
                      {ability.name}
                    </h2>
                  </div>

                  {/* Description */}
                  <p className="text-xs leading-relaxed text-gray-600 line-clamp-3">
                    {cleanText(ability.description)}
                  </p>

                  {/* Stats row */}
                  {(ability.cooldown || ability.cost || ability.range) && (
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
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
      </section>
    </>
  );
}
