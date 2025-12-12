import { cache } from "react";
import { gunzipSync } from "fflate";
import type { PokemonDataBundle } from "./pokemon/types";
import type { LeagueDataBundle } from "./league/types";

const ensureAbsoluteUrl = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, "");
  }
  return `https://${trimmed.replace(/^\/*/, "")}`;
};

const getBaseUrl = () => {
  if (typeof process !== "undefined") {
    const fromEnv =
      ensureAbsoluteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
      ensureAbsoluteUrl(process.env.CF_PAGES_URL) ??
      ensureAbsoluteUrl(process.env.VERCEL_URL);
    if (fromEnv) return fromEnv;
    if (process.env.NODE_ENV === "development") {
      return "http://127.0.0.1:3000";
    }
  }
  return "https://omniwiki.pages.dev";
};

const decoder = new TextDecoder();

const gunzipArrayBuffer = async (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  const isGzip = bytes.length > 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
  if (!isGzip) {
    return decoder.decode(bytes);
  }

  const decompressed = gunzipSync(bytes);
  return decoder.decode(decompressed);
};

const fetchJson = async <T>(path: string): Promise<T> => {
  const base = getBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }
  const buffer = await res.arrayBuffer();
  const text = await gunzipArrayBuffer(buffer);
  return JSON.parse(text) as T;
};

export const getPokemonBundleEdge = cache(async () =>
  fetchJson<PokemonDataBundle>("/pokemoncontent/data/bundle.json")
);

export const getLeagueBundleEdge = cache(async () =>
  fetchJson<LeagueDataBundle>("/leaguecontent/data/bundle.json")
);
