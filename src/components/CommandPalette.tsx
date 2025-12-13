"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PokemonRecord, MoveRecord, AbilityRecord } from "@/lib/pokemon/types";
import type { ChampionRecord } from "@/lib/league/types";

const OPEN_EVENT = "omniwiki:open-command-palette";

type CommandPaletteEntry = {
  slug: string;
  name: string;
  category: string;
  href: string;
};

const normalize = (value: string) => value.toLowerCase().trim();

export function CommandPalette() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<CommandPaletteEntry[]>([]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen(true);
        setQuery("");
      }
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleExternalOpen = () => {
      setIsOpen(true);
      setQuery("");
    };

    window.addEventListener("keydown", handleShortcut);
    window.addEventListener(OPEN_EVENT, handleExternalOpen);
    return () => {
      window.removeEventListener("keydown", handleShortcut);
      window.removeEventListener(OPEN_EVENT, handleExternalOpen);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const allEntries: CommandPaletteEntry[] = [];

        const pokemonRes = await fetch("/pokemoncontent/data/pokemon.json", {
          cache: "force-cache",
        });
        if (pokemonRes.ok) {
          const pokemon = (await pokemonRes.json()) as PokemonRecord[];
          allEntries.push(
            ...pokemon.map((p) => ({
              slug: p.slug,
              name: p.name,
              category: "Pokemon",
              href: `/pokemon/${p.slug}`,
            }))
          );
        }

        if (pathname?.startsWith("/league") || pathname === "/") {
          const leagueRes = await fetch(
            "/leaguecontent/data/champions.json",
            {
              cache: "force-cache",
            }
          );
          if (leagueRes.ok) {
            const champions = (await leagueRes.json()) as ChampionRecord[];
            allEntries.push(
              ...champions.map((c) => ({
                slug: c.slug,
                name: c.name,
                category: "Champion",
                href: `/league/${c.slug}`,
              }))
            );
          }
        }

        if (pathname?.startsWith("/moves") || pathname?.startsWith("/pokemon")) {
          const movesRes = await fetch("/pokemoncontent/data/moves.json", {
            cache: "force-cache",
          });
          if (movesRes.ok) {
            const moves = (await movesRes.json()) as MoveRecord[];
            allEntries.push(
              ...moves.map((m) => ({
                slug: m.slug,
                name: m.name,
                category: "Move",
                href: `/moves/${m.slug}`,
              }))
            );
          }
        }

        if (
          pathname?.startsWith("/abilities") ||
          pathname?.startsWith("/pokemon")
        ) {
          const abilitiesRes = await fetch(
            "/pokemoncontent/data/abilities.json",
            {
              cache: "force-cache",
            }
          );
          if (abilitiesRes.ok) {
            const abilities = (await abilitiesRes.json()) as AbilityRecord[];
            allEntries.push(
              ...abilities.map((a) => ({
                slug: a.slug,
                name: a.name,
                category: "Ability",
                href: `/abilities/${a.slug}`,
              }))
            );
          }
        }

        if (!cancelled) {
          setEntries(allEntries);
        }
      } catch {
        // ignore fetch errors in the palette UI
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) {
      return entries.slice(0, 12);
    }
    return entries
      .filter((entry) =>
        normalize(`${entry.name} ${entry.slug}`).includes(normalizedQuery)
      )
      .slice(0, 12);
  }, [entries, query]);

  const placeholder = useMemo(() => {
    if (pathname?.startsWith("/league")) {
      return "Search Champions (Ctrl/Cmd + K)";
    }
    if (pathname?.startsWith("/moves")) {
      return "Search Moves (Ctrl/Cmd + K)";
    }
    if (pathname?.startsWith("/abilities")) {
      return "Search Abilities (Ctrl/Cmd + K)";
    }
    return "Search (Ctrl/Cmd + K)";
  }, [pathname]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-20 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-100 px-4 py-3">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            aria-label="Command palette search"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto">
          {results.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-500">
              No results match &ldquo;{query}&rdquo;.
            </li>
          )}
          {results.map((entry) => (
            <li key={`${entry.category}-${entry.slug}`}>
              <Link
                href={entry.href}
                className="flex items-center justify-between px-4 py-3 text-sm text-gray-900 transition hover:bg-indigo-50"
                onClick={() => setIsOpen(false)}
              >
                <span>{entry.name}</span>
                <span className="text-xs uppercase tracking-wide text-gray-400">
                  {entry.category}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
          <p>Press Esc to close</p>
          <div className="flex items-center gap-2">
            <kbd className="rounded border border-gray-300 px-1.5 py-0.5 text-[11px]">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="rounded border border-gray-300 px-1.5 py-0.5 text-[11px]">
              K
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

export const triggerCommandPalette = () => {
  window.dispatchEvent(new Event(OPEN_EVENT));
};
