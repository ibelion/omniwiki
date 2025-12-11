"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

const OPEN_EVENT = "omniwiki:open-command-palette";

export type CommandPaletteEntry = {
  slug: string;
  name: string;
};

const normalize = (value: string) => value.toLowerCase().trim();

type CommandPaletteProps = {
  entries: CommandPaletteEntry[];
};

export function CommandPalette({ entries }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
    const normalized = normalize(query);
    if (!normalized) {
      return entries.slice(0, 12);
    }
    return entries
      .filter((entry) => normalize(entry.name).includes(normalized))
      .slice(0, 12);
  }, [entries, query]);

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
            placeholder="Search Pokemon (Ctrl/Cmd + K)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            aria-label="Search Pokemon"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto">
          {results.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-500">
              No Pokemon match &ldquo;{query}&rdquo;.
            </li>
          )}
          {results.map((entry) => (
            <li key={entry.slug}>
              <Link
                href={`/pokemon/${entry.slug}`}
                className="flex items-center justify-between px-4 py-3 text-sm text-gray-900 transition hover:bg-indigo-50"
                onClick={() => setIsOpen(false)}
              >
                <span>{entry.name}</span>
                <span className="text-xs uppercase tracking-wide text-gray-400">
                  Pokemon
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
