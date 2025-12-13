// types/omni-schema.ts

export type OmniUniverse = 'league-of-legends' | 'pokemon';

/**
 * The Standardized Entity for OmniGames.
 * All raw data must be transformed into this shape.
 */
export interface OmniEntity {
  /** Unique Identifier (e.g., "lol-ahri", "poke-25") */
  uid: string;
  
  /** Display Name (e.g., "Ahri", "Pikachu") */
  name: string;
  
  /** Subtitle or Genus (e.g., "the Nine-Tailed Fox", "Mouse Pokémon") */
  title: string;
  
  /** The source universe */
  universe: OmniUniverse;
  
  /** Normalized Stats (0-100 scale) */
  stats: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
  
  /** Visual Assets */
  images: {
    /** Square avatar/icon URL */
    icon: string;
    /** Vertical slice or full body artwork URL */
    portrait: string;
  };
  
  /** Clean text description for trivia hints */
  lore: string;
  
  /** List of ability names */
  abilities: string[];
  
  /** Categorization tags (e.g., "Mage", "Electric") */
  tags: string[];
}

/**
 * The API Response wrapper for the CDN endpoint.
 */
export interface OmniCdnResponse {
  meta: {
    version: string;
    generatedAt: number;
    totalCount: number;
  };
  data: OmniEntity[];
}