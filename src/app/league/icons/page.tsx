import { leagueData } from "@/lib/league/data";
import { IconsList } from "@/components/IconsList";
import { BackLink } from "@/components/BackLink";

export default function LeagueIconsPage() {
  const icons = leagueData.summonerIcons;
  
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/league" label="Back to League" />
      <IconsList icons={icons} />
    </main>
  );
}
