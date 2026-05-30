import { leagueData } from "@/lib/league/data";
import { SkinLinesClient } from "@/components/SkinLinesClient";

export default function SkinLinesPage() {
  const skinLines = leagueData.skinLines ?? [];
  const skinById = Object.fromEntries(
    leagueData.skins.map((s) => [s.skinId, { name: s.name, splash: s.splash }])
  );

  return <SkinLinesClient skinLines={skinLines} skinById={skinById} />;
}
