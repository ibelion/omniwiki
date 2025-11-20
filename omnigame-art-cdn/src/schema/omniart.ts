import { z } from 'zod';

/**
 * Standardized OmniArt character schema
 * This schema must match the one used in Omnigame exports
 */
export const OmniArtCharacterSchema = z.object({
  id: z.string().min(1, 'Character ID is required'),
  key: z.string().min(1, 'Character key is required'),
  name: z.string().min(1, 'Character name is required'),
  universeId: z.string().min(1, 'Universe ID is required'),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).default({}),
  images: z.object({
    portrait: z.string().optional(),
    full: z.string().optional(),
  }).default({}),
});

export type OmniArtCharacter = z.infer<typeof OmniArtCharacterSchema>;

/**
 * Universe export metadata schema
 */
export const OmniArtUniverseExportSchema = z.object({
  universeId: z.string().min(1),
  universeName: z.string().min(1),
  version: z.string().optional(),
  exportedAt: z.string().optional(),
  characters: z.array(OmniArtCharacterSchema),
});

export type OmniArtUniverseExport = z.infer<typeof OmniArtUniverseExportSchema>;

