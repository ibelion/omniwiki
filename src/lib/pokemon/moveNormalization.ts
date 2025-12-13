/**
 * Normalizes move slugs by removing version-specific suffixes.
 * Example: "scratch_2" -> "scratch", "fire_punch_3" -> "fire_punch"
 * 
 * This is needed because learnset data may use versioned move slugs (scratch_2, scratch_3)
 * but the moves.json file uses base slugs (scratch).
 */
export const normalizeMoveSlug = (moveSlug: string): string => {
  // Remove trailing version suffix pattern: _1, _2, _3, etc.
  // Match _ followed by digits at the end of the string
  return moveSlug.replace(/_\d+$/, "");
};

/**
 * Creates a move index that allows lookup by normalized slugs.
 * When a move slug has a version suffix (e.g., "scratch_2"), it will be
 * normalized to the base slug ("scratch") for lookup.
 */
export const createNormalizedMoveIndex = <T extends { slug: string }>(
  moves: T[]
): Map<string, T> => {
  const index = new Map<string, T>();
  
  for (const move of moves) {
    // Store by original slug
    index.set(move.slug, move);
    // Also store by normalized slug so lookups work with either format
    const normalized = normalizeMoveSlug(move.slug);
    if (normalized !== move.slug) {
      index.set(normalized, move);
    }
  }
  
  return index;
};

