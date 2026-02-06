"use client";

import { Tabs, Tab } from "@heroui/react";
import { Icon } from "@iconify/react";

export type SearchMode = "search" | "answer" | "research";

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
        tab: "px-3 h-9",
        tabContent: "group-data-[selected=true]:text-primary-foreground",
      }}
    >
      <Tab
        key="search"
        title={
          <div className="flex items-center gap-1.5">
            <Icon icon="solar:magnifer-linear" className="w-4 h-4" />
            <span>Search</span>
          </div>
        }
      />
      <Tab
        key="answer"
        title={
          <div className="flex items-center gap-1.5">
            <Icon icon="solar:chat-round-dots-linear" className="w-4 h-4" />
            <span>Answer</span>
          </div>
        }
      />
    </Tabs>
  );
}
