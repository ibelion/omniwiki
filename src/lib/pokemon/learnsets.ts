import type { LearnsetEntry } from "./types";
import { GENERATION_ORDER } from "./versionGroups";

export type AggregatedLearnsetEntry = {
  method: string;
  generation: string;
  level: number | null;
  versionGroups: string[];
};

export { GENERATION_ORDER };

const METHOD_ORDER = [
  "level-up",
  "machine",
  "tutor",
  "egg",
  "light-ball-egg",
  "form-change",
  "special",
  "transfer",
];

const getGenerationWeight = (generation: string): number => {
  const index = (GENERATION_ORDER as readonly string[]).indexOf(generation);
  return index === -1 ? GENERATION_ORDER.length : index;
};

const getMethodWeight = (method: string): number => {
  const index = METHOD_ORDER.indexOf(method);
  return index === -1 ? METHOD_ORDER.length : index;
};

export const compareAggregatedEntries = (
  a: AggregatedLearnsetEntry,
  b: AggregatedLearnsetEntry
): number => {
  const generationDiff =
    getGenerationWeight(a.generation) - getGenerationWeight(b.generation);
  if (generationDiff !== 0) return generationDiff;

  const methodDiff = getMethodWeight(a.method) - getMethodWeight(b.method);
  if (methodDiff !== 0) return methodDiff;

  const levelA = a.level ?? Number.MAX_SAFE_INTEGER;
  const levelB = b.level ?? Number.MAX_SAFE_INTEGER;
  if (levelA !== levelB) return levelA - levelB;

  return a.versionGroups.length - b.versionGroups.length;
};

export const aggregateLearnsets = (
  entries: LearnsetEntry[]
): Map<string, AggregatedLearnsetEntry[]> => {
  const aggregated = new Map<string, Map<string, AggregatedLearnsetEntry>>();

  for (const entry of entries) {
    const generation = entry.generation;
    const bucketKey = `${entry.method}|${entry.level ?? "—"}`;

    let generationMap = aggregated.get(generation);
    if (!generationMap) {
      generationMap = new Map();
      aggregated.set(generation, generationMap);
    }

    let bucket = generationMap.get(bucketKey);
    if (!bucket) {
      bucket = {
        method: entry.method,
        generation: entry.generation,
        level: entry.level ?? null,
        versionGroups: [],
      };
      generationMap.set(bucketKey, bucket);
    }

    if (entry.versionGroup && !bucket.versionGroups.includes(entry.versionGroup)) {
      bucket.versionGroups.push(entry.versionGroup);
    }
  }

  const result = new Map<string, AggregatedLearnsetEntry[]>();
  for (const [generation, entriesMap] of aggregated.entries()) {
    const sortedEntries = Array.from(entriesMap.values())
      .map((entry) => ({
        ...entry,
        versionGroups: entry.versionGroups.sort((a, b) => a.localeCompare(b)),
      }))
      .sort(compareAggregatedEntries);
    result.set(generation, sortedEntries);
  }

  return result;
};

export const groupByMethod = (
  entries: AggregatedLearnsetEntry[]
): Map<string, AggregatedLearnsetEntry[]> => {
  const grouped = new Map<string, AggregatedLearnsetEntry[]>();

  for (const entry of entries) {
    const method = entry.method;
    if (!grouped.has(method)) {
      grouped.set(method, []);
    }
    grouped.get(method)!.push(entry);
  }

  return grouped;
};

