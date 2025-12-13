import { leagueData } from "@/lib/league/data";
import { EmotesList } from "@/components/EmotesList";
import { BackLink } from "@/components/BackLink";

export default function LeagueEmotesPage() {
  const emotes = leagueData.emotes;
  
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 bg-gray-50 px-6 py-10">
      <BackLink href="/league" label="Back to League" />
      <EmotesList emotes={emotes} />
    </main>
  );
}
