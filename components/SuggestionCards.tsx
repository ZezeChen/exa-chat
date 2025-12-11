"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Icon } from "@iconify/react";
import { SearchMode } from "./SearchModeToggle";

interface SuggestionCardsProps {
  mode: SearchMode;
  onSelect: (suggestion: string) => void;
}

const searchSuggestions = {
  title: "Search Examples",
  icon: <Icon icon="solar:magnifer-linear" className="w-8 h-8 text-primary" />,
  items: [
    "Latest AI news and developments",
    "React best practices 2024",
    "Climate change solutions",
  ],
};

const answerSuggestions = {
  title: "Question Examples", 
  icon: <Icon icon="solar:bolt-linear" className="w-8 h-8 text-primary" />,
  items: [
    "What is machine learning?",
    "How does React work?",
    "Why is the sky blue?",
  ],
};

const capabilities = {
  title: "Capabilities",
  icon: <Icon icon="solar:lightbulb-linear" className="w-8 h-8 text-warning" />,
  items: [
    "Search the web with AI-powered results",
    "Get direct answers with citations",
    "Find relevant content from trusted sources",
  ],
};

export function SuggestionCards({ mode, onSelect }: SuggestionCardsProps) {
  const suggestions = mode === "search" ? searchSuggestions : answerSuggestions;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 w-full max-w-3xl">
      <Card className="bg-content2" shadow="none">
        <CardHeader className="flex flex-col gap-2 px-4 pt-6 pb-4 items-center">
          {suggestions.icon}
          <p className="text-medium text-content2-foreground">{suggestions.title}</p>
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          {suggestions.items.map((item, index) => (
            <button
              key={index}
              onClick={() => onSelect(item)}
              className="rounded-lg bg-content3 text-content3-foreground flex min-h-[50px] px-3 py-2 text-left hover:bg-content4 transition-colors cursor-pointer"
            >
              <p className="text-small">{item}</p>
            </button>
          ))}
        </CardBody>
      </Card>

      <Card className="bg-content2" shadow="none">
        <CardHeader className="flex flex-col gap-2 px-4 pt-6 pb-4 items-center">
          {capabilities.icon}
          <p className="text-medium text-content2-foreground">{capabilities.title}</p>
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          {capabilities.items.map((item, index) => (
            <div
              key={index}
              className="rounded-lg bg-content3 text-content3-foreground flex min-h-[50px] px-3 py-2"
            >
              <p className="text-small">{item}</p>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
