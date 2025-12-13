import { leagueData } from "@/lib/league/data";
import { SkinsList } from "@/components/SkinsList";
import { BackLink } from "@/components/BackLink";

export default function LeagueSkinsPage() {
  const skins = leagueData.skins;
  const champions = leagueData.champions.map(c => ({ id: c.id, slug: c.slug }));
  
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 bg-gray-50 px-6 py-10">
      <BackLink href="/league" label="Back to League" />
      <SkinsList skins={skins} champions={champions} />
    </main>
  );
}
