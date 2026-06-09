import Link from "next/link";

import { BackLink } from "@/components/BackLink";
import { onePieceData } from "@/lib/onepiece/data";

export default function OnePiecePage() {
  const totalCharacters = onePieceData.characters.length;
  const mainCharacters = onePieceData.characters.filter(
    (character) => character.role === "Main",
  ).length;
  const supportingCharacters = onePieceData.characters.filter(
    (character) => character.role === "Supporting",
  ).length;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/" label="Back to Home" />

      <nav aria-label="Breadcrumb" className="text-sm text-[#6b6055]">
        <ol className="flex items-center gap-2">
          <li>
            <Link className="hover:text-[#d4933a] hover:underline" href="/">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-[#d4933a]">One Piece</li>
        </ol>
      </nav>

      <section className="relative overflow-hidden rounded-3xl" style={{ minHeight: 260 }}>
        {/* diagonal stripe background */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #0e0806 0%, #1c1006 40%, #120a04 100%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #d4933a 0px, #d4933a 1px, transparent 1px, transparent 48px)",
          }}
        />
        <span
          className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 select-none font-black opacity-[0.05]"
          style={{ fontSize: "clamp(3rem, 16vw, 10rem)", color: "#d4933a", letterSpacing: "-0.04em" }}
        >
          GRAND LINE
        </span>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(14,8,2,0.88) 35%, transparent 80%), linear-gradient(to top, rgba(12,7,2,1) 0%, transparent 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative z-10 flex flex-col gap-3 p-8 pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[.24em] text-[#d4933a]">
            Grand Line Index
          </p>
          <h1
            className="text-4xl font-extrabold leading-[1.04] tracking-tight text-[#F2E8D5]"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
          >
            One Piece
          </h1>
          <p className="max-w-xl text-sm text-[#9a8c7e]">
            Browse {totalCharacters} tracked characters and explore the cast of the series.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#3a2410] bg-[#141418]/80 p-4">
              <p className="text-sm text-[#6b6055]">Total Characters</p>
              <p className="text-2xl font-semibold text-[#F2E8D5]">{totalCharacters}</p>
            </div>
            <div className="rounded-2xl border border-[#3a2410] bg-[#141418]/80 p-4">
              <p className="text-sm text-[#6b6055]">Main</p>
              <p className="text-2xl font-semibold text-[#d4933a]">{mainCharacters}</p>
            </div>
            <div className="rounded-2xl border border-[#3a2410] bg-[#141418]/80 p-4">
              <p className="text-sm text-[#6b6055]">Supporting</p>
              <p className="text-2xl font-semibold text-[#c4781a]">{supportingCharacters}</p>
            </div>
          </div>
        </div>
      </section>

      {totalCharacters === 0 ? (
        <section className="rounded-2xl border border-[#3a2410] bg-[#1c1208] p-4 text-sm text-[#9a8c7e]">
          No One Piece character data is available yet. Run
          <span className="mx-1 rounded bg-[#2c1c0c] px-1.5 py-0.5 font-mono text-xs text-[#d4933a]">
            npm run build:onepiece
          </span>
          and reload this page.
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Link
          className="group rounded-3xl border border-[#3a2410] bg-[#141418] p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#4a3420] hover:shadow-md"
          href="/onepiece/characters"
        >
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-[#1c1208] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#d4933a]">
              Live
            </div>
            <h2 className="text-2xl font-semibold text-[#F2E8D5] group-hover:text-[#d4933a]">
              Characters
            </h2>
            <p className="text-sm text-[#6b6055]">
              Search the current roster and open detailed profiles for each
              character.
            </p>
          </div>
        </Link>

        <div className="rounded-3xl border border-dashed border-[#2c2c32] bg-[#141418]/70 p-6 opacity-75">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-[#1c1c22] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#6b6055]">
              Coming Soon
            </div>
            <h2 className="text-2xl font-semibold text-[#d9cebe]">
              Devil Fruits
            </h2>
            <p className="text-sm text-[#6b6055]">
              Future pages will catalog fruit powers, users, and classifications.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-dashed border-[#2c2c32] bg-[#141418]/70 p-6 opacity-75">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-[#1c1c22] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#6b6055]">
              Coming Soon
            </div>
            <h2 className="text-2xl font-semibold text-[#d9cebe]">Crews</h2>
            <p className="text-sm text-[#6b6055]">
              Crew and faction overview pages will be added once their data is
              available.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
