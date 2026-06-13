import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/BackLink";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { tftData } from "@/lib/tft/data";
import { stripTFTTokens } from "@/lib/tft/utils";

type TFTAugmentRecord = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  tier: number | null;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamicParams = false;

const TIER_LABELS: Record<number, string> = {
  1: "Silver",
  2: "Gold",
  3: "Prismatic",
};

const TIER_STYLES: Record<number, string> = {
  1: "bg-[#1c1c22] text-[#9a8c7e]",
  2: "bg-yellow-100 text-yellow-700",
  3: "bg-purple-100 text-purple-700",
};

export async function generateStaticParams() {
  return (tftData.augments ?? []).map((a) => ({ id: a.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const augment = ((tftData.augments ?? []) as TFTAugmentRecord[]).find(
    (item) => item.id === id
  );

  if (!augment) {
    return {
      title: "TFT Augment - OmniWiki",
    };
  }

  const tierLabel = augment.tier ? TIER_LABELS[augment.tier] : null;
  const description = stripTFTTokens(
    `${augment.name}${tierLabel ? ` is a ${tierLabel} TFT augment.` : " is a TFT augment."} ${augment.description}`
  ).slice(0, 155);

  return {
    title: `${augment.name} - TFT - OmniWiki`,
    description,
  };
}

export default async function AugmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const augments = (tftData.augments ?? []) as TFTAugmentRecord[];
  const augment = augments.find((item) => item.id === id);

  if (!augment) {
    notFound();
  }

  const tierLabel = augment.tier ? TIER_LABELS[augment.tier] : null;
  const tierStyle = augment.tier ? TIER_STYLES[augment.tier] : null;

  const relatedAugments =
    augment.tier == null
      ? []
      : augments
          .filter((item) => item.id !== augment.id && item.tier === augment.tier)
          .sort((a, b) => a.name.localeCompare(b.name));

  const sortedAugments = [...augments].sort((a, b) => {
    const tierA = a.tier ?? Number.MAX_SAFE_INTEGER;
    const tierB = b.tier ?? Number.MAX_SAFE_INTEGER;

    if (tierA !== tierB) {
      return tierA - tierB;
    }

    return a.name.localeCompare(b.name);
  });

  const currentIndex = sortedAugments.findIndex((item) => item.id === augment.id);
  const previousAugment = currentIndex > 0 ? sortedAugments[currentIndex - 1] : null;
  const nextAugment =
    currentIndex >= 0 && currentIndex < sortedAugments.length - 1
      ? sortedAugments[currentIndex + 1]
      : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/tft/augments" label="Back to Augments" />

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-[#6b6055]">
        <Link href="/" className="text-[#4ab8c8] transition hover:text-[#4ab8c8]">
          Home
        </Link>
        <span>/</span>
        <Link href="/tft" className="text-[#4ab8c8] transition hover:text-[#4ab8c8]">
          TFT
        </Link>
        <span>/</span>
        <Link href="/tft/augments" className="text-[#4ab8c8] transition hover:text-[#4ab8c8]">
          Augments
        </Link>
        <span>/</span>
        <span className="text-[#9a8c7e]">{augment.name}</span>
      </nav>

      <section className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <div className="flex flex-row items-start gap-4">
          <ImageWithFallback
            src={augment.image ?? ""}
            alt={augment.name}
            className="h-20 w-20 rounded-2xl"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-[#F2E8D5]">{augment.name}</h1>
              {tierLabel && tierStyle ? (
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${tierStyle}`}>
                  {tierLabel}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className="mt-4 text-sm text-[#6b6055]"
          dangerouslySetInnerHTML={{ __html: stripTFTTokens(augment.description) }}
        />
      </section>

      {tierLabel && relatedAugments.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#F2E8D5]">
            Other {tierLabel} Augments ({relatedAugments.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedAugments.map((item) => (
              <Link
                key={item.id}
                href={`/tft/augments/${item.id}`}
                className="flex items-center gap-3 rounded-2xl border border-[#1c1c22] bg-[#141418] p-4 shadow-sm transition hover:border-[#1a3038]"
              >
                <ImageWithFallback
                  src={item.image ?? ""}
                  alt={item.name}
                  className="h-10 w-10 rounded-lg"
                />
                <span className="text-sm font-medium text-[#F2E8D5]">{item.name}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        {previousAugment ? (
          <Link
            href={`/tft/augments/${previousAugment.id}`}
            className="text-sm font-medium text-[#4ab8c8] transition hover:text-[#4ab8c8]"
          >
            ← {previousAugment.name}
          </Link>
        ) : (
          <span />
        )}

        {nextAugment ? (
          <Link
            href={`/tft/augments/${nextAugment.id}`}
            className="text-right text-sm font-medium text-[#4ab8c8] transition hover:text-[#4ab8c8]"
          >
            {nextAugment.name} →
          </Link>
        ) : (
          <span />
        )}
      </div>

      <BackLink href="/tft/augments" label="Back to Augments" />
    </main>
  );
}
