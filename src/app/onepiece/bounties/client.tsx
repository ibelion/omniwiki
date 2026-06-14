"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { BackLink } from "@/components/BackLink";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { OnePieceCharacterRecord } from "@/lib/onepiece/types";

function parseBountyValue(bountyStr: string): number {
  const match = bountyStr.match(/[\d,]+/);
  if (!match) return 0;
  return parseInt(match[0].replace(/,/g, ""), 10);
}

function formatBounty(bountyStr: string): string {
  return bountyStr.replace(/\s*(Beli|Berry|Berries)\s*/i, "").trim() + " Berries";
}

export function BountiesClient({
  characters,
}: {
  characters: OnePieceCharacterRecord[];
}) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | "Main" | "Supporting">("All");

  const ranked = useMemo(() => {
    return characters
      .filter((c) => c.bounty && parseBountyValue(c.bounty) > 0)
      .sort((a, b) => parseBountyValue(b.bounty!) - parseBountyValue(a.bounty!));
  }, [characters]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ranked.filter((c) => {
      const matchesRole = roleFilter === "All" || c.role === roleFilter;
      const matchesSearch = !q || c.name.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [ranked, search, roleFilter]);

  const topBounty = ranked[0];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/onepiece" label="Back to One Piece" />

      <section className="flex flex-col gap-4 rounded-3xl border border-[#3a2410] bg-[#141418] p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d4933a]">
            World Government Most Wanted
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#F2E8D5]">Bounty Rankings</h1>
          <p className="text-sm text-[#6b6055]">
            {ranked.length} characters with recorded bounties.
            {topBounty && (
              <>
                {" "}Highest:{" "}
                <span className="text-[#d4933a]">{topBounty.name}</span> at{" "}
                {formatBounty(topBounty.bounty!)}.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2">
            {(["All", "Main", "Supporting"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setRoleFilter(opt)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  roleFilter === opt
                    ? "bg-[#7a3c10] text-white"
                    : "bg-[#1c1c22] text-[#9a8c7e] hover:bg-[#1c1208] hover:text-[#d4933a]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <label className="w-full md:max-w-sm">
            <span className="sr-only">Search by name</span>
            <input
              className="w-full rounded-full border border-[#2c2c32] bg-[#141418] px-4 py-2 text-sm text-[#F2E8D5] outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
              placeholder="Search by name"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
      </section>

      {ranked.length === 0 ? (
        <section className="rounded-2xl border border-[#3a2410] bg-[#1c1208] p-6 text-sm text-[#9a8c7e]">
          No bounty data available yet.
        </section>
      ) : (
        <section className="rounded-3xl border border-[#1c1c22] bg-[#141418] shadow-sm">
          <div className="divide-y divide-[#1c1c22]">
            {filtered.map((char) => {
              const rank = ranked.indexOf(char) + 1;
              const isTop3 = rank <= 3;
              return (
                <Link
                  key={char.id}
                  href={`/onepiece/characters/${char.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition hover:bg-[#110d08]"
                >
                  <span
                    className={`w-10 shrink-0 text-center text-sm font-bold ${
                      rank === 1
                        ? "text-[#ffd700]"
                        : rank === 2
                          ? "text-[#c0c0c0]"
                          : rank === 3
                            ? "text-[#cd7f32]"
                            : "text-[#6b6055]"
                    }`}
                  >
                    #{rank}
                  </span>

                  {char.image ? (
                    <ImageWithFallback
                      src={char.image}
                      alt={char.name}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1c1c22] text-sm font-bold text-[#6b6055]">
                      {char.name[0]}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[#F2E8D5]">{char.name}</p>
                    <p className="text-xs text-[#6b6055]">
                      {char.position ?? char.role}
                      {char.devilFruit && (
                        <span className="ml-2 text-[#9a7850]">{char.devilFruit}</span>
                      )}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 text-right text-sm font-bold tabular-nums ${
                      isTop3 ? "text-[#d4933a]" : "text-[#9a8c7e]"
                    }`}
                  >
                    {formatBounty(char.bounty!)}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {ranked.length > 0 && filtered.length === 0 && (
        <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 text-sm text-[#6b6055]">
          No characters matched your search.
        </section>
      )}
    </main>
  );
}
