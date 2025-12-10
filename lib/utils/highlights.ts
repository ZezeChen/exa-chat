export interface ScoredHighlight {
  text: string;
  score: number;
}

/**
 * Sorts highlights by their scores in descending order.
 * If scores array length doesn't match highlights, returns highlights in original order.
 * 
 * @param highlights - Array of highlight text strings
 * @param scores - Array of corresponding scores
 * @returns Array of scored highlights sorted by score descending
 */
export function sortHighlightsByScore(
  highlights: string[],
  scores: number[]
): ScoredHighlight[] {
  if (highlights.length !== scores.length) {
    return highlights.map((text, index) => ({
      text,
      score: scores[index] ?? 0,
    }));
  }

  const combined = highlights.map((text, index) => ({
    text,
    score: scores[index],
  }));

  return combined.sort((a, b) => b.score - a.score);
}

/**
 * Truncates highlight text to a maximum length with ellipsis.
 * 
 * @param text - The highlight text to truncate
 * @param maxLength - Maximum length before truncation (default: 200)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateHighlight(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}
