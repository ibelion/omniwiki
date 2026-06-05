"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { PokemonRecord } from "@/lib/pokemon/types";
import { isBaseForm } from "@/lib/pokemon/forms";

type PokemonSearchProps = {
  pokemon: PokemonRecord[];
  typeOptions: string[];
};

const GENERATION_LABELS: Record<string, string> = {
  "generation-i": "Gen I",
  "generation-ii": "Gen II",
  "generation-iii": "Gen III",
  "generation-iv": "Gen IV",
  "generation-v": "Gen V",
  "generation-vi": "Gen VI",
  "generation-vii": "Gen VII",
  "generation-viii": "Gen VIII",
  "generation-ix": "Gen IX",
};

export const PokemonSearch = ({ pokemon, typeOptions }: PokemonSearchProps) => {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [genFilter, setGenFilter] = useState("");

  const baseFormsOnly = useMemo(() => pokemon.filter(isBaseForm), [pokemon]);

  const generationOptions = useMemo(() => {
    const gens = Array.from(new Set(baseFormsOnly.map((p) => p.generation))).sort();
    return gens;
  }, [baseFormsOnly]);

  const filtered = useMemo(() => {
    return baseFormsOnly.filter((p) => {
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.slug.toLowerCase().includes(query.toLowerCase());
      const matchesType = !typeFilter || p.types.includes(typeFilter);
      const matchesGen = !genFilter || p.generation === genFilter;
      return matchesQuery && matchesType && matchesGen;
    });
  }, [baseFormsOnly, query, typeFilter, genFilter]);

  return (
    <>
      <form
        className="mt-6 flex flex-wrap gap-3"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search Pokémon"
          placeholder="Search Pokémon"
          className="min-w-[220px] rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="Filter by type"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">All types</option>
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          value={genFilter}
          onChange={(e) => setGenFilter(e.target.value)}
          aria-label="Filter by generation"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">All generations</option>
          {generationOptions.map((gen) => (
            <option key={gen} value={gen}>
              {GENERATION_LABELS[gen] ?? gen}
            </option>
          ))}
        </select>
      </form>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((pokemon) => (
          <Link
            key={pokemon.id}
            href={`/pokemon/${pokemon.slug}`}
            className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            aria-label={`View ${pokemon.name} details`}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-500">
                #{pokemon.id.toString().padStart(3, "0")}
              </div>
              <div className="flex gap-2">
                {pokemon.types.map((type) => (
                  <span
                    key={type}
                    className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ImageWithFallback
                src={`/pokemoncontent/${pokemon.sprites.default}`}
                alt={`${pokemon.name} sprite`}
                className="h-16 w-16 rounded-lg border border-gray-100 bg-gray-50 object-contain"
                loading="lazy"
              />
              <h2 className="text-lg font-semibold text-gray-900">
                {pokemon.name}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="rounded-full bg-gray-100 px-2 py-1">
                BST {pokemon.baseStatTotal}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-1">
                {pokemon.generation}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-700">
              {Object.entries(pokemon.stats).map(([stat, value]) => (
                <span
                  key={stat}
                  className="rounded-md bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-700"
                >
                  {stat}: {value}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </section>
    </>
  );
};
