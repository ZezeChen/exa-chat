"use client";

import { Link, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Citation } from "@/lib/types";

interface CitationListProps {
  citations: Citation[];
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

export function CitationList({ citations }: CitationListProps) {
  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-small font-medium text-default-600">
          Sources ({citations.length})
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {citations.map((citation, index) => (
          <Link
            key={citation.id || index}
            href={citation.url}
            isExternal
            className="flex items-center gap-2 p-2 rounded-lg bg-default-50 hover:bg-default-100 transition-colors group"
          >
            <Avatar
              src={getFaviconUrl(citation.url)}
              size="sm"
              radius="sm"
              className="w-5 h-5 flex-shrink-0"
              showFallback
              fallback={
                <span className="text-xs text-default-500">
                  {getDomain(citation.url).charAt(0).toUpperCase()}
                </span>
              }
            />
            <span className="text-small text-default-700 group-hover:text-primary truncate flex-1">
              {citation.title || getDomain(citation.url)}
            </span>
            <Icon icon="solar:arrow-right-up-linear" className="w-3.5 h-3.5 text-default-400 group-hover:text-primary flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
