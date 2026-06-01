import Link from "next/link";
import { notFound } from "next/navigation";
import { leagueData } from "@/lib/league/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";

export function generateStaticParams() {
  return leagueData.items.map((item) => ({ id: String(item.id) }));
}

const STAT_LABELS: Record<string, string> = {
  FlatHPPoolMod: "Bonus HP",
  FlatMPPoolMod: "Bonus Mana",
  FlatArmorMod: "Armor",
  FlatSpellBlockMod: "Magic Resist",
  FlatPhysicalDamageMod: "Attack Damage",
  FlatMagicDamageMod: "Ability Power",
  FlatMovementSpeedMod: "Move Speed",
  PercentMovementSpeedMod: "Move Speed %",
  FlatAttackSpeedMod: "Attack Speed",
  PercentAttackSpeedMod: "Attack Speed %",
  FlatCritChanceMod: "Crit Chance",
  FlatHPRegenMod: "HP Regen",
  FlatMPRegenMod: "Mana Regen",
  FlatDodgeMod: "Dodge Chance",
  PercentLifeStealMod: "Life Steal",
  PercentSpellVampMod: "Spell Vamp",
};

function formatStatKey(key: string): string {
  return STAT_LABELS[key] ?? key.replace(/([A-Z])/g, " $1").trim();
}

function formatStatValue(key: string, val: number): string {
  if (key.toLowerCase().includes("percent") || key.includes("Crit") || key.includes("Dodge")) {
    return `${(val * 100).toFixed(0)}%`;
  }
  return String(val);
}

const tierBadge = (tags: string[]) => {
  if (tags.some((t) => t.toLowerCase().includes("mythic")))
    return { label: "Mythic", color: "bg-orange-50 text-orange-700 border-orange-200" };
  if (tags.some((t) => t.toLowerCase().includes("legendary")))
    return { label: "Legendary", color: "bg-purple-50 text-purple-700 border-purple-200" };
  if (tags.some((t) => t.toLowerCase().includes("boots")))
    return { label: "Boots", color: "bg-blue-50 text-blue-700 border-blue-200" };
  return { label: "Standard", color: "bg-gray-100 text-gray-600 border-gray-200" };
};

type PageProps = { params: Promise<{ id: string }> };

export default async function ItemDetailPage({ params }: PageProps) {
  const { id } = await params;
  const itemId = Number(id);
  const item = leagueData.items.find((i) => i.id === itemId);
  if (!item) notFound();

  const itemById = new Map(leagueData.items.map((i) => [i.id, i]));
  const tier = tierBadge(item.tags);
  const stats = Object.entries(item.stats ?? {}).filter(([, v]) => v !== 0);
  const builtFrom = (item.from ?? []).map((id) => itemById.get(id)).filter(Boolean);
  const buildsInto = (item.into ?? []).map((id) => itemById.get(id)).filter(Boolean);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/league/items" label="Back to Items" />

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-5">
          <ImageWithFallback
            src={item.image ? `/leaguecontent/${item.image}` : "/globe.svg"}
            alt={item.name}
            className="h-20 w-20 rounded-2xl border border-gray-100 object-contain"
          />
          <div className="flex-1">
            <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${tier.color}`}>
              {tier.label}
            </span>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900">{item.name}</h1>
            {item.plaintext && (
              <p className="text-sm text-gray-500">{item.plaintext}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              {item.goldTotal !== null && item.goldTotal > 0 && (
                <span className="font-semibold text-yellow-600">{item.goldTotal}g total</span>
              )}
              {item.goldBase !== null && item.goldBase > 0 && item.goldBase !== item.goldTotal && (
                <span className="text-gray-500">{item.goldBase}g base</span>
              )}
              {item.goldSell !== null && item.goldSell > 0 && (
                <span className="text-gray-500">{item.goldSell}g sell</span>
              )}
              {!item.purchasable && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">Not purchasable</span>
              )}
            </div>
          </div>
        </div>

        {item.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {item.description && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-900">Description</h2>
          <p className="text-sm leading-relaxed text-gray-700">{item.description}</p>
        </section>
      )}

      {stats.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-900">Stats</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {stats.map(([key, val]) => (
              <div key={key} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">{formatStatKey(key)}</p>
                <p className="text-sm font-semibold text-gray-900">+{formatStatValue(key, val)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {builtFrom.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-900">Built From</h2>
          <div className="flex flex-wrap gap-3">
            {builtFrom.map((comp) => (
              <Link
                key={comp!.id}
                href={`/league/items/${comp!.id}`}
                className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <ImageWithFallback
                  src={comp!.image ? `/leaguecontent/${comp!.image}` : "/globe.svg"}
                  alt={comp!.name}
                  className="h-8 w-8 rounded-lg border border-gray-100 object-contain"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{comp!.name}</p>
                  {comp!.goldTotal !== null && comp!.goldTotal > 0 && (
                    <p className="text-xs text-yellow-600">{comp!.goldTotal}g</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {buildsInto.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-900">Builds Into</h2>
          <div className="flex flex-wrap gap-3">
            {buildsInto.map((upgrade) => (
              <Link
                key={upgrade!.id}
                href={`/league/items/${upgrade!.id}`}
                className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <ImageWithFallback
                  src={upgrade!.image ? `/leaguecontent/${upgrade!.image}` : "/globe.svg"}
                  alt={upgrade!.name}
                  className="h-8 w-8 rounded-lg border border-gray-100 object-contain"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{upgrade!.name}</p>
                  {upgrade!.goldTotal !== null && upgrade!.goldTotal > 0 && (
                    <p className="text-xs text-yellow-600">{upgrade!.goldTotal}g</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
