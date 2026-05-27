import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import type { ChampionSkin, LeagueDataBundle, SkinLineRecord } from "../src/lib/league/types";

const COMMUNITY_DRAGON_SKINS_URL =
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/skins.json";

const PUBLIC_BUNDLE_PATH = path.join(
  process.cwd(),
  "public",
  "leaguecontent",
  "data",
  "bundle.json"
);
const CDN_BUNDLE_PATH = path.join(
  process.cwd(),
  "cdn",
  "leaguecontent",
  "data",
  "bundle.json"
);

type CommunityDragonSkinLineRef = {
  id: number;
};

type CommunityDragonSkin = {
  id: number;
  skinLines: CommunityDragonSkinLineRef[] | null;
};

type CommunityDragonSkinsResponse = Record<string, CommunityDragonSkin>;

type LeagueBundleWithRequiredData = LeagueDataBundle & {
  skins: ChampionSkin[];
  skinLines: SkinLineRecord[];
};

type PatchedSkinLineRecord = SkinLineRecord & {
  skinIds: number[];
  skinCount: number;
};

const readBundle = (): LeagueBundleWithRequiredData => {
  const raw = fs.readFileSync(PUBLIC_BUNDLE_PATH, "utf8");
  const parsed: unknown = JSON.parse(raw);

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("League bundle is not a JSON object.");
  }

  const bundle = parsed as Partial<LeagueDataBundle>;

  if (!Array.isArray(bundle.skins)) {
    throw new Error("League bundle is missing a skins array.");
  }

  if (!Array.isArray(bundle.skinLines)) {
    throw new Error("League bundle is missing a skinLines array.");
  }

  return bundle as LeagueBundleWithRequiredData;
};

const fetchCommunityDragonSkins = async (): Promise<CommunityDragonSkinsResponse> => {
  const response = await fetch(COMMUNITY_DRAGON_SKINS_URL);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch CommunityDragon skins: ${response.status} ${response.statusText}`
    );
  }

  const data: unknown = await response.json();

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("CommunityDragon skins payload was not an object.");
  }

  return data as CommunityDragonSkinsResponse;
};

const buildSkinLineMap = (
  skinsById: CommunityDragonSkinsResponse,
  validSkinIds: Set<number>
): Map<number, number[]> => {
  const skinLineMap = new Map<number, Set<number>>();

  for (const skin of Object.values(skinsById)) {
    if (!validSkinIds.has(skin.id) || !skin.skinLines) {
      continue;
    }

    for (const skinLine of skin.skinLines) {
      const existing = skinLineMap.get(skinLine.id) ?? new Set<number>();
      existing.add(skin.id);
      skinLineMap.set(skinLine.id, existing);
    }
  }

  return new Map(
    Array.from(skinLineMap.entries()).map(([skinLineId, skinIds]) => [
      skinLineId,
      Array.from(skinIds).sort((a, b) => a - b),
    ])
  );
};

const patchSkinLines = (
  skinLines: SkinLineRecord[],
  skinLineMap: Map<number, number[]>
): PatchedSkinLineRecord[] =>
  skinLines.map((skinLine) => {
    const skinIds = skinLineMap.get(skinLine.id) ?? [];
    return {
      ...skinLine,
      skinIds,
      skinCount: skinIds.length,
    };
  });

const writeBundle = (bundle: LeagueDataBundle) => {
  const json = `${JSON.stringify(bundle, null, 2)}\n`;
  fs.writeFileSync(PUBLIC_BUNDLE_PATH, json, "utf8");
  fs.writeFileSync(CDN_BUNDLE_PATH, zlib.gzipSync(json));
};

const logTopSkinLines = (skinLines: PatchedSkinLineRecord[]) => {
  const topSkinLines = [...skinLines]
    .sort((a, b) => b.skinCount - a.skinCount || a.name.localeCompare(b.name))
    .slice(0, 5);

  console.log("Top 5 skin lines by skin count:");
  for (const skinLine of topSkinLines) {
    console.log(`- ${skinLine.name} (${skinLine.skinCount})`);
  }
};

const main = async () => {
  const bundle = readBundle();
  const communityDragonSkins = await fetchCommunityDragonSkins();
  const validSkinIds = new Set(bundle.skins.map((skin) => skin.skinId));
  const skinLineMap = buildSkinLineMap(communityDragonSkins, validSkinIds);
  const patchedSkinLines = patchSkinLines(bundle.skinLines, skinLineMap);

  bundle.skinLines = patchedSkinLines;

  writeBundle(bundle);
  logTopSkinLines(patchedSkinLines);

  console.log(
    `Patched ${patchedSkinLines.length} skin lines using ${validSkinIds.size} bundle skins.`
  );
};

void main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("Unknown error while patching skin lines.");
  }
  process.exitCode = 1;
});
