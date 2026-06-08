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
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/" label="Back to Home" />

      <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
        <ol className="flex items-center gap-2">
          <li>
            <Link className="hover:text-orange-700 hover:underline" href="/">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-orange-700">One Piece</li>
        </ol>
      </nav>

      <section className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-100 via-white to-red-100 p-8 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
              Grand Line Index
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              One Piece
            </h1>
            <p className="max-w-2xl text-base text-gray-700">
              Browse {totalCharacters} tracked characters and explore the cast
              of the series.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-orange-200 bg-white/80 p-4">
              <p className="text-sm text-gray-500">Total Characters</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalCharacters}
              </p>
            </div>
            <div className="rounded-2xl border border-orange-200 bg-white/80 p-4">
              <p className="text-sm text-gray-500">Main</p>
              <p className="text-2xl font-semibold text-orange-700">
                {mainCharacters}
              </p>
            </div>
            <div className="rounded-2xl border border-orange-200 bg-white/80 p-4">
              <p className="text-sm text-gray-500">Supporting</p>
              <p className="text-2xl font-semibold text-red-700">
                {supportingCharacters}
              </p>
            </div>
          </div>
        </div>
      </section>

      {totalCharacters === 0 ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No One Piece character data is available yet. Run
          <span className="mx-1 rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">
            npm run build:onepiece
          </span>
          and reload this page.
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Link
          className="group rounded-3xl border border-orange-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
          href="/onepiece/characters"
        >
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
              Live
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-orange-700">
              Characters
            </h2>
            <p className="text-sm text-gray-600">
              Search the current roster and open detailed profiles for each
              character.
            </p>
          </div>
        </Link>

        <div className="rounded-3xl border border-dashed border-gray-300 bg-white/70 p-6 opacity-75">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
              Coming Soon
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Devil Fruits
            </h2>
            <p className="text-sm text-gray-600">
              Future pages will catalog fruit powers, users, and classifications.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-dashed border-gray-300 bg-white/70 p-6 opacity-75">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
              Coming Soon
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Crews</h2>
            <p className="text-sm text-gray-600">
              Crew and faction overview pages will be added once their data is
              available.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
