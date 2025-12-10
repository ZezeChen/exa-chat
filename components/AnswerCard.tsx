"use client";

import { useState } from "react";
import { Card, CardBody, Button, Divider } from "@heroui/react";
import { Sparkles, ChevronDown, ChevronUp, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Citation } from "@/lib/types";
import { CitationList } from "./CitationList";

interface AnswerCardProps {
  answer: string;
  citations: Citation[];
  onViewSearchResults: () => void;
}

const COLLAPSE_THRESHOLD = 500;

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full border border-primary/20" shadow="md">
        <CardBody className="p-4 sm:p-6 gap-4">
          {/* AI Indicator Header */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="text-small font-medium text-primary">AI Answer</span>
          </div>

          {/* Answer Text */}
          <div className="prose prose-sm max-w-none">
            {displayedAnswer.split("\n").map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="text-default-700 mb-2 last:mb-0">
                  {paragraph}
                </p>
              )
            ))}
          </div>

          {/* Expand/Collapse for long answers */}
          {isLongAnswer && (
            <Button
              size="sm"
              variant="light"
              className="self-start"
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

          {/* Citations */}
          {citations && citations.length > 0 && (
            <>
              <Divider />
              <CitationList citations={citations} />
            </>
          )}

          <Divider />

          {/* Footer with actions and attribution */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <Button
              variant="flat"
              color="default"
              size="sm"
              startContent={<Search className="w-4 h-4" />}
              onPress={onViewSearchResults}
            >
              View search results
            </Button>
            <span className="text-tiny text-default-400">Powered by Exa</span>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
