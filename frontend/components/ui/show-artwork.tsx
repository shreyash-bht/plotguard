"use client";

import { Clapperboard, Monitor, Film } from "lucide-react";

import { cn } from "@/lib/cn";
import type { ContentType } from "@/types/content";

const gradients = [
  "from-violet-950 via-violet-900/60 to-zinc-950",
  "from-indigo-950 via-indigo-900/60 to-zinc-950",
  "from-fuchsia-950 via-fuchsia-900/50 to-zinc-950",
  "from-blue-950 via-blue-900/60 to-zinc-950",
  "from-purple-950 via-purple-900/60 to-zinc-950",
  "from-slate-950 via-zinc-900/80 to-zinc-950",
];

/** Stable value derived from the content id — keeps art deterministic per show. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const typeIcons: Record<ContentType, typeof Clapperboard> = {
  ANIME: Clapperboard,
  TV_SHOW: Monitor,
  MOVIE: Film,
};

/**
 * Content entities carry no artwork field, so posters are generated
 * placeholders: a deterministic gradient plus the title's leading letter.
 */
export function ShowArtwork({
  contentId,
  title,
  contentType,
  className,
}: {
  contentId: string;
  title: string;
  contentType: ContentType;
  className?: string;
}) {
  const gradient = gradients[hashString(contentId) % gradients.length];
  const letter = title.charAt(0).toUpperCase();
  const Icon = typeIcons[contentType];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-b",
        gradient,
        className,
      )}
    >
      <Icon
        aria-hidden
        className="absolute bottom-3 left-3 size-4 text-white/25"
      />
      <span
        aria-hidden
        className="text-4xl font-semibold text-white/40 select-none"
      >
        {letter}
      </span>
      {/* sheen */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/5"
      />
    </div>
  );
}
