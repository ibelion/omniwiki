"use client";

import { useMemo, useState } from "react";

import { BackLink } from "@/components/BackLink";
import type { OnePieceCrewRecord } from "@/lib/onepiece/types";

export function CrewsClient({ crews }: { crews: OnePieceCrewRecord[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return crews;
    return crews.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.memberNames.some((n) => n.toLowerCase().includes(q)),
    );
  }, [crews, search]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/onepiece" label="Back to One Piece" />

      <section className="flex flex-col gap-4 rounded-3xl border border-[#3a2410] bg-[#141418] p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d4933a]">
            Factions &amp; Fleets
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#F2E8D5]">Crews</h1>
          <p className="text-sm text-[#6b6055]">
            Showing {filtered.length} of {crews.length} crews and organizations.
          </p>
        </div>

        <label className="w-full md:max-w-sm">
          <span className="sr-only">Search crews</span>
          <input
            className="w-full rounded-full border border-[#2c2c32] bg-[#141418] px-4 py-2 text-sm text-[#F2E8D5] outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
            placeholder="Search by crew or member name"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </section>

      {crews.length === 0 ? (
        <section className="rounded-2xl border border-[#3a2410] bg-[#1c1208] p-6 text-sm text-[#9a8c7e]">
          No crew data available.
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {filtered.map((crew) => {
            const memberCount = crew.memberNames.length || crew.memberIds.length;
            return (
              <div
                key={crew.id}
                className="flex flex-col gap-3 rounded-3xl border border-[#1c1c22] bg-[#141418] p-5 shadow-sm"
              >
                <div>
                  <h2 className="text-lg font-semibold text-[#F2E8D5]">{crew.name}</h2>
                  <p className="text-sm text-[#6b6055]">
                    {memberCount} member{memberCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {crew.memberNames.slice(0, 6).map((name, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-[#1c1c22] px-2.5 py-1 text-xs text-[#9a8c7e]"
                    >
                      {name.includes(",") ? name.split(",")[1].trim() : name.split(" ")[0]}
                    </span>
                  ))}
                  {crew.memberNames.length > 6 && (
                    <span className="rounded-full bg-[#1c1208] px-2.5 py-1 text-xs text-[#d4933a]">
                      +{crew.memberNames.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {crews.length > 0 && filtered.length === 0 && (
        <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 text-sm text-[#6b6055] shadow-sm">
          No crews matched your search.
        </section>
      )}
    </main>
  );
}
