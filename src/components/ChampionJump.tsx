"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type ChampionStub = { slug: string; name: string };

export function ChampionJump({ champions }: { champions: ChampionStub[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const matches = query.trim()
    ? champions.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navigate = (slug: string) => {
    setQuery("");
    setOpen(false);
    router.push(`/league/${slug}`);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        placeholder="Jump to champion..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => query && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            setQuery("");
          }
          if (e.key === "Enter" && matches.length === 1) {
            navigate(matches[0].slug);
          }
        }}
        className="w-48 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        aria-label="Search champions"
        aria-expanded={open && matches.length > 0}
        aria-autocomplete="list"
        role="combobox"
      />
      {open && matches.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
        >
          {matches.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => navigate(c.slug)}
                className="w-full px-4 py-2 text-left text-sm text-gray-800 hover:bg-emerald-50 hover:text-emerald-700"
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
