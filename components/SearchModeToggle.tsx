"use client";

import { Tabs, Tab } from "@heroui/react";
import { Search, MessageCircle } from "lucide-react";

export type SearchMode = "search" | "answer";

interface SearchModeToggleProps {
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
}

export function SearchModeToggle({ mode, onModeChange }: SearchModeToggleProps) {
  return (
    <Tabs
      selectedKey={mode}
      onSelectionChange={(key) => onModeChange(key as SearchMode)}
      aria-label="Search mode"
      color="primary"
      variant="bordered"
      size="md"
      classNames={{
        tabList: "gap-2",
        cursor: "bg-primary",
        tab: "px-4 h-9",
        tabContent: "group-data-[selected=true]:text-primary-foreground",
      }}
    >
      <Tab
        key="search"
        title={
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span>Search</span>
          </div>
        }
      />
      <Tab
        key="answer"
        title={
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span>Answer</span>
          </div>
        }
      />
    </Tabs>
  );
}
