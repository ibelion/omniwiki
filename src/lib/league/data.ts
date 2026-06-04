import type { LeagueDataBundle } from "./types";
import { readFileSync } from "fs";
import { join } from "path";

// readFileSync is a runtime operation — webpack/esbuild never bundle the file
// content into handler.mjs. At Next.js SSG build time Node.js reads it from
// disk. Pre-rendered pages are served from ASSETS at Worker runtime so this
// module code never executes there.
const bundleData: LeagueDataBundle = JSON.parse(
  readFileSync(join(process.cwd(), "public/leaguecontent/data/bundle.json"), "utf8")
) as unknown as LeagueDataBundle;

export const leagueData = bundleData;

export const getChampionBySlug = (slug: string) =>
  leagueData.champions.find((champ) => champ.slug === slug);
