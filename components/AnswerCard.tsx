"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Listbox,
  ListboxItem,
  Avatar,
  Link,
} from "@heroui/react";
import { Sparkles, ChevronDown, ChevronUp, Search, Link2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Citation } from "@/lib/types";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface AnswerCardProps {
  answer: string;
  citations: Citation[];
  onViewSearchResults: () => void;
}

const COLLAPSE_THRESHOLD = 800;

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

// Custom Markdown components
const markdownComponents: Components = {
  a: ({ href, children }) => (
    <Link
      href={href}
      isExternal
      showAnchorIcon
      className="text-primary inline-flex items-center gap-0.5"
    >
      {children}
    </Link>
  ),
  p: ({ children }) => (
    <p className="text-default-700 leading-relaxed mb-3 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="text-default-700 list-disc pl-5 mb-3 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-default-700 list-decimal pl-5 mb-3 space-y-1">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-default-700">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="text-default-800 font-semibold">{children}</strong>
  ),
  code: ({ children, className }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="text-primary bg-default-100 px-1.5 py-0.5 rounded text-sm">
          {children}
        </code>
      );
    }
    return (
      <code className={className}>{children}</code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-default-100 text-default-700 p-3 rounded-lg overflow-x-auto mb-3 text-sm">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-3 border-primary pl-4 italic text-default-600 mb-3">
      {children}
    </blockquote>
  ),
};

export function AnswerCard({
  answer,
  citations,
  onViewSearchResults,
}: AnswerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongAnswer = answer.length > COLLAPSE_THRESHOLD;
  const displayedAnswer = isExpanded || !isLongAnswer 
    ? answer 
    : answer.slice(0, COLLAPSE_THRESHOLD) + "...";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Card className="w-full" shadow="sm">
        <CardBody className="p-4 gap-3">
          {/* AI Indicator Header */}
          <div className="flex items-center gap-2">
            <Avatar
              size="sm"
              icon={<Sparkles className="w-4 h-4" />}
              classNames={{
                base: "bg-primary/10 w-7 h-7",
                icon: "text-primary",
              }}
            />
            <span className="text-small font-medium text-default-600">Exa AI</span>
          </div>

          {/* Answer Text with Markdown */}
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {displayedAnswer}
            </ReactMarkdown>
          </div>

          {/* Expand/Collapse for long answers */}
          {isLongAnswer && (
            <Button
              size="sm"
              variant="light"
              className="self-start -mt-1"
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

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-default-100">
            <div className="flex items-center gap-2">
              {/* Sources Popover */}
              {citations && citations.length > 0 && (
                <Popover placement="top-start" showArrow>
                  <PopoverTrigger>
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<Link2 className="w-3.5 h-3.5" />}
                      className="text-default-500"
                    >
                      {citations.length} sources
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-80">
                    <Listbox
                      aria-label="Sources"
                      className="p-2"
                      itemClasses={{
                        base: "px-3 py-2 rounded-lg data-[hover=true]:bg-default-100",
                      }}
                    >
                      {citations.map((citation) => (
                        <ListboxItem
                          key={citation.id}
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          startContent={
                            <Avatar
                              size="sm"
                              src={getFaviconUrl(citation.url)}
                              className="w-5 h-5 shrink-0"
                              radius="sm"
                            />
                          }
                          endContent={
                            <ExternalLink className="w-3.5 h-3.5 text-default-400 shrink-0" />
                          }
                          description={getDomain(citation.url)}
                        >
                          <span className="line-clamp-1">{citation.title}</span>
                        </ListboxItem>
                      ))}
                    </Listbox>
                  </PopoverContent>
                </Popover>
              )}
              
              <Button
                variant="light"
                color="default"
                size="sm"
                startContent={<Search className="w-3.5 h-3.5" />}
                onPress={onViewSearchResults}
                className="text-default-500"
              >
                Search
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
