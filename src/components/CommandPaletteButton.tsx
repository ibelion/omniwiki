"use client";

import { triggerCommandPalette } from "./CommandPalette";

export function CommandPaletteButton() {
  return (
    <button
      type="button"
      onClick={() => triggerCommandPalette()}
      className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-indigo-200 hover:bg-indigo-50"
      aria-label="Open global search"
    >
      <span>Search</span>
      <span className="hidden text-xs text-gray-400 sm:inline-flex items-center gap-1">
        <kbd className="rounded border border-gray-300 px-1.5 py-0.5 text-[10px] uppercase">
          Ctrl
        </kbd>
        <span>+</span>
        <kbd className="rounded border border-gray-300 px-1.5 py-0.5 text-[10px] uppercase">
          K
        </kbd>
      </span>
    </button>
  );
}
