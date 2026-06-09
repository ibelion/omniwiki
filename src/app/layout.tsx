import type { Metadata } from "next";
import Link from "next/link";
import { Sora } from "next/font/google";
import "./globals.css";
import { CommandPalette } from "../components/CommandPalette";
import { CommandPaletteButton } from "../components/CommandPaletteButton";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "OmniWiki",
  description: "Multiverse wiki for Pokémon, League of Legends, Teamfight Tactics, and One Piece.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} bg-[#0c0c0e] text-[#F2E8D5] antialiased`}>
        <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: [
                "radial-gradient(ellipse 800px 700px at 0% 0%, rgba(76,175,114,0.05) 0%, transparent 70%)",
                "radial-gradient(ellipse 800px 700px at 100% 0%, rgba(74,184,200,0.05) 0%, transparent 70%)",
                "radial-gradient(ellipse 800px 700px at 100% 100%, rgba(136,146,240,0.05) 0%, transparent 70%)",
                "radial-gradient(ellipse 800px 700px at 0% 100%, rgba(212,147,58,0.05) 0%, transparent 70%)",
              ].join(", "),
            }}
          />
        </div>
        <header className="border-b border-[#1c1c22] bg-[#0c0c0e]">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 py-3">
            <Link href="/" className="flex items-center gap-3">
              <svg width="36" height="36" viewBox="0 0 80 80" fill="none" aria-hidden="true">
                <rect x="8" y="8" width="64" height="64" rx="6" transform="rotate(45 40 40)" fill="#B87D20"/>
                <circle cx="40" cy="40" r="21" stroke="#1A5228" strokeWidth="7" fill="none"/>
                <text x="40" y="47" textAnchor="middle" fontFamily="Sora, sans-serif" fontSize="18" fontWeight="800" fill="#0c0c0e">W</text>
              </svg>
              <div>
                <div className="text-[15px] font-extrabold tracking-tight text-[#F2E8D5] leading-none">OmniWiki</div>
                <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[.22em] text-[#6b6055]">Multiverse Reference</div>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <nav className="flex items-center gap-1 text-[13px] font-semibold">
                <Link href="/" className="rounded-lg px-3 py-2 text-[#F2E8D5] transition hover:bg-[#1c1c22]" aria-label="Home">
                  Home
                </Link>
                <Link href="/pokemon" className="rounded-lg px-3 py-2 text-[#6b6055] transition hover:bg-[#1c1c22] hover:text-[#F2E8D5]" aria-label="Pokemon universe">
                  Pokemon
                </Link>
                <Link href="/league" className="rounded-lg px-3 py-2 text-[#6b6055] transition hover:bg-[#1c1c22] hover:text-[#F2E8D5]" aria-label="League universe">
                  League
                </Link>
                <Link href="/tft" className="rounded-lg px-3 py-2 text-[#6b6055] transition hover:bg-[#1c1c22] hover:text-[#F2E8D5]" aria-label="TFT universe">
                  TFT
                </Link>
                <Link href="/onepiece" className="rounded-lg px-3 py-2 text-[#6b6055] transition hover:bg-[#1c1c22] hover:text-[#F2E8D5]" aria-label="One Piece universe">
                  One Piece
                </Link>
              </nav>
              <CommandPaletteButton />
            </div>
          </div>
        </header>
        {children}
        <CommandPalette />
      </body>
    </html>
  );
}
