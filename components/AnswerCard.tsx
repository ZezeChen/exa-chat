"use client";

import { useState, memo, useMemo } from "react";
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
import { useTheme } from "next-themes";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { Citation } from "@/lib/types";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface AnswerCardProps {
  answer: string;
  citations: Citation[];
  onViewSearchResults: () => void;
  isCodeMode?: boolean;
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

// Create markdown components with theme-aware code highlighting
function createMarkdownComponents(isDark: boolean): Components {
  return {
    a: ({ href, children }) => (
      <Link
        href={href}
        isExternal
        showAnchorIcon
        className="text-primary inline-flex items-center gap-0.5"
      >
        {children as React.ReactNode}
      </Link>
    ),
    p: ({ children }) => (
      <p className="text-default-700 leading-relaxed mb-3 last:mb-0">{children as React.ReactNode}</p>
    ),
    ul: ({ children }) => (
      <ul className="text-default-700 list-disc pl-5 mb-3 space-y-1">{children as React.ReactNode}</ul>
    ),
    ol: ({ children }) => (
      <ol className="text-default-700 list-decimal pl-5 mb-3 space-y-1">{children as React.ReactNode}</ol>
    ),
    li: ({ children }) => (
      <li className="text-default-700 pl-1">{children as React.ReactNode}</li>
    ),
    strong: ({ children }) => (
      <strong className="text-default-800 font-semibold">{children as React.ReactNode}</strong>
    ),
    code: ({ className, children }) => {
      const match = /language-(\w+)/.exec(className || "");
      const codeString = String(children).replace(/\n$/, "");
      
      if (match) {
        return (
          <SyntaxHighlighter
            style={(isDark ? oneDark : oneLight) as { [key: string]: React.CSSProperties }}
            language={match[1]}
            PreTag="div"
            className="rounded-lg text-sm my-3"
          >
            {codeString}
          </SyntaxHighlighter>
        );
      }
      return (
        <code className="text-primary bg-default-100 px-1.5 py-0.5 rounded text-sm">
          {children}
        </code>
      );
    },
    blockquote: ({ children }) => (
      <blockquote className="border-l-3 border-primary pl-4 italic text-default-600 mb-3">
        {children as React.ReactNode}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-3 max-w-full">
        <table className="border-collapse border border-default-200 text-sm whitespace-nowrap">
          {children as React.ReactNode}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-default-100">{children as React.ReactNode}</thead>
    ),
    tbody: ({ children }) => <tbody>{children as React.ReactNode}</tbody>,
    tr: ({ children }) => (
      <tr className="border-b border-default-200">{children as React.ReactNode}</tr>
    ),
    th: ({ children }) => (
      <th className="px-3 py-2 text-left font-semibold text-default-700 border border-default-200">
        {children as React.ReactNode}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 text-default-600 border border-default-200">
        {children as React.ReactNode}
      </td>
    ),
  };
}

export const AnswerCard = memo(function AnswerCard({
  answer,
  citations,
  onViewSearchResults,
  isCodeMode = false,
}: AnswerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const markdownComponents = useMemo(() => createMarkdownComponents(isDark), [isDark]);
  
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
              icon={<Icon icon={isCodeMode ? "solar:code-bold" : "solar:stars-bold"} className="w-4 h-4" />}
              classNames={{
                base: isCodeMode ? "bg-success/10 w-7 h-7" : "bg-primary/10 w-7 h-7",
                icon: isCodeMode ? "text-success" : "text-primary",
              }}
            />
            <span className="text-small font-medium text-default-600">
              {isCodeMode ? "Code Assistant" : "Exa AI"}
            </span>
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
                  <Icon icon="solar:alt-arrow-up-linear" className="w-4 h-4" />
                ) : (
                  <Icon icon="solar:alt-arrow-down-linear" className="w-4 h-4" />
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
                      startContent={<Icon icon="solar:link-linear" className="w-3.5 h-3.5" />}
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
                            <Icon icon="solar:arrow-right-up-linear" className="w-3.5 h-3.5 text-default-400 shrink-0" />
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
                startContent={<Icon icon="solar:magnifer-linear" className="w-3.5 h-3.5" />}
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
});
