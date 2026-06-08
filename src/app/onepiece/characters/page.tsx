"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { BackLink } from "@/components/BackLink";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { onePieceData } from "@/lib/onepiece/data";
import type {
  OnePieceCharacterRecord,
  OnePieceDataBundle,
} from "@/lib/onepiece/types";

type RoleFilter = "All" | OnePieceCharacterRecord["role"];

const dataBundle: OnePieceDataBundle = onePieceData;

function truncateAbout(about: string | null): string {
  if (!about) {
    return "No description available.";
  }

  return about.length > 100 ? `${about.slice(0, 100)}...` : about;
}

export default function OnePieceCharactersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");

  const filteredCharacters = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return dataBundle.characters.filter((character) => {
      const matchesRole =
        roleFilter === "All" ? true : character.role === roleFilter;
      const matchesSearch =
        normalizedQuery.length === 0
          ? true
          : character.name.toLowerCase().includes(normalizedQuery) ||
            (character.about ?? "").toLowerCase().includes(normalizedQuery);

      return matchesRole && matchesSearch;
    });
  }, [roleFilter, searchQuery]);

  const filterOptions: RoleFilter[] = ["All", "Main", "Supporting"];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/onepiece" label="Back to One Piece" />

      <section className="flex flex-col gap-4 rounded-3xl border border-orange-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
            Character Directory
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            One Piece Characters
          </h1>
          <p className="text-sm text-gray-600">
            Showing {filteredCharacters.length} of {dataBundle.characters.length}{" "}
            characters.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => {
              const isActive = roleFilter === option;

              return (
                <button
                  key={option}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700"
                  }`}
                  onClick={() => setRoleFilter(option)}
                  type="button"
                >
                  {option}
                </button>
              );
            })}
          </div>

          <label className="w-full md:max-w-sm">
            <span className="sr-only">Search characters</span>
            <input
              className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name or about text"
              type="search"
              value={searchQuery}
            />
          </label>
        </div>
      </section>

      {dataBundle.characters.length === 0 ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          No character data is available yet.
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCharacters.map((character) => (
            <Link
              key={character.id}
              className="flex h-full flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
              href={`/onepiece/characters/${character.id}`}
            >
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  alt={character.name}
                  className="h-12 w-12 rounded-full object-cover"
                  src={character.image ?? ""}
                />
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-gray-900">
                    {character.name}
                  </h2>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      character.role === "Main"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {character.role}
                  </span>
                </div>
              </div>

              <p className="text-sm leading-6 text-gray-600">
                {truncateAbout(character.about)}
              </p>
            </Link>
          ))}
        </section>
      )}

      {dataBundle.characters.length > 0 && filteredCharacters.length === 0 ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
          No characters matched the current filters.
        </section>
      ) : null}
    </main>
  );
}
