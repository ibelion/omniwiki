import { leagueData } from "@/lib/league/data";
import { LootClient } from "@/components/LootClient";

export default function LootPage() {
  return <LootClient lootItems={leagueData.lootItems ?? []} />;
}
