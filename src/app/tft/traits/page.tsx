import { tftData } from "@/lib/tft/data";
import { BackLink } from "@/components/BackLink";

const TIER_STYLES: Record<number, string> = {
  1: "bg-gray-100 text-gray-700",
  2: "bg-blue-100 text-blue-700",
  3: "bg-purple-100 text-purple-700",
  4: "bg-yellow-100 text-yellow-700",
};

export default function TFTTraitsPage() {
  const traits = [...tftData.traits].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/tft" label="Back to TFT" />
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">TFT</p>
        <h1 className="text-3xl font-semibold text-gray-900">Traits ({traits.length})</h1>
        <p className="mt-1 text-gray-600">Origins and classes with unit activation breakpoints.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {traits.map((trait) => (
          <article
            key={trait.id}
            id={trait.name.toLowerCase().replace(/\s+/g, "-")}
            className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <h3 className="text-base font-semibold text-gray-900">{trait.name}</h3>
            {trait.description && (
              <p
                className="text-xs text-gray-600"
                dangerouslySetInnerHTML={{ __html: trait.description }}
              />
            )}
            {trait.tiers.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {trait.tiers.map((tier, idx) => (
                  <span
                    key={idx}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIER_STYLES[tier.style] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {tier.minUnits}
                    {tier.minUnits !== tier.maxUnits ? `–${tier.maxUnits}` : ""}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
