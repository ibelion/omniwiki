import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/BackLink";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { onePieceData } from "@/lib/onepiece/data";
import type { OnePieceCrewRecord } from "@/lib/onepiece/types";

type Params = { id: string };

function getCrew(id: string): OnePieceCrewRecord | undefined {
  return onePieceData.crews.find((c) => c.id === id);
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return onePieceData.crews.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const crew = getCrew(id);
  if (!crew) return { title: "Crew Not Found | One Piece | OmniWiki" };
  return {
    title: `${crew.name} | Crews | One Piece | OmniWiki`,
    description: `${crew.name} — a crew with ${crew.memberIds.length} members in One Piece.`,
  };
}

export default async function CrewDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const crew = getCrew(id);
  if (!crew) notFound();

  const members = crew.memberIds
    .map((memberId) => onePieceData.characters.find((c) => c.id === memberId))
    .filter(Boolean);

  const sorted = [...onePieceData.crews].sort((a, b) =>
    b.memberIds.length - a.memberIds.length || a.name.localeCompare(b.name),
  );
  const idx = sorted.findIndex((c) => c.id === crew.id);
  const prev = idx > 0 ? sorted[idx - 1] : null;
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/onepiece/crews" label="Back to Crews" />

      <nav aria-label="Breadcrumb" className="text-sm text-[#6b6055]">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="hover:text-[#d4933a] hover:underline" href="/">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link className="hover:text-[#d4933a] hover:underline" href="/onepiece">One Piece</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link className="hover:text-[#d4933a] hover:underline" href="/onepiece/crews">Crews</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-[#d4933a]">{crew.name}</li>
        </ol>
      </nav>

      <section className="rounded-3xl border border-[#3a2410] bg-[#141418] p-8 shadow-sm">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d4933a]">
            Crew
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[#F2E8D5]">{crew.name}</h1>
          <p className="text-sm text-[#6b6055]">
            {crew.memberIds.length} recorded member{crew.memberIds.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6b6055]">Members</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => {
            if (!member) return null;
            return (
              <Link
                key={member.id}
                href={`/onepiece/characters/${member.id}`}
                className="flex items-center gap-3 rounded-2xl border border-[#1c1c22] bg-[#0c0c0e] p-3 transition hover:border-[#4a3420] hover:shadow-md"
              >
                {member.image ? (
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1c1c22] text-base font-bold text-[#6b6055]">
                    {member.name[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#F2E8D5]">{member.name}</p>
                  <p className="text-xs text-[#6b6055]">{member.position ?? member.role}</p>
                </div>
              </Link>
            );
          })}
        </div>
        {crew.memberIds.length !== members.length && (
          <p className="mt-3 text-xs text-[#6b6055]">
            Some members exist in the crew roster but may not have full character profiles yet.
          </p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {prev ? (
          <Link
            href={`/onepiece/crews/${prev.id}`}
            className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-5 shadow-sm transition hover:border-[#4a3420] hover:shadow-md"
          >
            <p className="text-sm text-[#6b6055]">Previous</p>
            <p className="mt-1 text-lg font-semibold text-[#F2E8D5]">{prev.name}</p>
          </Link>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#1c1c22] bg-[#141418] p-5 text-sm text-[#6b6055]">
            Largest crew
          </div>
        )}
        {next ? (
          <Link
            href={`/onepiece/crews/${next.id}`}
            className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-5 text-right shadow-sm transition hover:border-[#4a3420] hover:shadow-md"
          >
            <p className="text-sm text-[#6b6055]">Next</p>
            <p className="mt-1 text-lg font-semibold text-[#F2E8D5]">{next.name}</p>
          </Link>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#1c1c22] bg-[#141418] p-5 text-right text-sm text-[#6b6055]">
            Smallest crew
          </div>
        )}
      </section>
    </main>
  );
}
