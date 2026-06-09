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
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/league/skin-lines" label="Back to Skin Lines" />

      <nav aria-label="Breadcrumb" className="text-sm text-[#6b6055]">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="hover:text-[#4caf72] hover:underline" href="/">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link className="hover:text-[#4caf72] hover:underline" href="/league">
              League
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link className="hover:text-[#4caf72] hover:underline" href="/league/skin-lines">
              Skin Lines
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-[#4caf72]">{skinLine.name}</li>
        </ol>
      </nav>

      <section className="overflow-hidden rounded-3xl border border-[#1c3622] bg-[#141418] shadow-sm">
        {featuredSplash && (
          <ImageWithFallback
            src={`/leaguecontent/${featuredSplash}`}
            alt={`${skinLine.name} splash`}
            className="h-56 w-full object-cover object-top"
          />
        )}
        <div className="p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#4caf72]">
            Skin Line
          </p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight text-[#F2E8D5]">
            {skinLine.name}
          </h1>
          <p className="mt-1 text-sm text-[#6b6055]">
            {skins.length} skin{skins.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-[#F2E8D5]">Skins</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skins.map((skin) => (
            <Link
              key={skin.skinId}
              href={`/league/skins/${skin.skinId}`}
              className="group overflow-hidden rounded-2xl border border-[#1c1c22] bg-[#0c0c0e] transition hover:border-[#2a4a30] hover:shadow-md"
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
                <p className="truncate font-semibold text-[#F2E8D5] text-sm">{skin.name}</p>
                <p className="truncate text-xs text-[#6b6055]">{skin.championName}</p>
                {skin.rarity && skin.rarity !== "NoRarity" && (
                  <span className="mt-1 inline-block rounded-full bg-[#0e1c14] px-2 py-0.5 text-xs font-medium text-[#4caf72]">
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
            className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-5 shadow-sm transition hover:border-[#2a4a30] hover:shadow-md"
          >
            <p className="text-sm text-[#6b6055]">Previous</p>
            <p className="mt-1 text-lg font-semibold text-[#F2E8D5]">{previous.name}</p>
          </Link>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#1c1c22] bg-[#141418] p-5 text-sm text-[#6b6055]">
            Start of skin lines
          </div>
        )}

        {next ? (
          <Link
            href={`/league/skin-lines/${next.id}`}
            className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-5 text-right shadow-sm transition hover:border-[#2a4a30] hover:shadow-md"
          >
            <p className="text-sm text-[#6b6055]">Next</p>
            <p className="mt-1 text-lg font-semibold text-[#F2E8D5]">{next.name}</p>
          </Link>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#1c1c22] bg-[#141418] p-5 text-right text-sm text-[#6b6055]">
            End of skin lines
          </div>
        )}
      </section>
    </main>
  );
}
