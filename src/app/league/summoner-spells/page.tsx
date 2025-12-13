import { leagueData } from "@/lib/league/data";
import { SummonerSpellsList } from "@/components/SummonerSpellsList";
import { BackLink } from "@/components/BackLink";

export default function LeagueSummonerSpellsPage() {
  const spells = leagueData.summonerSpells;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <BackLink href="/league" label="Back to League" />
      <SummonerSpellsList spells={spells} />
    </div>
  );
}
