"use client";

import React, { useState, useCallback, memo, useMemo } from "react";
import {
  Card,
  CardBody,
  Link,
  Avatar,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Divider,
  Image,
  Tooltip,
  CircularProgress,
  Spinner,
  Skeleton,
} from "@heroui/react";
import { useTheme } from "next-themes";
import { Icon } from "@iconify/react";
import { SearchResult } from "@/lib/types";
import { motion } from "framer-motion";
import { formatRelativeTime } from "@/lib/utils/date";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

// Calculate average highlight score
function getAverageHighlightScore(scores?: number[]): number | null {
  if (!scores || scores.length === 0) return null;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(avg * 100);
}

interface DetailedContent {
  text?: string;
  highlights?: string[];
  highlightScores?: number[];
  summary?: string;
}

interface SearchResultCardProps {
  result: SearchResult;
  index: number;
  query?: string;
  isFirst?: boolean;
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

// Escape special regex characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Highlight keywords in text
function highlightKeywords(text: string, query?: string): React.ReactNode {
  if (!query || !text) return text;
  
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
  if (keywords.length === 0) return text;
  
  try {
    const escapedKeywords = keywords.map(escapeRegex);
    const regex = new RegExp(`(${escapedKeywords.join("|")})`, "gi");
    const parts = text.split(regex);
    
    return parts.map((part, i) => {
      if (keywords.some(k => part.toLowerCase() === k.toLowerCase())) {
        return (
          <mark key={i} className="bg-warning-100 text-warning-700 px-0.5 rounded">
            {part}
          </mark>
        );
      }
      return part;
    });
  } catch {
    // If regex fails, return plain text
    return text;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// Create markdown components with theme-aware code highlighting
function createMarkdownComponents(isDark: boolean): any {
  return {
    p: ({ children }: any) => (
      <p className="text-small text-default-600 mb-2 last:mb-0">
        {children as React.ReactNode}
      </p>
    ),
    a: ({ href, children }: any) => (
      <Link
        href={href}
        isExternal
        showAnchorIcon
        anchorIcon={<Icon icon="solar:link-linear" className="w-3 h-3 ml-0.5" />}
        className="text-primary text-small"
      >
        {children as React.ReactNode}
      </Link>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-foreground">{children as React.ReactNode}</strong>
    ),
    em: ({ children }: any) => <em className="italic">{children as React.ReactNode}</em>,
    code: ({ className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      const codeString = String(children).replace(/\n$/, "");
      
      return match ? (
        <SyntaxHighlighter
          style={isDark ? oneDark : oneLight}
          language={match[1]}
          PreTag="div"
          className="rounded-lg text-small my-2"
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-default-100 px-1 py-0.5 rounded text-tiny font-mono" {...props}>
          {children}
        </code>
      );
    },
  ul: ({ children }: any) => (
    <ul className="list-disc pl-5 text-small text-default-600 space-y-1 my-2">
      {children as React.ReactNode}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal pl-5 text-small text-default-600 space-y-1 my-2">
      {children as React.ReactNode}
    </ol>
  ),
  li: ({ children }: any) => (
    <li className="text-small pl-1">{children as React.ReactNode}</li>
  ),
  h1: ({ children }: any) => (
    <h1 className="text-lg font-bold text-foreground mt-4 mb-2">{children as React.ReactNode}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-base font-bold text-foreground mt-3 mb-2">{children as React.ReactNode}</h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-small font-bold text-foreground mt-2 mb-1">{children as React.ReactNode}</h3>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-3 border-primary/50 pl-3 my-2 text-default-500 italic">
      {children as React.ReactNode}
    </blockquote>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-3 max-w-full">
      <table className="border-collapse border border-default-200 text-small whitespace-nowrap">
        {children as React.ReactNode}
      </table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-default-100">{children as React.ReactNode}</thead>
  ),
  tbody: ({ children }: any) => <tbody>{children as React.ReactNode}</tbody>,
  tr: ({ children }: any) => (
    <tr className="border-b border-default-200">{children as React.ReactNode}</tr>
  ),
  th: ({ children }: any) => (
    <th className="px-3 py-2 text-left font-semibold text-default-700 border border-default-200">
      {children as React.ReactNode}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-3 py-2 text-default-600 border border-default-200">
      {children as React.ReactNode}
    </td>
  ),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const SearchResultCard = memo(function SearchResultCard({ result, index, query, isFirst }: SearchResultCardProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [detailedContent, setDetailedContent] = useState<DetailedContent | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const markdownComponents = useMemo(() => createMarkdownComponents(isDark), [isDark]);
  
  const domain = getDomain(result.url);
  const formattedDate = result.publishedDate ? formatRelativeTime(result.publishedDate) : null;
  
  const description = result.summary ?? result.text;
  const shortPreview = description ? description.slice(0, 100) + (description.length > 100 ? "..." : "") : null;
  
  const highlightScore = getAverageHighlightScore(result.highlightScores);
  const scoreColor = highlightScore !== null 
    ? highlightScore > 80 ? "success" : highlightScore > 50 ? "warning" : "default"
    : "default";

  // Fetch detailed content when modal opens
  const fetchDetailedContent = useCallback(async () => {
    if (detailedContent || isLoadingDetail) return;
    
    setIsLoadingDetail(true);
    setDetailError(null);
    
    try {
      const response = await fetch("/api/contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [result.id] }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch content");
      }
      
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setDetailedContent(data.results[0]);
      }
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setIsLoadingDetail(false);
    }
  }, [result.id, detailedContent, isLoadingDetail]);

  const handleOpenModal = useCallback(() => {
    onOpen();
    fetchDetailedContent();
  }, [onOpen, fetchDetailedContent]);

  // Use detailed content if available, otherwise fall back to search result
  const displayText = detailedContent?.text ?? result.text;
  const displaySummary = detailedContent?.summary ?? result.summary;
  const displayHighlights = detailedContent?.highlights ?? result.highlights;
  const displayContent = displaySummary ?? displayText;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.03 }}
        className="group h-full"
      >
        <Card 
          className={`w-full h-full cursor-pointer transition-all overflow-hidden ${
            isFirst 
              ? "border-2 border-primary/30 bg-primary/5 hover:border-primary/50" 
              : "hover:shadow-md hover:bg-default-50"
          }`}
          shadow="sm"
          isPressable
          onPress={handleOpenModal}
        >
          <CardBody className="p-3 gap-2 relative">
            <div className="absolute top-2 right-2 z-10">
              {isFirst ? (
                <Chip
                  size="sm"
                  color="primary"
                  variant="solid"
                  classNames={{
                    base: "h-5",
                    content: "text-[10px] px-1.5 font-medium",
                  }}
                >
                  Best
                </Chip>
              ) : highlightScore !== null ? (
                <Tooltip content={`Relevance: ${highlightScore}%`}>
                  <div>
                    <CircularProgress
                      size="sm"
                      value={highlightScore}
                      color={scoreColor}
                      showValueLabel
                      classNames={{
                        svg: "w-8 h-8",
                        value: "text-[8px] font-semibold",
                      }}
                    />
                  </div>
                </Tooltip>
              ) : null}
            </div>

            <div className="flex items-center gap-1.5 min-w-0 pr-12">
              <Avatar
                src={getFaviconUrl(result.url)}
                size="sm"
                radius="sm"
                className="w-4 h-4 flex-shrink-0"
                showFallback
                fallback={
                  <span className="text-[8px] text-default-500">
                    {domain.charAt(0).toUpperCase()}
                  </span>
                }
              />
              <span className="text-tiny text-default-400 truncate flex-1">{domain}</span>
              {formattedDate && (
                <span className="text-tiny text-default-300 flex-shrink-0">{formattedDate}</span>
              )}
            </div>

            <h3 className="text-small font-semibold line-clamp-2 text-foreground leading-tight min-h-[2.5rem]">
              {highlightKeywords(result.title, query)}
            </h3>

            <p className="text-tiny text-default-500 line-clamp-2 min-h-[2rem] flex-1">
              {shortPreview ? highlightKeywords(shortPreview, query) : <span className="text-default-300">No description</span>}
            </p>

            <div 
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip content="Open link">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  color="primary"
                  as={Link}
                  href={result.url}
                  isExternal
                  className="w-7 h-7 min-w-0"
                >
                  <Icon icon="solar:arrow-right-up-linear" className="w-3.5 h-3.5" />
                </Button>
              </Tooltip>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          body: "py-4",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-2 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
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
                  <span className="text-small text-default-500">{domain}</span>
                  {formattedDate && (
                    <>
                      <span className="text-small text-default-300">•</span>
                      <span className="text-small text-default-500">{formattedDate}</span>
                    </>
                  )}
                  {result.author && (
                    <>
                      <span className="text-small text-default-300">•</span>
                      <span className="text-small text-default-500">{result.author}</span>
                    </>
                  )}

                </div>
                <h2 className="text-lg font-bold text-foreground pr-8">
                  {result.title}
                </h2>
              </ModalHeader>
              
              <Divider />
              
              <ModalBody>
                {isLoadingDetail ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-default-500">
                      <Spinner size="sm" color="primary" />
                      <span className="text-small">Loading detailed content...</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Skeleton className="w-full h-4 rounded" />
                      <Skeleton className="w-full h-4 rounded" />
                      <Skeleton className="w-3/4 h-4 rounded" />
                      <Skeleton className="w-full h-4 rounded" />
                      <Skeleton className="w-5/6 h-4 rounded" />
                    </div>
                  </div>
                ) : detailError ? (
                  <div className="text-center py-4">
                    <Icon icon="solar:danger-circle-linear" className="w-8 h-8 text-danger mx-auto mb-2" />
                    <p className="text-default-500">{detailError}</p>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      className="mt-2"
                      onPress={fetchDetailedContent}
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <>
                    {result.image && (
                      <div className="w-full max-h-48 rounded-lg overflow-hidden mb-4">
                        <Image
                          src={result.image}
                          alt={result.title}
                          className="w-full h-full object-cover"
                          removeWrapper
                        />
                      </div>
                    )}

                    {displayContent && (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {displayContent}
                        </ReactMarkdown>
                      </div>
                    )}

                    {displaySummary && displayText && displaySummary !== displayText && (
                      <>
                        <Divider className="my-4" />
                        <div>
                          <h4 className="text-small font-semibold text-default-700 mb-2 flex items-center gap-2">
                            <Icon icon="solar:document-text-linear" className="w-4 h-4" />
                            Full Content
                          </h4>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                              {displayText}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </>
                    )}

                    {displayHighlights && displayHighlights.length > 0 && (
                      <>
                        <Divider className="my-4" />
                        <div>
                          <h4 className="text-small font-semibold text-default-700 mb-2 flex items-center gap-2">
                            <Icon icon="solar:bookmark-linear" className="w-4 h-4" />
                            Key Highlights
                          </h4>
                          <div className="flex flex-col gap-2">
                            {displayHighlights.map((highlight, i) => (
                              <div key={i} className="border-l-3 border-primary/50 pl-3 py-1">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    ...markdownComponents,
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    p: ({ children }: any) => (
                                      <p className="text-small text-default-600 italic">
                                        {children as React.ReactNode}
                                      </p>
                                    ),
                                  }}
                                >
                                  {highlight}
                                </ReactMarkdown>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </ModalBody>
              
              <Divider />
              
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  as={Link}
                  href={result.url}
                  isExternal
                  showAnchorIcon
                  anchorIcon={<Icon icon="solar:arrow-right-up-linear" className="w-4 h-4 ml-1" />}
                >
                  Visit Site
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
});
