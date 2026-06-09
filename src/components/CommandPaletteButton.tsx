"use client";

import { triggerCommandPalette } from "./CommandPalette";

export function CommandPaletteButton() {
  return (
    <button
      type="button"
      onClick={() => triggerCommandPalette()}
      className="flex items-center gap-2 rounded-lg border border-[#1c1c22] px-3 py-2 text-sm font-semibold text-[#9a8c7e] transition hover:border-[#22224a] hover:bg-[#12122a]"
      aria-label="Open global search"
    >
      <span>Search</span>
      <span className="hidden text-xs text-[#6b6055] sm:inline-flex items-center gap-1">
        <kbd className="rounded border border-[#2c2c32] px-1.5 py-0.5 text-[10px] uppercase">
          Ctrl
        </kbd>
        <span>+</span>
        <kbd className="rounded border border-[#2c2c32] px-1.5 py-0.5 text-[10px] uppercase">
          K
        </kbd>
      </span>
    </button>
  );
}
