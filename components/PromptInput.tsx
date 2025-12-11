"use client";

import React, { memo, useCallback } from "react";
import { Textarea, Button, Tooltip } from "@heroui/react";
import { cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { SearchMode } from "./SearchModeToggle";

interface PromptInputProps {
  value: string;
  onValueChange: (value: string) => void;
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const PromptInput = memo(function PromptInput({
  value,
  onValueChange,
  mode,
  onModeChange,
  onSubmit,
  isLoading,
}: PromptInputProps) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }, [onSubmit]);

  return (
    <form 
      className="rounded-xl bg-default-100 hover:bg-default-200/70 flex w-full flex-col items-start transition-colors"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Textarea
        aria-label="Prompt"
        className="min-h-[40px]"
        classNames={{
          label: "hidden",
          input: "py-0 pt-1 pl-2 pb-6 text-medium",
          inputWrapper: "!bg-transparent shadow-none",
          innerWrapper: "relative",
        }}
        minRows={2}
        maxRows={8}
        placeholder={
          mode === "search" 
            ? "Search anything..." 
            : mode === "answer" 
              ? "Ask a question..." 
              : "Ask a coding question..."
        }
        radius="lg"
        value={value}
        variant="flat"
        onValueChange={onValueChange}
        onKeyDown={handleKeyDown}
        endContent={
          <div className="flex items-end gap-2">
            <Tooltip showArrow content="Send">
              <Button
                isIconOnly
                color={!value.trim() ? "default" : "primary"}
                isDisabled={!value.trim() || isLoading}
                isLoading={isLoading}
                radius="lg"
                size="sm"
                variant="solid"
                type="submit"
              >
                <Icon icon="solar:arrow-up-linear" className={cn("w-5 h-5", !value.trim() ? "text-default-600" : "text-primary-foreground")} />
              </Button>
            </Tooltip>
          </div>
        }
      />
      <div className="flex w-full items-center justify-between gap-2 px-4 pb-4">
        <div className="flex gap-1">
          <Tooltip showArrow content="Search - Find web results">
            <Button
              size="sm"
              variant={mode === "search" ? "flat" : "light"}
              color={mode === "search" ? "primary" : "default"}
              startContent={<Icon icon="solar:magnifer-linear" className="w-4 h-4" />}
              onPress={() => onModeChange("search")}
            >
              Search
            </Button>
          </Tooltip>
          <Tooltip showArrow content="Answer - Get AI answer">
            <Button
              size="sm"
              variant={mode === "answer" ? "flat" : "light"}
              color={mode === "answer" ? "primary" : "default"}
              startContent={<Icon icon="solar:bolt-linear" className="w-4 h-4" />}
              onPress={() => onModeChange("answer")}
            >
              Answer
            </Button>
          </Tooltip>
          <Tooltip showArrow content="Code - Programming assistant with context">
            <Button
              size="sm"
              variant={mode === "code" ? "flat" : "light"}
              color={mode === "code" ? "success" : "default"}
              startContent={<Icon icon="solar:code-bold" className="w-4 h-4" />}
              onPress={() => onModeChange("code")}
            >
              Code
            </Button>
          </Tooltip>
        </div>
        <p className="text-tiny text-default-400">{value.length}/2000</p>
      </div>
    </form>
  );
});
