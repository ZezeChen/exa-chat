"use client";

import { Chip } from "@heroui/react";
import { Calendar, User } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/date";

interface MetadataSectionProps {
  author?: string;
  publishedDate?: string;
}

export function MetadataSection({ author, publishedDate }: MetadataSectionProps) {
  const formattedDate = publishedDate ? formatRelativeTime(publishedDate) : null;

  const hasMetadata = formattedDate || author;
  if (!hasMetadata) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
      {formattedDate && (
        <Chip
          size="sm"
          variant="flat"
          startContent={<Calendar className="w-3 h-3" />}
          classNames={{
            base: "h-6 sm:h-7",
            content: "text-tiny sm:text-small px-1",
          }}
        >
          {formattedDate}
        </Chip>
      )}
      {author && (
        <Chip
          size="sm"
          variant="flat"
          startContent={<User className="w-3 h-3" />}
          classNames={{
            base: "h-6 sm:h-7",
            content: "max-w-[100px] sm:max-w-[120px] truncate text-tiny sm:text-small px-1",
          }}
        >
          {author}
        </Chip>
      )}
    </div>
  );
}
