import bundle from "../../../public/leaguecontent/data/bundle.json";
import type { LeagueDataBundle } from "./types";

export const leagueData = bundle as LeagueDataBundle;

export const getChampionBySlug = (slug: string) =>
  leagueData.champions.find((champ) => champ.slug === slug);
