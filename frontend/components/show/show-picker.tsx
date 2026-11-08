"use client";

import { ArrowUpRight, Search, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ShowArtwork } from "@/components/ui/show-artwork";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { listContents } from "@/services/content";
import { ApiError } from "@/services/api-client";
import { contentTypeLabel, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Content } from "@/types/content";

type Filter = "all" | Content["contentType"];

const filters: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "All" },
  { value: "ANIME", label: "Anime" },
  { value: "TV_SHOW", label: "TV Shows" },
  { value: "MOVIE", label: "Movies" },
];

function ShowCard({ content }: { content: Content }) {
  return (
    <Link
      href={`/select?show=${content.contentId}`}
      className="group overflow-hidden rounded-xl border border-line bg-panel transition-colors hover:border-line-strong"
    >
      <ShowArtwork
        contentId={content.contentId}
        title={content.title}
        contentType={content.contentType}
        className="aspect-[16/10] rounded-none border-b border-line"
      />
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium text-zinc-100">
              {content.title}
            </h3>
            <p className="mt-0.5 text-[12px] text-faint">
              {[
                contentTypeLabel(content.contentType),
                content.releaseDate ? formatDate(content.releaseDate) : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>
    </Link>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-line bg-panel"
        >
          <Skeleton className="aspect-[16/10] rounded-none" />
          <div className="space-y-2 p-3.5">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export interface ShowPickerProps {
  /** Hide the search/filter row (e.g. compact contexts). */
  compact?: boolean;
}

export function ShowPicker({ compact = false }: ShowPickerProps) {
  const [contents, setContents] = useState<Content[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const load = useMemo(
    () => async (signal: AbortSignal) => {
      try {
        const list = await listContents(signal);
        if (signal.aborted) return;
        setContents([...list].sort((a, b) => a.title.localeCompare(b.title)));
        setError(null);
      } catch (err) {
        if (signal.aborted) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Something went wrong while loading shows.",
        );
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    // Deferred: kicks off async loading outside the effect's synchronous pass
    // (React lint: no cascading setState in effects).
    queueMicrotask(() => void load(controller.signal));
    return () => controller.abort();
  }, [load]);

  const visible = useMemo(() => {
    if (!contents) return null;
    const q = query.trim().toLowerCase();
    return contents.filter(
      (c) =>
        (filter === "all" || c.contentType === filter) &&
        (q === "" || c.title.toLowerCase().includes(q)),
    );
  }, [contents, query, filter]);

  if (error) {
    return (
      <div className="rounded-xl border border-line bg-panel p-6 text-center">
        <TriangleAlert className="mx-auto size-5 text-danger" />
        <p className="mt-2 text-sm text-mute">{error}</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => void load(new AbortController().signal)}
        >
          Try again
        </Button>
      </div>
    );
  }

  if (visible === null) {
    return <GridSkeleton />;
  }

  return (
    <div>
      {!compact ? (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "h-7 rounded-full px-3 text-[12px] font-medium transition-colors",
                  filter === f.value
                    ? "bg-accent/15 text-accent ring-1 ring-accent/30"
                    : "text-mute ring-1 ring-line hover:bg-hover hover:text-zinc-100",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-faint" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shows…"
              className="h-9 w-full rounded-lg border border-line bg-raise pr-3 pl-8 text-sm text-zinc-100 placeholder:text-faint focus:border-accent/40 focus:outline-none"
            />
          </div>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line px-6 py-14 text-center">
          <p className="text-sm font-medium text-zinc-100">
            {contents && contents.length === 0
              ? "No shows available yet"
              : "No matches"}
          </p>
          <p className="mt-1 text-[13px] text-faint">
            {contents && contents.length === 0
              ? "Content hasn't been added on the backend yet. Check back soon."
              : "Try a different search term or filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {visible.map((content) => (
            <ShowCard key={content.contentId} content={content} />
          ))}
        </div>
      )}
    </div>
  );
}
