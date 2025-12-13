"use client";

import { useState } from "react";

interface Type {
  slug: string;
  name: string;
  generation: string;
  doubleDamageTo: string[];
  halfDamageTo: string[];
  noDamageTo: string[];
  doubleDamageFrom: string[];
  halfDamageFrom: string[];
  noDamageFrom: string[];
}

interface TypesSearchClientProps {
  types: Type[];
}

export function TypesSearchClient({ types }: TypesSearchClientProps) {
  const [search, setSearch] = useState("");
  
  const filtered = types.filter((type) =>
    search === "" ||
    type.name.toLowerCase().includes(search.toLowerCase()) ||
    type.generation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Types ({filtered.length})
        </h1>
        <p className="text-gray-600">
          Type relationships from `types.csv`. Use this for weakness/resistance
          calculations in OmniGames.
        </p>
        <input
          type="text"
          placeholder="Search by type name or generation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </header>
      <section className="grid gap-4 sm:grid-cols-2">
        {filtered.map((type) => (
          <article
            key={type.slug}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm"
          >
            <p className="text-xs uppercase text-gray-500">
              {type.generation}
            </p>
            <h2 className="text-xl font-semibold text-gray-900">{type.name}</h2>
            <div className="mt-2 grid gap-1">
              <p className="text-gray-600">
                Double damage to: {type.doubleDamageTo.join(", ") || "None"}
              </p>
              <p className="text-gray-600">
                Half damage to: {type.halfDamageTo.join(", ") || "None"}
              </p>
              <p className="text-gray-600">
                No damage to: {type.noDamageTo.join(", ") || "None"}
              </p>
              <p className="text-gray-600">
                Double damage from: {type.doubleDamageFrom.join(", ") || "None"}
              </p>
              <p className="text-gray-600">
                Half damage from: {type.halfDamageFrom.join(", ") || "None"}
              </p>
              <p className="text-gray-600">
                No damage from: {type.noDamageFrom.join(", ") || "None"}
              </p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
