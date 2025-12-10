"use client";

import { sortHighlightsByScore, truncateHighlight } from "@/lib/utils/highlights";

interface HighlightSectionProps {
  highlights?: string[];
  highlightScores?: number[];
  isExpanded: boolean;
  maxLength?: number;
}

export function HighlightSection({
  highlights,
  highlightScores,
  isExpanded,
  maxLength = 200,
}: HighlightSectionProps) {
  if (!highlights || highlights.length === 0) return null;

  const sortedHighlights = sortHighlightsByScore(
    highlights,
    highlightScores ?? []
  );

  const displayHighlights = isExpanded ? sortedHighlights : sortedHighlights.slice(0, 2);

  return (
    <div className="flex flex-col gap-1 sm:gap-1.5 mt-1">
      {displayHighlights.map((highlight, i) => {
        const displayText = isExpanded
          ? highlight.text
          : truncateHighlight(highlight.text, maxLength);

        return (
          <p
            key={i}
            className="text-tiny sm:text-small text-default-600 italic border-l-2 border-primary pl-2 line-clamp-2"
          >
            &ldquo;{displayText}&rdquo;
          </p>
        );
      })}
    </div>
  );
}
