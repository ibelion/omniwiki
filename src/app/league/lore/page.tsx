import { leagueData } from "@/lib/league/data";
import { LoreList } from "@/components/LoreList";
import { BackLink } from "@/components/BackLink";

export default function LeagueLorePage() {
  const lore = leagueData.lore ?? [];
  const champions = leagueData.champions;
  const factions = leagueData.factions;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 bg-gray-50 px-6 py-10">
      <BackLink href="/league" label="Back to League" />
      <LoreList lore={lore} champions={champions} factions={factions} />
    </main>
  );
}
