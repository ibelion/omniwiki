import type { LeagueDataBundle } from "./types";
import bundleData from "../../../public/leaguecontent/data/bundle.json";

export const leagueData = bundleData as LeagueDataBundle;

export const getChampionBySlug = (slug: string) =>
  leagueData.champions.find((champ) => champ.slug === slug);

