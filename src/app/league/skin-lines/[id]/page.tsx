import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/BackLink";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { leagueData } from "@/lib/league/data";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return (leagueData.skinLines ?? [])
    .filter((sl) => (sl.skinCount ?? sl.skinIds?.length ?? 0) > 0)
    .map((sl) => ({ id: String(sl.id) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const skinLine = (leagueData.skinLines ?? []).find((sl) => sl.id === Number(id));
  if (!skinLine) return { title: "Skin Line · OmniWiki" };
  const count = skinLine.skinCount ?? skinLine.skinIds?.length ?? 0;
  return {
    title: `${skinLine.name} · Skin Line · OmniWiki`,
    description: `${skinLine.name} — a League of Legends skin line with ${count} skin${count !== 1 ? "s" : ""}.`,
  };
}

export default async function SkinLineDetailPage({ params }: PageProps) {
  const { id } = await params;
  const skinLine = (leagueData.skinLines ?? []).find((sl) => sl.id === Number(id));
  if (!skinLine) notFound();

  const skinIds = new Set(skinLine.skinIds ?? []);
  const skins = leagueData.skins
    .filter((s) => skinIds.has(s.skinId))
    .sort((a, b) => a.name.localeCompare(b.name));

  const featuredSplash = skins.find((s) => s.splash)?.splash ?? null;

  // prev/next: sort all skin lines alphabetically that have skins
  const allLines = [...(leagueData.skinLines ?? [])]
    .filter((sl) => (sl.skinCount ?? sl.skinIds?.length ?? 0) > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
  const idx = allLines.findIndex((sl) => sl.id === Number(id));
  const previous = idx > 0 ? allLines[idx - 1] : null;
  const next = idx < allLines.length - 1 ? allLines[idx + 1] : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/league/skin-lines" label="Back to Skin Lines" />

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
            <Link className="hover:text-emerald-700 hover:underline" href="/league/skin-lines">
              Skin Lines
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-emerald-700">{skinLine.name}</li>
        </ol>
      </nav>

      <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">
        {featuredSplash && (
          <ImageWithFallback
            src={`/leaguecontent/${featuredSplash}`}
            alt={`${skinLine.name} splash`}
            className="h-56 w-full object-cover object-top"
          />
        )}
        <div className="p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Skin Line
          </p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight text-gray-900">
            {skinLine.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {skins.length} skin{skins.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900">Skins</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skins.map((skin) => (
            <Link
              key={skin.skinId}
              href={`/league/skins/${skin.skinId}`}
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 transition hover:border-emerald-300 hover:shadow-md"
            >
              {skin.tile ? (
                <ImageWithFallback
                  src={`/leaguecontent/${skin.tile}`}
                  alt={skin.name}
                  className="h-32 w-full object-cover transition group-hover:scale-[1.02]"
                />
              ) : (
                <div className="h-32 w-full bg-gradient-to-br from-gray-100 to-gray-200" />
              )}
              <div className="p-3">
                <p className="truncate font-semibold text-gray-900 text-sm">{skin.name}</p>
                <p className="truncate text-xs text-gray-500">{skin.championName}</p>
                {skin.rarity && skin.rarity !== "NoRarity" && (
                  <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {skin.rarity}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {previous ? (
          <Link
            href={`/league/skin-lines/${previous.id}`}
            className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <p className="text-sm text-gray-500">Previous</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{previous.name}</p>
          </Link>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-5 text-sm text-gray-400">
            Start of skin lines
          </div>
        )}

        {next ? (
          <Link
            href={`/league/skin-lines/${next.id}`}
            className="rounded-3xl border border-gray-200 bg-white p-5 text-right shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <p className="text-sm text-gray-500">Next</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{next.name}</p>
          </Link>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-5 text-right text-sm text-gray-400">
            End of skin lines
          </div>
        )}
      </section>
    </main>
  );
}
