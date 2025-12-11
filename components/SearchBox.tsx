"use client";

import { Button, Tooltip, Card, CardBody } from "@heroui/react";
import { Search, Zap, ArrowUp } from "lucide-react";
import { SearchMode } from "./SearchModeToggle";

interface SearchBoxProps {
  query: string;
  onQueryChange: (query: string) => void;
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export function SearchBox({
  query,
  onQueryChange,
  mode,
  onModeChange,
  onSubmit,
  isLoading,
  placeholder,
}: SearchBoxProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const defaultPlaceholder = mode === "search" ? "Search anything..." : "Ask a question...";

  return (
    <Card shadow="md" className="w-full">
      <CardBody className="p-4">
        <textarea
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || defaultPlaceholder}
          rows={2}
          className="w-full bg-transparent resize-none outline-none text-foreground placeholder:text-default-400 text-base"
        />
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <Tooltip content="Search - Find web results">
              <Button
                isIconOnly
                size="sm"
                variant={mode === "search" ? "flat" : "light"}
                color={mode === "search" ? "primary" : "default"}
                onPress={() => onModeChange("search")}
                className="w-8 h-8"
              >
                <Search className="w-4 h-4" />
              </Button>
            </Tooltip>
            
            <Tooltip content="Chat - Get AI answer">
              <Button
                isIconOnly
                size="sm"
                variant={mode === "answer" ? "flat" : "light"}
                color={mode === "answer" ? "primary" : "default"}
                onPress={() => onModeChange("answer")}
                className="w-8 h-8"
              >
                <Zap className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>

          <Button
            isIconOnly
            size="sm"
            color={query.trim() ? "primary" : "default"}
            variant="flat"
            onPress={onSubmit}
            isLoading={isLoading}
            isDisabled={!query.trim()}
            className="w-9 h-9 rounded-lg"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
