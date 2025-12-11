import fs from "node:fs";
import path from "node:path";
import type { LeagueDataBundle } from "./types";

const bundlePath = path.join(
  process.cwd(),
  "public",
  "leaguecontent",
  "data",
  "bundle.json"
);

let cached: LeagueDataBundle | null = null;

const loadBundle = (): LeagueDataBundle => {
  if (!cached) {
    const raw = fs.readFileSync(bundlePath, "utf8");
    cached = JSON.parse(raw) as LeagueDataBundle;
  }
  return cached;
};

export const leagueData = loadBundle();

export const getChampionBySlug = (slug: string) =>
  leagueData.champions.find((champ) => champ.slug === slug);
