"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { BackLink } from "@/components/BackLink";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { OnePieceCharacterRecord } from "@/lib/onepiece/types";

type RoleFilter = "All" | OnePieceCharacterRecord["role"];
type ExtraFilter = "All" | "HasDevilFruit" | "HasBounty";
type DFTypeFilter = "All" | "Paramecia" | "Zoan" | "Logia";

function truncateAbout(about: string | null): string {
  if (!about) return "No description available.";
  return about.length > 100 ? `${about.slice(0, 100)}...` : about;
}

export function CharactersClient({
  characters,
}: {
  characters: OnePieceCharacterRecord[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [extraFilter, setExtraFilter] = useState<ExtraFilter>("All");
  const [dfTypeFilter, setDfTypeFilter] = useState<DFTypeFilter>("All");

  const filteredCharacters = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return characters.filter((character) => {
      const matchesRole = roleFilter === "All" || character.role === roleFilter;
      const matchesExtra =
        extraFilter === "All"
          ? true
          : extraFilter === "HasDevilFruit"
            ? Boolean(character.devilFruit)
            : Boolean(character.bounty);
      const matchesDFType =
        dfTypeFilter === "All"
          ? true
          : character.devilFruitType === dfTypeFilter;
      const matchesSearch =
        normalizedQuery.length === 0
          ? true
          : character.name.toLowerCase().includes(normalizedQuery) ||
            (character.about ?? "").toLowerCase().includes(normalizedQuery) ||
            (character.epithet ?? "").toLowerCase().includes(normalizedQuery) ||
            character.affiliation.some((a) =>
              a.toLowerCase().includes(normalizedQuery),
            );
      return matchesRole && matchesExtra && matchesDFType && matchesSearch;
    });
  }, [characters, roleFilter, extraFilter, dfTypeFilter, searchQuery]);

  const filterOptions: RoleFilter[] = ["All", "Main", "Supporting"];
  const extraOptions: { value: ExtraFilter; label: string }[] = [
    { value: "All", label: "All" },
    { value: "HasDevilFruit", label: "Devil Fruit" },
    { value: "HasBounty", label: "Has Bounty" },
  ];
  const dfTypeOptions: { value: DFTypeFilter; label: string }[] = [
    { value: "All", label: "All" },
    { value: "Paramecia", label: "Paramecia" },
    { value: "Zoan", label: "Zoan" },
    { value: "Logia", label: "Logia" },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/onepiece" label="Back to One Piece" />

      <section className="flex flex-col gap-4 rounded-3xl border border-[#3a2410] bg-[#141418] p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d4933a]">
            Character Directory
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#F2E8D5]">
            One Piece Characters
          </h1>
          <p className="text-sm text-[#6b6055]">
            Showing {filteredCharacters.length} of {characters.length} characters.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#6b6055]">Role:</span>
            {filterOptions.map((option) => {
              const isActive = roleFilter === option;
              return (
                <button
                  key={option}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#7a3c10] text-white"
                      : "bg-[#1c1c22] text-[#9a8c7e] hover:bg-[#1c1208] hover:text-[#d4933a]"
                  }`}
                  onClick={() => setRoleFilter(option)}
                  type="button"
                >
                  {option}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#6b6055]">Filter:</span>
            {extraOptions.map((opt) => {
              const isActive = extraFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setExtraFilter(opt.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#7a3c10] text-white"
                      : "bg-[#1c1c22] text-[#9a8c7e] hover:bg-[#1c1208] hover:text-[#d4933a]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#6b6055]">Devil Fruit Type:</span>
            {dfTypeOptions.map((opt) => {
              const isActive = dfTypeFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDfTypeFilter(opt.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? opt.value === "Paramecia"
                        ? "bg-[#2a1a40] text-[#b890e0]"
                        : opt.value === "Zoan"
                          ? "bg-[#0e2410] text-[#56b870]"
                          : opt.value === "Logia"
                            ? "bg-[#0e1a28] text-[#4090d0]"
                            : "bg-[#7a3c10] text-white"
                      : "bg-[#1c1c22] text-[#9a8c7e] hover:bg-[#1c1208] hover:text-[#d4933a]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <label className="w-full md:max-w-sm">
          <span className="sr-only">Search characters</span>
          <input
            className="w-full rounded-full border border-[#2c2c32] bg-[#141418] px-4 py-2 text-sm text-[#F2E8D5] outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name or description"
            type="search"
            value={searchQuery}
          />
        </label>
      </section>

      {characters.length === 0 ? (
        <section className="rounded-2xl border border-[#3a2410] bg-[#1c1208] p-6 text-sm text-[#9a8c7e]">
          No character data is available yet.
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCharacters.map((character) => (
            <Link
              key={character.id}
              className="flex h-full flex-col gap-4 rounded-3xl border border-[#1c1c22] bg-[#141418] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#4a3420] hover:shadow-md"
              href={`/onepiece/characters/${character.id}`}
            >
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  alt={character.name}
                  className="h-12 w-12 rounded-full object-cover"
                  src={character.image ?? ""}
                />
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-[#F2E8D5]">
                    {character.name}
                  </h2>
                  {character.epithet && (
                    <p className="truncate text-xs italic text-[#9a7850]">{character.epithet}</p>
                  )}
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      character.role === "Main"
                        ? "bg-[#1c1208] text-[#d4933a]"
                        : "bg-[#1c1c22] text-[#9a8c7e]"
                    }`}
                  >
                    {character.role}
                  </span>
                </div>
              </div>

              {(character.bounty ?? character.devilFruit) && (
                <div className="flex flex-wrap gap-1.5">
                  {character.bounty && (
                    <span className="rounded-full border border-[#3a2410] bg-[#1c1208] px-2.5 py-1 text-xs font-semibold text-[#d4933a]">
                      {character.bounty.replace(/\s*(Beli|Berry|Berries)\s*/i, "").trim()} B
                    </span>
                  )}
                  {character.devilFruit && (
                    <span className="rounded-full border border-[#1c1c22] bg-[#0c0c0e] px-2.5 py-1 text-xs text-[#9a7850]">
                      {character.devilFruit}
                    </span>
                  )}
                </div>
              )}

              <p className="text-sm leading-6 text-[#6b6055]">
                {truncateAbout(character.about)}
              </p>
            </Link>
          ))}
        </section>
      )}

      {characters.length > 0 && filteredCharacters.length === 0 && (
        <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 text-sm text-[#6b6055] shadow-sm">
          No characters matched the current filters.
        </section>
      )}
    </main>
  );
}
