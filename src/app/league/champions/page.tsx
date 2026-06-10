import { leagueData } from "@/lib/league/data";
import { ChampionsList } from "@/components/ChampionsList";
import { loadChampionPositions } from "@/lib/league/positions";
import { BackLink } from "@/components/BackLink";

function loadPositionsMap(): Record<string, string[]> {
  const map = loadChampionPositions();
  const obj: Record<string, string[]> = {};
  for (const [k, v] of map.entries()) obj[k] = v;
  return obj;
}

export default function LeagueChampionsPage() {
  const positionsByName = loadPositionsMap();

  // Build champion → skin line name mapping from skins data
  const skinLineById = new Map(
    (leagueData.skinLines ?? []).map((l) => [l.id, l.name])
  );
  const skinLinesByChampionId = new Map<number, string[]>();
  for (const skin of leagueData.skins ?? []) {
    if (!skin.skinLineIds?.length) continue;
    for (const lineId of skin.skinLineIds) {
      const name = skinLineById.get(lineId);
      if (!name) continue;
      const arr = skinLinesByChampionId.get(skin.championId) ?? [];
      if (!arr.includes(name)) arr.push(name);
      skinLinesByChampionId.set(skin.championId, arr);
    }
  }

  const champions = leagueData.champions.map((c) => ({
    ...c,
    positions: positionsByName[c.name.toLowerCase()] || c.positions,
    skinLines: skinLinesByChampionId.get(c.id) ?? [],
  }));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/league" label="Back to League" />
      <header className="relative overflow-hidden rounded-3xl border border-[#1c1c22] bg-[#141418] p-8">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 120% at 100% 50%, rgba(76,175,114,0.12) 0%, transparent 70%)",
          }}
        />
        <p className="text-xs font-semibold uppercase tracking-widest text-[#4caf72]">
          League of Legends
        </p>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-[#F2E8D5]">
          Champion Hub
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#6b6055]">
          {champions.length.toLocaleString()} champions — filter by position, role, or search by name.
        </p>
      </header>
      <ChampionsList champions={champions} />
    </main>
  );
}
