import { z } from 'zod';

/**
 * Character schema for OmniArt data storage
 */
export const CharacterSchema = z.object({
  id: z.string().min(1, 'Character ID is required'),
  name: z.string().min(1, 'Character name is required'),
  universe: z.string().min(1, 'Universe identifier is required'),
  tags: z.array(z.string()).default([]),
  imagePath: z.string().optional(),
  metadata: z.record(z.unknown()).default({}),
});

export type Character = z.infer<typeof CharacterSchema>;

/**
 * Universe bundle schema (what OmniArt stores)
 */
export const UniverseBundleSchema = z.object({
  universe: z.string().min(1),
  characters: z.array(CharacterSchema),
});

export type UniverseBundle = z.infer<typeof UniverseBundleSchema>;

/**
 * Export bundle schema (what Omnigame expects)
 * This matches the format in Omnigame's src/schema/omniart.ts
 */
export const OmnigameCharacterSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  universeId: z.string(),
  tags: z.array(z.string()),
  metadata: z.record(z.any()),
  images: z.object({
    portrait: z.string(),
    full: z.string(),
  }),
});

export type OmnigameCharacter = z.infer<typeof OmnigameCharacterSchema>;

/**
 * Export bundle format that Omnigame expects
 */
export const ExportBundleSchema = z.object({
  universe: z.object({
    key: z.string(),
    displayName: z.string(),
    version: z.number().optional(),
  }),
  exportedAt: z.string(),
  characterCount: z.number(),
  characters: z.array(OmnigameCharacterSchema),
});

export type ExportBundle = z.infer<typeof ExportBundleSchema>;

