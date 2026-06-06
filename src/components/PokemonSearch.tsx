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
  const [bstMin, setBstMin] = useState("");
  const [bstMax, setBstMax] = useState("");
  const [showAltForms, setShowAltForms] = useState(false);

  const pool = useMemo(
    () => (showAltForms ? pokemon : pokemon.filter(isBaseForm)),
    [pokemon, showAltForms]
  );

  const generationOptions = useMemo(() => {
    const gens = Array.from(new Set(pool.map((p) => p.generation))).sort();
    return gens;
  }, [pool]);

  const filtered = useMemo(() => {
    const minBst = bstMin !== "" ? parseInt(bstMin, 10) : null;
    const maxBst = bstMax !== "" ? parseInt(bstMax, 10) : null;
    return pool.filter((p) => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !p.slug.toLowerCase().includes(query.toLowerCase())) return false;
      if (typeFilter && !p.types.includes(typeFilter)) return false;
      if (genFilter && p.generation !== genFilter) return false;
      if (minBst !== null && !isNaN(minBst) && p.baseStatTotal < minBst) return false;
      if (maxBst !== null && !isNaN(maxBst) && p.baseStatTotal > maxBst) return false;
      return true;
    });
  }, [pool, query, typeFilter, genFilter, bstMin, bstMax]);

  return (
    <>
      <form
        className="mt-6 flex flex-wrap gap-3"
        onSubmit={(e) => e.preventDefault()}
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
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={bstMin}
            onChange={(e) => setBstMin(e.target.value)}
            placeholder="BST min"
            min={0}
            max={1200}
            aria-label="Minimum base stat total"
            className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            value={bstMax}
            onChange={(e) => setBstMax(e.target.value)}
            placeholder="BST max"
            min={0}
            max={1200}
            aria-label="Maximum base stat total"
            className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50">
          <input
            type="checkbox"
            checked={showAltForms}
            onChange={(e) => setShowAltForms(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Alt forms
        </label>
      </form>

      <p className="mt-3 text-sm text-gray-500">
        {filtered.length.toLocaleString()} result{filtered.length !== 1 ? "s" : ""}
      </p>

      <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <Link
            key={p.slug}
            href={`/pokemon/${p.slug}`}
            className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            aria-label={`View ${p.name} details`}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-500">
                #{p.id.toString().padStart(3, "0")}
              </div>
              <div className="flex gap-2">
                {p.types.map((type) => (
                  <span
                    key={type}
                    className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold capitalize text-indigo-700"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ImageWithFallback
                src={`/pokemoncontent/${p.sprites.default}`}
                alt={`${p.name} sprite`}
                className="h-16 w-16 rounded-lg border border-gray-100 bg-gray-50 object-contain"
                loading="lazy"
              />
              <h2 className="text-lg font-semibold text-gray-900">{p.name}</h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="rounded-full bg-gray-100 px-2 py-1">
                BST {p.baseStatTotal}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-1">
                {GENERATION_LABELS[p.generation] ?? p.generation}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-700">
              {Object.entries(p.stats).map(([stat, value]) => (
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
