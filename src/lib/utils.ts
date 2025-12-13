// lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind-friendly class strings.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/**
 * Removes HTML tags and weird formatting characters from text.
 * Useful for cleaning up Riot's tooltips and PokeAPI's flavor text.
 */
export const cleanText = (text: string | undefined): string => {
  if (!text) return '';
  
  return text
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/[\n\f\r]/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ')      // Collapse multiple spaces
    .trim();
};

/**
 * Normalizes a stat value to a 0-100 scale.
 * @param value The raw value
 * @param max The theoretical maximum for this stat (e.g., 10 for LoL, 255 for Pokemon)
 */
export const normalizeStat = (value: number, max: number): number => {
  const normalized = (value / max) * 100;
  return Math.min(Math.round(normalized), 100); // Cap at 100
};

