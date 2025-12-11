import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CommandPalette, CommandPaletteEntry } from "../components/CommandPalette";
import { CommandPaletteButton } from "../components/CommandPaletteButton";
import { pokemonData } from "../lib/pokemon/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmniWiki",
  description: "Multiverse wiki for Pokémon now, League and more next",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const paletteEntries: CommandPaletteEntry[] =
    pokemonData.indexes?.nameIndex ??
    pokemonData.pokemon.map((p) => ({ slug: p.slug, name: p.name }));

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 text-gray-900 antialiased`}
      >
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-indigo-600 px-3 py-1 text-sm font-semibold text-white">
                OmniWiki
              </span>
              <div className="text-sm text-gray-600">
                <p className="font-semibold text-gray-900">
                  Pokémon & League live now
                </p>
                <p className="text-xs text-gray-500">
                  One Piece data pipeline is up next
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <nav className="flex items-center gap-2 text-sm font-semibold">
                <a
                  href="/"
                  className="rounded-lg px-3 py-2 text-gray-900 transition hover:bg-gray-100"
                  aria-label="Home"
                >
                  Home
                </a>
                <a
                  href="/pokemon"
                  className="rounded-lg px-3 py-2 text-indigo-700 transition hover:bg-indigo-50"
                  aria-label="Pokémon universe"
                >
                  Pokémon
                </a>
                <a
                  href="/league"
                  className="rounded-lg px-3 py-2 text-emerald-700 transition hover:bg-emerald-50"
                  aria-label="League universe"
                >
                  League
                </a>
                <a
                  href="#"
                  className="rounded-lg px-3 py-2 text-gray-400 transition hover:bg-gray-100"
                  aria-label="One Piece universe (coming soon)"
                >
                  One Piece (soon)
                </a>
              </nav>
              <CommandPaletteButton />
            </div>
          </div>
        </header>
        {children}
        <CommandPalette entries={paletteEntries} />
      </body>
    </html>
  );
}
