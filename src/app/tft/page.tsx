import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { tftData } from "@/lib/tft/data";

export default function TFTPage() {
  const sampleChampion = tftData.champions[0];
  const sampleItem = tftData.items[0];
  const sampleTrait = tftData.traits[0];
  const sampleAugment = (tftData.augments ?? [])[0];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <header className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#4ab8c8]">
          Teamfight Tactics
        </p>
        <h1 className="mt-1 text-4xl font-semibold text-[#F2E8D5]">TFT</h1>
        <p className="mt-2 text-[#6b6055]">
          {tftData.champions.length} champions · {tftData.traits.length} traits · {tftData.items.length} items · {(tftData.augments ?? []).length} augments
        </p>
        <p className="mt-1 text-sm text-[#6b6055]">Set {tftData.setNumber ?? 17}</p>
      </header>

      <nav className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/tft/champions"
          className="flex flex-col gap-1 rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm transition hover:border-[#1a3038] hover:bg-[#0d181c] hover:shadow-md"
        >
          <p className="text-2xl font-semibold text-[#F2E8D5]">{tftData.champions.length}</p>
          <p className="text-sm font-semibold text-[#4ab8c8]">Champions</p>
          <p className="text-xs text-[#6b6055]">Cost tiers, traits, ability previews</p>
          {sampleChampion?.image && (
            <div className="mt-2 flex flex-col gap-2 border-t border-[#1c1c22] pt-3">
              <ImageWithFallback
                src={sampleChampion.image}
                alt={sampleChampion.name}
                className="h-16 w-16 rounded-lg border border-[#1c1c22] bg-[#141418] object-contain"
                loading="lazy"
              />
              <div>
                <p className="text-sm font-semibold text-[#F2E8D5]">{sampleChampion.name}</p>
                <p className="text-xs text-[#6b6055]">{sampleChampion.cost}g</p>
              </div>
            </div>
          )}
        </Link>
        <Link
          href="/tft/items"
          className="flex flex-col gap-1 rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm transition hover:border-[#1a3038] hover:bg-[#0d181c] hover:shadow-md"
        >
          <p className="text-2xl font-semibold text-[#F2E8D5]">{tftData.items.length}</p>
          <p className="text-sm font-semibold text-[#4ab8c8]">Items</p>
          <p className="text-xs text-[#6b6055]">Components, combined items, and more</p>
          {sampleItem?.image && (
            <div className="mt-2 flex flex-col gap-2 border-t border-[#1c1c22] pt-3">
              <ImageWithFallback
                src={sampleItem.image}
                alt={sampleItem.name}
                className="h-16 w-16 rounded-lg border border-[#1c1c22] bg-[#141418] object-contain"
                loading="lazy"
              />
              <div>
                <p className="text-sm font-semibold text-[#F2E8D5]">{sampleItem.name}</p>
                <p className="text-xs text-[#6b6055]">TFT item</p>
              </div>
            </div>
          )}
        </Link>
        <Link
          href="/tft/traits"
          className="flex flex-col gap-1 rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm transition hover:border-[#1a3038] hover:bg-[#0d181c] hover:shadow-md"
        >
          <p className="text-2xl font-semibold text-[#F2E8D5]">{tftData.traits.length}</p>
          <p className="text-sm font-semibold text-[#4ab8c8]">Traits</p>
          <p className="text-xs text-[#6b6055]">Origins and classes with tier breakpoints</p>
          {sampleTrait?.image && (
            <div className="mt-2 flex flex-col gap-2 border-t border-[#1c1c22] pt-3">
              <ImageWithFallback
                src={sampleTrait.image}
                alt={sampleTrait.name}
                className="h-16 w-16 rounded-lg border border-[#1c1c22] bg-[#141418] object-contain"
                loading="lazy"
              />
              <div>
                <p className="text-sm font-semibold text-[#F2E8D5]">{sampleTrait.name}</p>
                <p className="text-xs text-[#6b6055]">
                  {sampleTrait.tiers.length} tiers · {sampleTrait.tiers.map((t) => t.minUnits).join(" / ")}
                </p>
              </div>
            </div>
          )}
        </Link>
        <Link
          href="/tft/augments"
          className="flex flex-col gap-1 rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm transition hover:border-[#1a3038] hover:bg-[#0d181c] hover:shadow-md"
        >
          <p className="text-2xl font-semibold text-[#F2E8D5]">{(tftData.augments ?? []).length}</p>
          <p className="text-sm font-semibold text-[#4ab8c8]">Augments</p>
          <p className="text-xs text-[#6b6055]">Silver, Gold, and Prismatic augments</p>
          {sampleAugment?.image && (
            <div className="mt-2 flex flex-col gap-2 border-t border-[#1c1c22] pt-3">
              <ImageWithFallback
                src={sampleAugment.image}
                alt={sampleAugment.name}
                className="h-16 w-16 rounded-lg border border-[#1c1c22] bg-[#141418] object-contain"
                loading="lazy"
              />
              <div>
                <p className="text-sm font-semibold text-[#F2E8D5]">{sampleAugment.name}</p>
                <p className="text-xs text-[#6b6055]">{sampleAugment.tier}</p>
              </div>
            </div>
          )}
        </Link>
      </nav>
    </main>
  );
}
