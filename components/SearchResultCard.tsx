"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  Link,
  Image,
  Button,
  Avatar,
} from "@heroui/react";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { SearchResult } from "@/lib/types";
import { motion } from "framer-motion";
import { RelevanceIndicator } from "./RelevanceIndicator";
import { HighlightSection } from "./HighlightSection";
import { MetadataSection } from "./MetadataSection";

interface SearchResultCardProps {
  result: SearchResult;
  index: number;
}

function getDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace("www.", "");
  } catch {
    return url;
  }
}

function getFaviconUrl(url: string): string {
  const domain = getDomain(url);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

function hasExpandableContent(result: SearchResult): boolean {
  const hasLongText = (result.text?.length ?? 0) > 200;
  const hasLongSummary = (result.summary?.length ?? 0) > 200;
  const hasMultipleHighlights = (result.highlights?.length ?? 0) > 2;
  const hasLongHighlight = result.highlights?.some((h) => h.length > 200) ?? false;
  return hasLongText || hasLongSummary || hasMultipleHighlights || hasLongHighlight;
}

export function SearchResultCard({ result, index }: SearchResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const domain = getDomain(result.url);
  const showExpandButton = hasExpandableContent(result);

  // Summary priority: show summary if available, fall back to text
  const primaryContent = result.summary ?? result.text;
  const hasFullText = result.text && result.summary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card 
        className="w-full transition-all duration-200 hover:shadow-lg hover:scale-[1.01] hover:border-primary/20 border border-transparent" 
        shadow="sm"
      >
        <CardBody className="p-3 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {result.image && (
              <div className="flex-shrink-0 hidden sm:block">
                <Image
                  src={result.image}
                  alt={result.title}
                  width={120}
                  height={90}
                  className="object-cover rounded-lg"
                  classNames={{
                    wrapper: "w-[120px] h-[90px]",
                  }}
                />
              </div>
            )}

            <div className="flex-1 min-w-0 flex flex-col gap-1.5 sm:gap-2">
              {/* Header with domain and relevance indicator */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar
                    src={getFaviconUrl(result.url)}
                    size="sm"
                    radius="sm"
                    className="w-5 h-5 flex-shrink-0"
                    showFallback
                    fallback={
                      <span className="text-xs text-default-500">
                        {domain.charAt(0).toUpperCase()}
                      </span>
                    }
                  />
                  <span className="text-tiny text-default-400 truncate">
                    {domain}
                  </span>
                </div>
                <RelevanceIndicator score={result.score} />
              </div>

              {/* Title */}
              <Link
                href={result.url}
                isExternal
                showAnchorIcon
                anchorIcon={<ExternalLink className="w-3.5 h-3.5 ml-1" />}
                className="text-foreground hover:text-primary transition-colors"
              >
                <h3 className="text-base sm:text-lg font-semibold line-clamp-2">
                  {result.title}
                </h3>
              </Link>

              {/* Primary content (summary or text) */}
              {primaryContent && (
                <p
                  className={`text-small text-default-500 ${
                    isExpanded ? "" : "line-clamp-2 sm:line-clamp-3"
                  }`}
                >
                  {primaryContent}
                </p>
              )}

              {/* Full text in expanded view when summary exists */}
              {isExpanded && hasFullText && (
                <div className="mt-2 p-3 bg-default-50 rounded-lg">
                  <p className="text-small text-default-600">{result.text}</p>
                </div>
              )}

              {/* Highlights section */}
              <HighlightSection
                highlights={result.highlights}
                highlightScores={result.highlightScores}
                isExpanded={isExpanded}
              />

              {/* Metadata section */}
              <MetadataSection
                author={result.author}
                publishedDate={result.publishedDate}
              />

              {/* Expand/Collapse button */}
              {showExpandButton && (
                <Button
                  size="sm"
                  variant="light"
                  className="self-start mt-1"
                  onPress={() => setIsExpanded(!isExpanded)}
                  endContent={
                    isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )
                  }
                >
                  {isExpanded ? "Show less" : "Show more"}
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
