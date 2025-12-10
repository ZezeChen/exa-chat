"use client";

import { Chip } from "@heroui/react";
import { getRelevanceLevel, RelevanceLevel } from "@/lib/utils/relevance";

interface RelevanceIndicatorProps {
  score?: number;
}

const relevanceConfig: Record<RelevanceLevel, { label: string; color: "success" | "warning" | "default" }> = {
  high: { label: "High Relevance", color: "success" },
  medium: { label: "Medium Relevance", color: "warning" },
  low: { label: "Low Relevance", color: "default" },
};

export function RelevanceIndicator({ score }: RelevanceIndicatorProps) {
  if (score === undefined) return null;

  const level = getRelevanceLevel(score);
  const config = relevanceConfig[level];

  return (
    <Chip 
      size="sm" 
      variant="flat" 
      color={config.color}
      classNames={{
        base: "h-5 sm:h-6",
        content: "text-tiny sm:text-small px-1 sm:px-2",
      }}
    >
      {config.label}
    </Chip>
  );
}
