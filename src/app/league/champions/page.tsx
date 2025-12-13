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
  const champions = leagueData.champions.map((c) => ({
    ...c,
    positions: positionsByName[c.name.toLowerCase()] || [],
  }));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/league" label="Back to League" />
      <ChampionsList champions={champions} />
    </main>
  );
}
