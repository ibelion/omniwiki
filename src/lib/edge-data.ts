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
  // In Edge runtime, try to get URL from environment or use default
  if (typeof process !== "undefined" && process.env) {
    const fromEnv =
      ensureAbsoluteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
      ensureAbsoluteUrl(process.env.CF_PAGES_URL) ??
      ensureAbsoluteUrl(process.env.VERCEL_URL);
    if (fromEnv) return fromEnv;
    if (process.env.NODE_ENV === "development") {
      return "http://127.0.0.1:3000";
    }
  }
  // Default to production URL
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
  // Try relative URL first (works in Edge runtime for static assets)
  const relativeUrl = path.startsWith("/") ? path : `/${path}`;
  
  // If path already has protocol, use it directly
  if (path.startsWith("http")) {
    const res = await fetch(path, { cache: "force-cache" });
    if (!res.ok) {
      throw new Error(`Failed to fetch ${path}: ${res.status} ${res.statusText}`);
    }
    const buffer = await res.arrayBuffer();
    const text = await gunzipArrayBuffer(buffer);
    return JSON.parse(text) as T;
  }

  // Try relative URL first (works in Edge runtime)
  try {
    const res = await fetch(relativeUrl, { 
      cache: "force-cache",
      // Add headers to help with CORS if needed
      headers: {
        'Accept': 'application/json',
      }
    });
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      const text = await gunzipArrayBuffer(buffer);
      return JSON.parse(text) as T;
    }
  } catch (error) {
    // If relative URL fails, try with base URL
    console.warn(`Relative fetch failed for ${relativeUrl}, trying with base URL`, error);
  }

  // Fallback to absolute URL
  const base = getBaseUrl();
  const absoluteUrl = `${base}${relativeUrl}`;
  const res = await fetch(absoluteUrl, { 
    cache: "force-cache",
    headers: {
      'Accept': 'application/json',
    }
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path} (tried ${relativeUrl} and ${absoluteUrl}): ${res.status} ${res.statusText}`);
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
