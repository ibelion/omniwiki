"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface TypeRecord {
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
  types: TypeRecord[];
}

const MULTIPLIER_STYLES: Record<string, string> = {
  "2": "bg-rose-100 text-rose-700 font-bold",
  "0.5": "bg-emerald-100 text-emerald-700",
  "0": "bg-slate-100 text-slate-500",
  "1": "text-gray-300",
};

function multiplierLabel(v: number) {
  if (v === 2) return "2×";
  if (v === 0.5) return "½";
  if (v === 0) return "0";
  return "·";
}

function multiplierStyle(v: number) {
  if (v === 2) return MULTIPLIER_STYLES["2"];
  if (v === 0.5) return MULTIPLIER_STYLES["0.5"];
  if (v === 0) return MULTIPLIER_STYLES["0"];
  return MULTIPLIER_STYLES["1"];
}

// Build a defending-type weakness map from the attacker-centric data.
// Returns: defMap[defender][attacker] = multiplier
function buildDefenseMap(types: TypeRecord[]): Record<string, Record<string, number>> {
  const defMap: Record<string, Record<string, number>> = {};
  for (const t of types) {
    defMap[t.slug] = {};
  }
  for (const attacker of types) {
    for (const def of attacker.doubleDamageTo) {
      if (defMap[def]) defMap[def][attacker.slug] = 2;
    }
    for (const def of attacker.halfDamageTo) {
      if (defMap[def]) defMap[def][attacker.slug] = 0.5;
    }
    for (const def of attacker.noDamageTo) {
      if (defMap[def]) defMap[def][attacker.slug] = 0;
    }
  }
  return defMap;
}

const TYPE_COLORS: Record<string, string> = {
  normal: "bg-gray-200 text-gray-700",
  fire: "bg-orange-200 text-orange-800",
  water: "bg-blue-200 text-blue-800",
  electric: "bg-yellow-200 text-yellow-800",
  grass: "bg-green-200 text-green-800",
  ice: "bg-cyan-200 text-cyan-800",
  fighting: "bg-red-200 text-red-800",
  poison: "bg-purple-200 text-purple-800",
  ground: "bg-amber-200 text-amber-800",
  flying: "bg-sky-200 text-sky-800",
  psychic: "bg-pink-200 text-pink-800",
  bug: "bg-lime-200 text-lime-800",
  rock: "bg-stone-200 text-stone-700",
  ghost: "bg-violet-200 text-violet-800",
  dragon: "bg-indigo-200 text-indigo-800",
  dark: "bg-gray-700 text-gray-100",
  steel: "bg-slate-200 text-slate-700",
  fairy: "bg-fuchsia-200 text-fuchsia-800",
};

function TypeBadge({ name, small, href }: { name: string; small?: boolean; href?: string }) {
  const color = TYPE_COLORS[name.toLowerCase()] ?? "bg-gray-100 text-gray-700";
  const className = `inline-block rounded font-semibold capitalize ${color} ${small ? "px-1 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"}`;
  if (href) {
    return (
      <Link href={href} className={`${className} transition hover:opacity-80`}>
        {name}
      </Link>
    );
  }
  return <span className={className}>{name}</span>;
}

export function TypesSearchClient({ types }: TypesSearchClientProps) {
  const [view, setView] = useState<"chart" | "cards">("chart");
  const [search, setSearch] = useState("");

  const sortedTypes = useMemo(
    () => [...types].sort((a, b) => a.name.localeCompare(b.name)),
    [types]
  );

  const defMap = useMemo(() => buildDefenseMap(sortedTypes), [sortedTypes]);

  const filteredCards = useMemo(
    () =>
      sortedTypes.filter(
        (t) =>
          search === "" ||
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.generation.toLowerCase().includes(search.toLowerCase())
      ),
    [sortedTypes, search]
  );

  return (
    <>
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Types ({sortedTypes.length})
        </h1>
        <p className="text-gray-600">Type effectiveness — who hits who, and for how much.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setView("chart")}
              className={`px-4 py-2 text-sm font-semibold transition ${
                view === "chart"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Effectiveness chart
            </button>
            <button
              onClick={() => setView("cards")}
              className={`px-4 py-2 text-sm font-semibold transition ${
                view === "cards"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Type cards
            </button>
          </div>
          {view === "cards" && (
            <input
              type="text"
              placeholder="Search by type name or generation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          )}
        </div>
      </header>

      {view === "chart" ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm overflow-x-auto">
          <p className="mb-3 text-xs text-gray-500">
            Rows = <strong>attacking</strong> type · Columns = <strong>defending</strong> type
          </p>
          <div className="flex gap-1 mb-1 ml-[72px]">
            {sortedTypes.map((t) => (
              <div
                key={t.slug}
                className="w-7 flex-shrink-0 text-center"
                title={t.name}
              >
                <span
                  className={`inline-block w-6 rounded text-[9px] font-bold uppercase writing-mode-vertical py-0.5 text-center ${TYPE_COLORS[t.slug] ?? "bg-gray-100 text-gray-700"}`}
                  style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", height: "46px", lineHeight: "1.4" }}
                >
                  {t.name.slice(0, 5)}
                </span>
              </div>
            ))}
          </div>
          {sortedTypes.map((attacker) => (
            <div key={attacker.slug} className="flex items-center gap-1 mb-0.5">
              <div className="w-[68px] flex-shrink-0 text-right pr-1">
                <TypeBadge name={attacker.name} small href={`/pokemon/types/${attacker.slug}`} />
              </div>
              {sortedTypes.map((defender) => {
                // How much does attacker deal to defender?
                let mult = 1;
                if (attacker.doubleDamageTo.includes(defender.slug)) mult = 2;
                else if (attacker.halfDamageTo.includes(defender.slug)) mult = 0.5;
                else if (attacker.noDamageTo.includes(defender.slug)) mult = 0;
                return (
                  <div
                    key={defender.slug}
                    className={`w-7 h-7 flex-shrink-0 rounded text-center text-[11px] flex items-center justify-center ${multiplierStyle(mult)}`}
                    title={`${attacker.name} → ${defender.name}: ×${mult}`}
                  >
                    {multiplierLabel(mult)}
                  </div>
                );
              })}
            </div>
          ))}
          <div className="mt-4 flex gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="rounded bg-rose-100 px-1.5 py-0.5 font-bold text-rose-700">2×</span>
              Super effective
            </span>
            <span className="flex items-center gap-1.5">
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700">½</span>
              Not very effective
            </span>
            <span className="flex items-center gap-1.5">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-500">0</span>
              No effect
            </span>
          </div>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {filteredCards.map((type) => (
            <article
              key={type.slug}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm"
            >
              <p className="text-xs uppercase text-gray-500">{type.generation}</p>
              <div className="mb-3 mt-1">
                <TypeBadge name={type.name} href={`/pokemon/types/${type.slug}`} />
              </div>
              <div className="grid gap-2">
                {type.doubleDamageTo.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold text-rose-600">2× to</p>
                    <div className="flex flex-wrap gap-1">
                      {type.doubleDamageTo.map((t) => <TypeBadge key={t} name={t} small href={`/pokemon/types/${t}`} />)}
                    </div>
                  </div>
                )}
                {type.halfDamageTo.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold text-emerald-600">½× to</p>
                    <div className="flex flex-wrap gap-1">
                      {type.halfDamageTo.map((t) => <TypeBadge key={t} name={t} small href={`/pokemon/types/${t}`} />)}
                    </div>
                  </div>
                )}
                {type.noDamageTo.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold text-slate-500">0× to</p>
                    <div className="flex flex-wrap gap-1">
                      {type.noDamageTo.map((t) => <TypeBadge key={t} name={t} small href={`/pokemon/types/${t}`} />)}
                    </div>
                  </div>
                )}
                {type.doubleDamageFrom.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold text-rose-400">2× from</p>
                    <div className="flex flex-wrap gap-1">
                      {type.doubleDamageFrom.map((t) => <TypeBadge key={t} name={t} small href={`/pokemon/types/${t}`} />)}
                    </div>
                  </div>
                )}
                {type.halfDamageFrom.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold text-emerald-400">½× from</p>
                    <div className="flex flex-wrap gap-1">
                      {type.halfDamageFrom.map((t) => <TypeBadge key={t} name={t} small href={`/pokemon/types/${t}`} />)}
                    </div>
                  </div>
                )}
                {type.noDamageFrom.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold text-slate-400">0× from</p>
                    <div className="flex flex-wrap gap-1">
                      {type.noDamageFrom.map((t) => <TypeBadge key={t} name={t} small href={`/pokemon/types/${t}`} />)}
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
