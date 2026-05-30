import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";
import fsp from "node:fs/promises";

import type {
  ChampionRecord,
  LeagueDataBundle,
  QuoteRecord,
} from "../src/lib/league/types";

type CDragonChampionSummary = {
  id: number;
  name: string;
  alias: string;
  squarePortraitPath?: string;
  [key: string]: unknown;
};

type FetchJsonResult =
  | { ok: true; status: number; url: string; data: unknown }
  | { ok: false; status: number; url: string; error: string };

type VoiceProbe = {
  url: string;
  label: string;
  data: unknown;
};

type ExtractedVoiceLine = {
  text: string;
  category: string | null;
  audioFileName: string | null;
  sourceUrl: string;
  sourcePath: string;
};

type VoiceMatch = {
  champion: ChampionRecord;
  cdragon: CDragonChampionSummary;
};

const CHAMPION_SUMMARY_URL =
  "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json";
const PUBLIC_BUNDLE_PATH = path.resolve("public/leaguecontent/data/bundle.json");
const CDN_BUNDLE_PATH = path.resolve("cdn/leaguecontent/data/bundle.json");
const REQUEST_DELAY_MS = 100;

const AUDIO_EXT_RE = /\.(ogg|mp3|wav|wem)(?:$|[?#])/i;
const TEXT_FIELD_RE = /(text|line|quote|caption|subtitle|transcript|script)/i;
const AUDIO_FIELD_RE = /(audio|sound|file|filename|path|url|source|media)/i;
const CATEGORY_FIELD_RE = /(category|type|event|trigger|context|group|action)/i;
const NOISY_TEXT_KEY_RE =
  /(description|dynamicdescription|tooltip|displayname|name|title|lore|plaintext|summary|quoteauthor)/i;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toChampionAudioFolder(champion: ChampionRecord, alias: string): string {
  const aliasFolder = alias.replace(/[^A-Za-z0-9]/g, "");
  if (aliasFolder) return aliasFolder;
  return champion.name.replace(/[^A-Za-z0-9]/g, "");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function looksLikeTranscript(value: string): boolean {
  const trimmed = normalizeWhitespace(value);
  if (!trimmed) return false;
  if (trimmed.length < 2 || trimmed.length > 500) return false;
  if (!/[A-Za-z]/.test(trimmed)) return false;
  if (AUDIO_EXT_RE.test(trimmed)) return false;
  if (/^https?:\/\//i.test(trimmed)) return false;
  if (/^\/?(lol-game-data|plugins|game|assets)\//i.test(trimmed)) return false;
  if (/^[A-Za-z0-9_./-]+$/.test(trimmed) && trimmed.length < 80) return false;
  return true;
}

function extractAudioFileName(value: string): string | null {
  const trimmed = value.trim();
  if (!AUDIO_EXT_RE.test(trimmed)) return null;

  const withoutQuery = trimmed.split("?")[0].split("#")[0];
  const fileName = path.posix.basename(withoutQuery);
  return fileName || null;
}

function normalizeCategory(raw: string | null, pathHint: string): string | null {
  const combined = `${raw ?? ""} ${pathHint}`.toLowerCase();

  if (/(champion.?select|choose|lock.?in|picked)/.test(combined)) {
    return "champion_select";
  }
  if (/(ban\b|banned)/.test(combined)) {
    return "champion_ban";
  }
  if (/(first.?move|game.?start|spawn|spawnin|startofgame)/.test(combined)) {
    return "first_move";
  }
  if (/(move|movement|walking|path)/.test(combined)) {
    return "movement";
  }
  if (/(kill|slay|takedown)/.test(combined)) {
    return "kill";
  }
  if (/(joke)/.test(combined)) {
    return "joke";
  }
  if (/(taunt)/.test(combined)) {
    return "taunt";
  }
  if (/(dance)/.test(combined)) {
    return "dance";
  }
  if (/(laugh|giggle|cackle)/.test(combined)) {
    return "laugh";
  }
  if (/(death|die|dies)/.test(combined)) {
    return "death";
  }
  if (/(recall|homeguard)/.test(combined)) {
    return "recall";
  }
  if (/(respawn|revive)/.test(combined)) {
    return "respawn";
  }
  if (/(attack|basicattack|crit)/.test(combined)) {
    return "attack";
  }
  if (/(ability|spell|passive|\bq\b|\bw\b|\be\b|\br\b|\bult\b)/.test(combined)) {
    return "ability";
  }
  if (/(interaction|special|encounter|meeting|response)/.test(combined)) {
    return "interaction";
  }

  return raw ? normalizeWhitespace(raw).toLowerCase().replace(/\s+/g, "_") : null;
}

function describeShape(value: unknown): string {
  if (Array.isArray(value)) {
    const first = value[0];
    if (first && typeof first === "object" && !Array.isArray(first)) {
      return `array(len=${value.length}, firstKeys=${Object.keys(first as Record<string, unknown>)
        .slice(0, 12)
        .join(", ")})`;
    }
    return `array(len=${value.length}, firstType=${typeof first})`;
  }

  if (value && typeof value === "object") {
    return `object(keys=${Object.keys(value as Record<string, unknown>)
      .slice(0, 20)
      .join(", ")})`;
  }

  return typeof value;
}

async function fetchJson(url: string): Promise<FetchJsonResult> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        url,
        error: `HTTP ${response.status}`,
      };
    }

    const data = (await response.json()) as unknown;
    return { ok: true, status: response.status, url, data };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      url,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function findVoiceMatches(
  bundleChampions: ChampionRecord[],
  cdragonChampions: CDragonChampionSummary[]
): VoiceMatch[] {
  const byId = new Map<number, CDragonChampionSummary>();
  const bySlug = new Map<string, CDragonChampionSummary>();

  for (const champion of cdragonChampions) {
    byId.set(champion.id, champion);
    bySlug.set(slugify(champion.name), champion);
    bySlug.set(slugify(champion.alias), champion);
  }

  const matches: VoiceMatch[] = [];
  for (const champion of bundleChampions) {
    const cdragon = byId.get(champion.id) ?? bySlug.get(champion.slug);
    if (!cdragon) {
      console.warn(
        `[skip] No CommunityDragon champion match for ${champion.name} (${champion.id}, ${champion.slug})`
      );
      continue;
    }
    matches.push({ champion, cdragon });
  }

  return matches;
}

async function probeVoiceData(match: VoiceMatch): Promise<VoiceProbe | null> {
  const aliasLower = match.cdragon.alias.toLowerCase();
  const candidateUrls = [
    {
      label: "champion detail",
      url: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champions/${match.cdragon.id}.json`,
    },
    {
      label: "default sounds",
      url: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion/${match.cdragon.id}/skins/default/sounds.json`,
    },
    {
      label: "base sounds",
      url: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion/${match.cdragon.id}/skins/base/sounds.json`,
    },
    {
      label: "character bin",
      url: `https://raw.communitydragon.org/latest/game/data/characters/${aliasLower}/${aliasLower}.bin.json`,
    },
  ];

  let firstSuccess: VoiceProbe | null = null;

  for (const candidate of candidateUrls) {
    const result = await fetchJson(candidate.url);
    if (!result.ok) {
      if (result.status === 404) {
        console.warn(
          `[probe] ${match.champion.name}: ${candidate.label} missing (${candidate.url})`
        );
      } else {
        console.warn(
          `[probe] ${match.champion.name}: ${candidate.label} failed (${result.error})`
        );
      }
      continue;
    }

    console.log(
      `[probe] ${match.champion.name}: ${candidate.label} -> ${describeShape(result.data)}`
    );

    if (!firstSuccess) {
      firstSuccess = {
        label: candidate.label,
        url: candidate.url,
        data: result.data,
      };
    }

    const extracted = extractVoiceLines(result.data, candidate.url);
    if (extracted.length > 0) {
      console.log(
        `[probe] ${match.champion.name}: extracted ${extracted.length} candidate voice lines from ${candidate.label}`
      );
      return {
        label: candidate.label,
        url: candidate.url,
        data: result.data,
      };
    }
  }

  return firstSuccess;
}

function extractVoiceLines(data: unknown, sourceUrl: string): ExtractedVoiceLine[] {
  const lines: ExtractedVoiceLine[] = [];
  const seen = new Set<string>();

  function pushLine(line: ExtractedVoiceLine): void {
    const text = normalizeWhitespace(line.text);
    const audioFileName = line.audioFileName ? normalizeWhitespace(line.audioFileName) : null;
    if (!looksLikeTranscript(text) || !audioFileName) return;

    const key = `${text.toLowerCase()}|${audioFileName.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    lines.push({
      ...line,
      text,
      audioFileName,
      category: normalizeCategory(line.category, line.sourcePath),
    });
  }

  function walk(node: unknown, trail: string[]): void {
    if (Array.isArray(node)) {
      node.forEach((item, index) => walk(item, [...trail, String(index)]));
      return;
    }

    if (!node || typeof node !== "object") {
      return;
    }

    const record = node as Record<string, unknown>;
    const entries = Object.entries(record);

    const textCandidates: string[] = [];
    const audioCandidates: string[] = [];
    const categoryCandidates: string[] = [];

    for (const [key, value] of entries) {
      if (typeof value === "string") {
        const normalized = normalizeWhitespace(value);

        if (AUDIO_FIELD_RE.test(key)) {
          const fileName = extractAudioFileName(normalized);
          if (fileName) audioCandidates.push(fileName);
        } else if (
          TEXT_FIELD_RE.test(key) &&
          !NOISY_TEXT_KEY_RE.test(key) &&
          looksLikeTranscript(normalized)
        ) {
          textCandidates.push(normalized);
        } else if (CATEGORY_FIELD_RE.test(key) && normalized) {
          categoryCandidates.push(normalized);
        } else {
          const fileName = extractAudioFileName(normalized);
          if (fileName) {
            audioCandidates.push(fileName);
          }
        }
      }

      if (Array.isArray(value)) {
        if (TEXT_FIELD_RE.test(key)) {
          for (const item of value) {
            if (typeof item === "string" && looksLikeTranscript(item)) {
              textCandidates.push(normalizeWhitespace(item));
            }
          }
        }

        if (AUDIO_FIELD_RE.test(key)) {
          for (const item of value) {
            if (typeof item === "string") {
              const fileName = extractAudioFileName(item);
              if (fileName) audioCandidates.push(fileName);
            }
          }
        }
      }
    }

    if (textCandidates.length > 0 && audioCandidates.length > 0) {
      const category = categoryCandidates[0] ?? trail.join(".");
      const pairCount = Math.max(textCandidates.length, audioCandidates.length);

      for (let index = 0; index < pairCount; index += 1) {
        pushLine({
          text: textCandidates[Math.min(index, textCandidates.length - 1)],
          audioFileName: audioCandidates[Math.min(index, audioCandidates.length - 1)],
          category,
          sourceUrl,
          sourcePath: trail.join("."),
        });
      }
    }

    for (const [key, value] of entries) {
      walk(value, [...trail, key]);
    }
  }

  walk(data, []);
  return lines;
}

async function gzipFileFromString(json: string, targetPath: string): Promise<void> {
  await fsp.mkdir(path.dirname(targetPath), { recursive: true });
  await pipeline(Readable.from([json]), createGzip(), fs.createWriteStream(targetPath));
}

async function main(): Promise<void> {
  console.log(`[investigate] Fetching champion summary: ${CHAMPION_SUMMARY_URL}`);
  const summaryResult = await fetchJson(CHAMPION_SUMMARY_URL);
  if (!summaryResult.ok) {
    throw new Error(`Failed to fetch champion summary: ${summaryResult.error}`);
  }
  if (!Array.isArray(summaryResult.data)) {
    throw new Error("Champion summary payload was not an array");
  }

  const championSummary = summaryResult.data as CDragonChampionSummary[];
  console.log("[investigate] First 3 champion summary entries:");
  console.log(JSON.stringify(championSummary.slice(0, 3), null, 2));

  const bundleRaw = await fsp.readFile(PUBLIC_BUNDLE_PATH, "utf8");
  const bundle = JSON.parse(bundleRaw) as LeagueDataBundle;

  const matches = findVoiceMatches(bundle.champions, championSummary);
  if (matches.length === 0) {
    throw new Error("No bundle champions matched CommunityDragon champion summary");
  }

  const firstProbeUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champions/${matches[0].cdragon.id}.json`;
  console.log(`[investigate] Fetching first champion detail: ${firstProbeUrl}`);
  const firstDetail = await fetchJson(firstProbeUrl);
  if (firstDetail.ok) {
    console.log(
      `[investigate] First champion detail shape: ${describeShape(firstDetail.data)}`
    );
    const detailKeys =
      firstDetail.data && typeof firstDetail.data === "object" && !Array.isArray(firstDetail.data)
        ? Object.keys(firstDetail.data as Record<string, unknown>).slice(0, 30)
        : [];
    console.log(
      `[investigate] First champion detail keys: ${detailKeys.length > 0 ? detailKeys.join(", ") : "(not an object)"}`
    );
  } else {
    console.warn(`[investigate] First champion detail failed: ${firstDetail.error}`);
  }

  const existingByChampionText = new Map<string, Set<string>>();
  for (const quote of bundle.quotes) {
    const championKey = quote.champion.toLowerCase();
    const textKey = normalizeWhitespace(quote.text).toLowerCase();
    if (!existingByChampionText.has(championKey)) {
      existingByChampionText.set(championKey, new Set());
    }
    existingByChampionText.get(championKey)?.add(textKey);
  }

  const beforeCount = bundle.quotes.length;
  const addedPerChampion = new Map<string, number>();
  const newQuotes: QuoteRecord[] = [];

  for (const match of matches) {
    const probe = await probeVoiceData(match);
    if (!probe) {
      console.warn(`[skip] ${match.champion.name}: no accessible voice data endpoints`);
      await delay(REQUEST_DELAY_MS);
      continue;
    }

    const extracted = extractVoiceLines(probe.data, probe.url);
    if (extracted.length === 0) {
      console.warn(
        `[skip] ${match.champion.name}: no transcript-like voice lines found in ${probe.label}`
      );
      await delay(REQUEST_DELAY_MS);
      continue;
    }

    const championKey = match.champion.name.toLowerCase();
    const knownTexts = existingByChampionText.get(championKey) ?? new Set<string>();
    existingByChampionText.set(championKey, knownTexts);

    let added = 0;
    const audioFolder = toChampionAudioFolder(match.champion, match.cdragon.alias);

    for (const line of extracted) {
      const textKey = line.text.toLowerCase();
      if (knownTexts.has(textKey)) {
        continue;
      }

      knownTexts.add(textKey);
      newQuotes.push({
        champion: match.champion.name,
        text: line.text,
        category: line.category,
        language: "en_US",
        audio: `champions/${audioFolder}/audio/${line.audioFileName}`,
      });
      added += 1;
    }

    addedPerChampion.set(match.champion.name, added);
    console.log(
      `[add] ${match.champion.name}: +${added} quotes from ${probe.label} (${extracted.length} candidates)`
    );

    await delay(REQUEST_DELAY_MS);
  }

  bundle.quotes.push(...newQuotes);

  const afterCount = bundle.quotes.length;
  const outputJson = JSON.stringify(bundle, null, 2) + "\n";

  await fsp.writeFile(PUBLIC_BUNDLE_PATH, outputJson, "utf8");
  await gzipFileFromString(outputJson, CDN_BUNDLE_PATH);

  console.log("[stats] Added quotes per champion:");
  for (const [champion, added] of [...addedPerChampion.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    console.log(`  ${champion}: +${added}`);
  }

  console.log(`[stats] Total before: ${beforeCount}`);
  console.log(`[stats] Added total: ${newQuotes.length}`);
  console.log(`[stats] Total after: ${afterCount}`);
  console.log(`[write] Updated bundle: ${PUBLIC_BUNDLE_PATH}`);
  console.log(`[write] Wrote gzip bundle: ${CDN_BUNDLE_PATH}`);
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(`[fatal] ${message}`);
  process.exitCode = 1;
});
