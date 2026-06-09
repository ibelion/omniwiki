"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ImageWithFallback } from "./ImageWithFallback";

export type UniverseId = "pokemon" | "league" | "onepiece" | string;

export type UniverseDescriptor = {
  id: UniverseId;
  name: string;
  status: "Ready" | "Soon";
  highlight: string;
  description: string;
  stats: { label: string; value: number | string }[];
  quickLinks: { label: string; href?: string; comingSoon?: boolean }[];
  heroImage?: string | null;
  heroAlt?: string;
  accent: {
    chip: string;
    text: string;
    border: string;
    hover: string;
    bg: string;
  };
};

type UniverseShowcaseProps = {
  universes: UniverseDescriptor[];
};

export function UniverseShowcase({ universes }: UniverseShowcaseProps) {
  const [selectedId, setSelectedId] = useState(universes[0]?.id ?? "");

  const activeUniverse = useMemo(() => {
    if (universes.length === 0) return null;
    return (
      universes.find((universe) => universe.id === selectedId) ?? universes[0]
    );
  }, [universes, selectedId]);

  if (!activeUniverse) return null;

  const getStatHref = (label: string) => {
    const labelLower = label.toLowerCase();
    if (activeUniverse.id === "pokemon") {
      if (labelLower.includes("pokémon") || labelLower.includes("pokemon")) {
        return "/pokemon/pokedex";
      }
      if (labelLower.includes("move")) return "/pokemon/moves";
      if (labelLower.includes("abilit")) return "/pokemon/abilities";
      if (labelLower.includes("item")) return "/pokemon/items";
    }
    if (activeUniverse.id === "league") {
      if (labelLower.includes("champion")) return "/league";
      if (labelLower.includes("item")) return "/league/items";
    }
    return "#";
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {universes.map((universe) => {
          const isSelected = universe.id === activeUniverse.id;
          return (
            <button
              key={universe.id}
              type="button"
              onClick={() => setSelectedId(universe.id)}
              className={`text-left transition ${
                isSelected
                  ? `border-2 ${universe.accent.border} ${universe.accent.bg}`
                  : "border border-[#1c1c22] bg-[#141418] hover:border-[#2c2c32]"
              } rounded-2xl p-5`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b6055]">
                  Universe
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    universe.status === "Ready"
                      ? universe.accent.chip
                      : "bg-[#1c1c22] text-[#6b6055]"
                  }`}
                >
                  {universe.status}
                </span>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-[#F2E8D5]">
                {universe.name}
              </h2>
              <p className="text-sm text-[#6b6055]">{universe.highlight}</p>
            </button>
          );
        })}
      </div>

      <section className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-wide ${activeUniverse.accent.text}`}>
              {activeUniverse.name}
            </p>
            <h3 className="text-3xl font-extrabold tracking-tight text-[#F2E8D5]">
              {activeUniverse.status === "Ready"
                ? `${activeUniverse.name} is live`
                : `${activeUniverse.name} coming soon`}
            </h3>
            <p className="text-[#6b6055]">{activeUniverse.description}</p>
          </div>
          {activeUniverse.heroImage && (
            <ImageWithFallback
              src={activeUniverse.heroImage}
              alt={activeUniverse.heroAlt || activeUniverse.name}
              className="h-32 w-32 flex-shrink-0 rounded-2xl border border-[#1c1c22]"
            />
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {activeUniverse.stats.map((stat) => {
            const href = getStatHref(stat.label);
            return (
              <Link
                key={stat.label}
                href={href}
                className={`rounded-2xl border border-[#252528] bg-[#1c1c22] p-4 text-center transition hover:border-[#353538] hover:bg-[#252528]`}
              >
                <p className="text-sm text-[#6b6055]">{stat.label}</p>
                <p className="text-2xl font-extrabold text-[#F2E8D5]">
                  {typeof stat.value === "number"
                    ? stat.value.toLocaleString()
                    : stat.value}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {activeUniverse.quickLinks.map((link) =>
            link.href ? (
              <Link
                key={link.label}
                href={link.href}
                className={`rounded-xl border ${activeUniverse.accent.border} bg-[#1c1c22] p-4 text-sm font-semibold text-[#F2E8D5] transition ${activeUniverse.accent.hover}`}
              >
                {link.label}
              </Link>
            ) : (
              <span
                key={link.label}
                className="rounded-xl border border-dashed border-[#2c2c32] bg-[#141418] p-4 text-sm font-semibold text-[#6b6055]"
              >
                {link.label} {link.comingSoon ? "(soon)" : ""}
              </span>
            )
          )}
        </div>
      </section>
    </>
  );
}
