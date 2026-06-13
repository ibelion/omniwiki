import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/BackLink";
import { onePieceData } from "@/lib/onepiece/data";
import type { OnePieceDevilFruitRecord } from "@/lib/onepiece/types";

type Params = { id: string };

const TYPE_COLORS: Record<string, string> = {
  Paramecia: "bg-[#1a1520] text-[#b890e0]",
  Zoan: "bg-[#0e1a10] text-[#56b870]",
  Logia: "bg-[#0e1520] text-[#4090d0]",
  Unknown: "bg-[#1c1c22] text-[#9a8c7e]",
};

const TYPE_DESCRIPTIONS: Record<string, string> = {
  Paramecia:
    "Paramecia-type fruits grant their users superhuman abilities that alter their body, environment, or other objects. The most common type of Devil Fruit.",
  Zoan:
    "Zoan-type fruits allow their users to transform into animals or animal-human hybrids, granting enhanced physical abilities.",
  Logia:
    "Logia-type fruits allow their users to embody and transform into a natural element or force of nature. The rarest type.",
  Unknown: "The classification of this Devil Fruit is not yet known.",
};

function getFruit(id: string): OnePieceDevilFruitRecord | undefined {
  return onePieceData.devilFruits.find((f) => f.id === id);
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return onePieceData.devilFruits.map((f) => ({ id: f.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const fruit = getFruit(id);
  if (!fruit) {
    return { title: "Devil Fruit Not Found | One Piece | OmniWiki" };
  }
  return {
    title: `${fruit.name} | Devil Fruits | One Piece | OmniWiki`,
    description: `${fruit.name}${fruit.englishName ? ` (${fruit.englishName})` : ""} — a ${fruit.type}-type Devil Fruit${fruit.userName ? ` used by ${fruit.userName}` : ""}.`,
  };
}

export default async function DevilFruitDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const fruit = getFruit(id);
  if (!fruit) notFound();

  const user = fruit.userId
    ? onePieceData.characters.find((c) => c.id === fruit.userId)
    : null;

  const sorted = [...onePieceData.devilFruits].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const idx = sorted.findIndex((f) => f.id === fruit.id);
  const prev = idx > 0 ? sorted[idx - 1] : null;
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  const typeColor = TYPE_COLORS[fruit.type] ?? TYPE_COLORS.Unknown;
  const typeDesc = TYPE_DESCRIPTIONS[fruit.type] ?? TYPE_DESCRIPTIONS.Unknown;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/onepiece/devil-fruits" label="Back to Devil Fruits" />

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
            <Link className="hover:text-[#d4933a] hover:underline" href="/onepiece/devil-fruits">
              Devil Fruits
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-[#d4933a]">{fruit.name}</li>
        </ol>
      </nav>

      <section className="rounded-3xl border border-[#3a2410] bg-[#141418] p-8 shadow-sm">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${typeColor}`}>
              {fruit.type}
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#F2E8D5]">{fruit.name}</h1>
          {fruit.englishName && (
            <p className="text-lg text-[#9a8c7e]">{fruit.englishName}</p>
          )}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6b6055]">Type</h2>
          <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${typeColor}`}>
            {fruit.type}
          </p>
          <p className="mt-3 text-sm leading-6 text-[#9a8c7e]">{typeDesc}</p>
        </section>

        <section className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6b6055]">Known User</h2>
          {user ? (
            <Link
              href={`/onepiece/characters/${user.id}`}
              className="mt-3 flex items-center gap-3 rounded-2xl border border-[#1c1c22] bg-[#0c0c0e] p-3 transition hover:border-[#4a3420]"
            >
              {user.image && (
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-[#F2E8D5]">{user.name}</p>
                <p className="text-xs text-[#6b6055]">{user.position ?? user.role}</p>
              </div>
            </Link>
          ) : (
            <p className="mt-3 text-sm text-[#6b6055]">
              {fruit.userName ?? "No known user on record."}
            </p>
          )}
        </section>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {prev ? (
          <Link
            href={`/onepiece/devil-fruits/${prev.id}`}
            className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-5 shadow-sm transition hover:border-[#4a3420] hover:shadow-md"
          >
            <p className="text-sm text-[#6b6055]">Previous</p>
            <p className="mt-1 text-lg font-semibold text-[#F2E8D5]">{prev.name}</p>
          </Link>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#1c1c22] bg-[#141418] p-5 text-sm text-[#6b6055]">
            First fruit
          </div>
        )}
        {next ? (
          <Link
            href={`/onepiece/devil-fruits/${next.id}`}
            className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-5 text-right shadow-sm transition hover:border-[#4a3420] hover:shadow-md"
          >
            <p className="text-sm text-[#6b6055]">Next</p>
            <p className="mt-1 text-lg font-semibold text-[#F2E8D5]">{next.name}</p>
          </Link>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#1c1c22] bg-[#141418] p-5 text-right text-sm text-[#6b6055]">
            Last fruit
          </div>
        )}
      </section>
    </main>
  );
}
