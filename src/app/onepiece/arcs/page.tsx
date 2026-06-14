import type { Metadata } from "next";
import Link from "next/link";

import { BackLink } from "@/components/BackLink";
import { ONEPIECE_SAGAS } from "@/lib/onepiece/arcs";

export const metadata: Metadata = {
  title: "Arcs & Sagas | One Piece | OmniWiki",
  description:
    "A complete timeline of every One Piece saga and arc, from East Blue to the Final Saga.",
};

export default function OnePieceArcsPage() {
  const totalArcs = ONEPIECE_SAGAS.reduce((n, s) => n + s.arcs.length, 0);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/onepiece" label="Back to One Piece" />

      <nav aria-label="Breadcrumb" className="text-sm text-[#6b6055]">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="hover:text-[#d4933a] hover:underline" href="/">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link className="hover:text-[#d4933a] hover:underline" href="/onepiece">
              One Piece
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-[#d4933a]">Arcs &amp; Sagas</li>
        </ol>
      </nav>

      <section className="rounded-3xl border border-[#3a2410] bg-[#141418] p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d4933a]">
            Story Timeline
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#F2E8D5]">
            Arcs &amp; Sagas
          </h1>
          <p className="text-sm text-[#6b6055]">
            {ONEPIECE_SAGAS.length} sagas &middot; {totalArcs} arcs from East Blue to the Final Saga.
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-8">
        {ONEPIECE_SAGAS.map((saga, sagaIdx) => (
          <section key={saga.id}>
            <div className="mb-3 flex items-center gap-3">
              <span className="shrink-0 rounded-full border border-[#3a2410] bg-[#1c1208] px-3 py-1 text-xs font-semibold text-[#d4933a]">
                Saga {sagaIdx + 1}
              </span>
              <h2 className="text-lg font-bold text-[#F2E8D5]">{saga.name}</h2>
              <span className="text-xs text-[#6b6055]">
                {saga.arcs.length} arc{saga.arcs.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="relative ml-4 border-l border-[#2c2010] pl-6">
              <div className="flex flex-col gap-4">
                {saga.arcs.map((arc, arcIdx) => (
                  <div
                    key={arc.id}
                    className="relative rounded-2xl border border-[#1c1c22] bg-[#141418] p-5 shadow-sm"
                  >
                    <div
                      className="absolute -left-[27px] top-5 h-3 w-3 rounded-full border-2 border-[#d4933a] bg-[#0c0c0e]"
                      aria-hidden="true"
                    />
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#6b6055]">
                            Arc {arcIdx + 1}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-[#F2E8D5]">
                          {arc.name}
                        </h3>
                      </div>
                      {(arc.chapters ?? arc.episodes) && (
                        <div className="flex flex-wrap gap-2 text-right">
                          {arc.chapters && (
                            <span className="rounded-full bg-[#1c1c22] px-2.5 py-1 text-xs text-[#9a8c7e]">
                              {arc.chapters}
                            </span>
                          )}
                          {arc.episodes && (
                            <span className="rounded-full bg-[#1c1208] px-2.5 py-1 text-xs text-[#c47830]">
                              {arc.episodes}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#6b6055]">
                      {arc.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
