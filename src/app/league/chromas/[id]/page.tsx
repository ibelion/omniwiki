import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/BackLink";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { leagueData } from "@/lib/league/data";

type PageProps = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return leagueData.chromas.map((c) => ({ id: String(c.chromaId) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const chroma = leagueData.chromas.find((c) => String(c.chromaId) === id);
  if (!chroma) return { title: "Chroma · OmniWiki" };
  return {
    title: `${chroma.name} · Chroma · OmniWiki`,
    description: `${chroma.name} is a chroma for ${chroma.skinName} (${chroma.champion}) in League of Legends.`,
  };
}

export default async function ChromaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const chroma = leagueData.chromas.find((c) => String(c.chromaId) === id);
  if (!chroma) notFound();

  const champion = leagueData.champions.find(
    (c) => c.name.toLowerCase() === chroma.champion.toLowerCase()
  );

  const skinChromas = leagueData.chromas
    .filter((c) => c.skinId === chroma.skinId && c.chromaId !== chroma.chromaId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const imgSrc = chroma.sourceUrl ?? (chroma.image ? `/leaguecontent/${chroma.image}` : null);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/league/chromas" label="Back to Chromas" />

      <nav aria-label="Breadcrumb" className="text-sm text-[#6b6055]">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-[#4caf72]">Home</Link></li>
          <li>/</li>
          <li><Link href="/league" className="hover:text-[#4caf72]">League</Link></li>
          <li>/</li>
          <li><Link href="/league/chromas" className="hover:text-[#4caf72]">Chromas</Link></li>
          <li>/</li>
          <li className="text-[#F2E8D5]">{chroma.name}</li>
        </ol>
      </nav>

      <section className="rounded-3xl border border-[#1c3622] bg-[#141418] p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {imgSrc && (
            <ImageWithFallback
              src={imgSrc}
              alt={chroma.name}
              className="h-36 w-36 flex-shrink-0 rounded-2xl border border-[#1c1c22] object-cover"
            />
          )}
          <div className="flex-1 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#4caf72]">Chroma</p>
            <h1 className="text-3xl font-bold text-[#F2E8D5]">{chroma.name}</h1>
            <p className="text-[#6b6055]">
              Skin:{" "}
              <span className="text-[#9a8c7e]">{chroma.skinName}</span>
            </p>
            <p className="text-[#6b6055]">
              Champion:{" "}
              {champion ? (
                <Link
                  href={`/league/${champion.slug}`}
                  className="text-[#4caf72] hover:underline"
                >
                  {chroma.champion}
                </Link>
              ) : (
                <span className="text-[#9a8c7e]">{chroma.champion}</span>
              )}
            </p>
            {chroma.colors.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-[#6b6055]">Colors:</span>
                {chroma.colors.map((hex, i) => (
                  <span
                    key={i}
                    title={hex}
                    className="inline-flex h-5 w-5 rounded-full border border-black/10 shadow-sm"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {skinChromas.length > 0 && (
        <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-5 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-[#F2E8D5]">
            Other chromas for {chroma.skinName}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {skinChromas.map((sc) => {
              const scImg = sc.sourceUrl ?? (sc.image ? `/leaguecontent/${sc.image}` : null);
              return (
                <Link
                  key={sc.chromaId}
                  href={`/league/chromas/${sc.chromaId}`}
                  className="flex items-center gap-3 rounded-xl border border-[#1c1c22] bg-[#0c0c0e] p-3 transition hover:border-[#1c3622] hover:bg-[#0e1c14]"
                >
                  {scImg && (
                    <ImageWithFallback
                      src={scImg}
                      alt={sc.name}
                      className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#F2E8D5]">{sc.name}</p>
                    {sc.colors.length > 0 && (
                      <div className="mt-1 flex gap-1">
                        {sc.colors.map((hex, i) => (
                          <span
                            key={i}
                            className="inline-block h-3 w-3 rounded-full border border-black/10"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
