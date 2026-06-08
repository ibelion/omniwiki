import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/BackLink";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { leagueData } from "@/lib/league/data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return leagueData.lore.filter((l) => l.slug && l.champion).map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = leagueData.lore.find((l) => l.slug === slug);
  if (!entry) return { title: "Lore · OmniWiki" };
  return {
    title: `${entry.champion} · Lore · OmniWiki`,
    description:
      entry.loreShort?.slice(0, 160) ??
      `${entry.champion} lore from League of Legends.`,
  };
}

export default async function LoreDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = leagueData.lore.find((l) => l.slug === slug);
  if (!entry) notFound();

  const champion = leagueData.champions.find((c) => c.slug === slug);
  const faction =
    entry.faction && entry.faction !== "unaffiliated"
      ? (leagueData.factions ?? []).find((f) => f.slug === entry.faction)
      : null;

  const sorted = [...leagueData.lore]
    .filter((l) => l.champion)
    .sort((a, b) => a.champion.localeCompare(b.champion));
  const idx = sorted.findIndex((l) => l.slug === slug);
  const previous = idx > 0 ? sorted[idx - 1] : null;
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/league/lore" label="Back to Lore" />

      <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="hover:text-emerald-700 hover:underline" href="/">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link className="hover:text-emerald-700 hover:underline" href="/league">
              League
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link className="hover:text-emerald-700 hover:underline" href="/league/lore">
              Lore
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-emerald-700">{entry.champion}</li>
        </ol>
      </nav>

      <section className="rounded-3xl border border-emerald-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <ImageWithFallback
            src={`/leaguecontent/${champion?.image ?? ""}`}
            alt={entry.champion}
            className="h-24 w-24 rounded-2xl border border-gray-100 object-cover"
          />

          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                Champion Lore
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                {entry.champion}
              </h1>
              {entry.title && (
                <p className="mt-1 text-base italic text-gray-500">{entry.title}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {faction && (
                <Link
                  href="/league/factions"
                  className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  {faction.name}
                </Link>
              )}
              {entry.releaseDate && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                  Released {entry.releaseDate}
                </span>
              )}
            </div>

            <Link
              href={`/league/${slug}`}
              className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              View Champion →
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900">Lore</h2>
        <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-gray-700">
          {entry.loreLong ?? entry.loreShort ?? "No lore available."}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {previous ? (
          <Link
            href={`/league/lore/${previous.slug}`}
            className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <p className="text-sm text-gray-500">Previous</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{previous.champion}</p>
          </Link>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-5 text-sm text-gray-400">
            Start of lore list
          </div>
        )}

        {next ? (
          <Link
            href={`/league/lore/${next.slug}`}
            className="rounded-3xl border border-gray-200 bg-white p-5 text-right shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <p className="text-sm text-gray-500">Next</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{next.champion}</p>
          </Link>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-5 text-right text-sm text-gray-400">
            End of lore list
          </div>
        )}
      </section>
    </main>
  );
}
