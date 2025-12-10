export type RelevanceLevel = 'high' | 'medium' | 'low';

/**
 * Determines the relevance level based on a score value.
 * - High: score >= 0.8
 * - Medium: 0.5 <= score < 0.8
 * - Low: score < 0.5
 * 
 * @param score - The relevance score (0-1)
 * @returns The relevance level
 */
export function getRelevanceLevel(score: number): RelevanceLevel {
  if (score >= 0.8) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}
