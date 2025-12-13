"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
        return "/pokemon";
      }
      if (labelLower.includes("move")) return "/moves";
      if (labelLower.includes("abilit")) return "/abilities";
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
                  ? `${universe.accent.border} border-2 bg-gray-50 shadow-md`
                  : "border border-gray-200 bg-white shadow-sm hover:border-gray-300"
              } rounded-2xl p-5`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Universe
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    universe.status === "Ready"
                      ? universe.accent.chip
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {universe.status}
                </span>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-gray-900">
                {universe.name}
              </h2>
              <p className="text-sm text-gray-600">{universe.highlight}</p>
            </button>
          );
        })}
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p
              className={`text-sm font-semibold uppercase tracking-wide ${activeUniverse.accent.text}`}
            >
              {activeUniverse.name}
            </p>
            <h3 className="text-3xl font-semibold text-gray-900">
              {activeUniverse.status === "Ready"
                ? `${activeUniverse.name} is live`
                : `${activeUniverse.name} coming soon`}
            </h3>
            <p className="text-gray-600">{activeUniverse.description}</p>
          </div>
          {activeUniverse.heroImage && (
            <Image
              src={activeUniverse.heroImage}
              alt={activeUniverse.heroAlt || activeUniverse.name}
              width={128}
              height={128}
              className="rounded-2xl border border-gray-100 object-cover"
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
                className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center transition hover:border-indigo-200 hover:bg-indigo-50"
              >
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">
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
                className={`rounded-xl border ${activeUniverse.accent.border} bg-gray-50 p-4 text-sm font-semibold text-gray-900 transition ${activeUniverse.accent.hover}`}
              >
                {link.label}
              </Link>
            ) : (
              <span
                key={link.label}
                className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm font-semibold text-gray-500"
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
