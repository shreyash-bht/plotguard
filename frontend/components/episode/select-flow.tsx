"use client";

import { ArrowLeft, Loader2, Lock, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EpisodeSelector } from "@/components/episode/episode-selector";
import { ShowPicker } from "@/components/show/show-picker";
import { ShowArtwork } from "@/components/ui/show-artwork";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGuestSession } from "@/hooks/use-guest-session";
import {
  episodeLongLabel,
  episodeShortLabel,
  groupStoryUnits,
  type EpisodeGroup,
} from "@/lib/episodes";
import { contentTypeLabel } from "@/lib/format";
import { createConversation } from "@/services/chat";
import { ApiError } from "@/services/api-client";
import {
  getContent,
  listSeasons,
  listStoryUnits,
} from "@/services/content";
import { useConversationStore } from "@/stores/conversations";
import type { Content, Season, StoryUnit } from "@/types/content";

export function SelectFlow({ initialShowId }: { initialShowId?: string }) {  const router = useRouter();
  const user = useGuestSession().user;
  const [content, setContent] = useState<Content | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [units, setUnits] = useState<StoryUnit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<StoryUnit | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = useCallback(
    async (showId: string, signal: AbortSignal) => {
      let result: [Content, Season[], StoryUnit[]] | null;
      try {
        result = await Promise.all([
          getContent(showId, signal),
          listSeasons(showId, signal),
          listStoryUnits(showId, signal),
        ]);
      } catch (err) {
        if (signal.aborted) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Something went wrong while loading this show.",
        );
        return;
      }
      if (signal.aborted) return;
      const [contentData, seasonsData, unitsData] = result;
      setContent(contentData);
      setSeasons(seasonsData);
      setUnits(unitsData);
    },
    [],
  );

  useEffect(() => {
    if (!initialShowId) return;
    const controller = new AbortController();
    // Deferred: kicks off async loading outside the effect's synchronous pass
    // (React lint: no cascading setState in effects).
    queueMicrotask(() => void load(initialShowId, controller.signal));
    return () => controller.abort();
  }, [initialShowId, load]);

  const groups = useMemo<EpisodeGroup[]>(
    () => groupStoryUnits(units, seasons),
    [units, seasons],
  );

  const confirm = useCallback(async () => {
    if (!user || !content || !selected) return;
    setCreating(true);
    setCreateError(null);
    try {
      const conversation = await createConversation({
        user_id: user.userId,
        content_id: content.contentId,
        max_story_order: selected.storyOrder ?? selected.unitNumber,
      });
      useConversationStore.getState().save({
        conversation_id: conversation.conversation_id,
        content_id: content.contentId,
        max_story_order: conversation.max_story_order,
        showTitle: content.title,
        boundaryLabel: episodeShortLabel(selected, selectedSeason),
        boundaryLongLabel: episodeLongLabel(selected, selectedSeason),
        lastActiveAt: new Date().toISOString(),
      });
      router.push(`/chat/${conversation.conversation_id}`);
    } catch (err) {
      setCreateError(
        err instanceof ApiError
          ? err.message
          : "Could not start the conversation. Please try again.",
      );
    } finally {
      setCreating(false);
    }
  }, [user, content, selected, selectedSeason, router]);

  const isErrored = initialShowId !== undefined && error !== null && content === null;
  const isLoading = initialShowId !== undefined && content === null && error === null;

  // ---- Step 1: choose a show ---------------------------------------------
  if (!initialShowId || isErrored) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-16 sm:px-6 lg:px-8">
        {initialShowId ? (
          <div className="mb-8 flex items-start gap-3 rounded-xl border border-line bg-panel p-4">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-danger" />
            <div>
              <p className="text-sm text-zinc-100">{error}</p>
              <p className="mt-1 text-[13px] text-faint">
                You can pick a different show below.
              </p>
            </div>
          </div>
        ) : null}
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
              Choose a show
            </h1>
            <p className="mt-1 text-[13px] text-mute">
              Pick an anime or show, then lock the episode you&apos;ve watched up to.
            </p>
          </div>
        </div>
        <ShowPicker />
      </div>
    );
  }

  // ---- Step 2: lock the episode ------------------------------------------
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-40 sm:px-6 lg:px-8">
      {isLoading ? (
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3">
            <div className="aspect-[16/10] animate-pulse rounded-xl bg-raise" />
            <div className="h-5 w-2/3 animate-pulse rounded bg-raise" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-raise" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="h-11 animate-pulse rounded-lg bg-raise"
              />
            ))}
          </div>
        </div>
      ) : content ? (
        <>
          <div className="mb-3">
            <Link
              href="/select"
              className="inline-flex items-center gap-1.5 text-[13px] text-mute transition-colors hover:text-zinc-100"
            >
              <ArrowLeft className="size-3.5" />
              Choose a different show
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            {/* Show summary */}
            <div>
              <div className="overflow-hidden rounded-xl border border-line">
                <ShowArtwork
                  contentId={content.contentId}
                  title={content.title}
                  contentType={content.contentType}
                  className="aspect-[16/10]"
                />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge tone="accent">
                  {contentTypeLabel(content.contentType)}
                </Badge>
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50">
                {content.title}
              </h1>
              {content.description ? (
                <p className="mt-2 text-[13px] leading-relaxed text-mute">
                  {content.description}
                </p>
              ) : null}
            </div>

            {/* Episodes */}
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
                  Where are you in the story?
                </h2>
                <p className="mt-1 text-[13px] text-mute">
                  Select the last episode you finished watching.
                </p>
              </div>
              {units.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line px-6 py-14 text-center">
                  <p className="text-sm font-medium text-zinc-100">
                    No episodes registered yet
                  </p>
                  <p className="mt-1 text-[13px] text-faint">
                    This show&apos;s story units haven&apos;t been added on the
                    backend, so there&apos;s nothing to chat about yet.
                  </p>
                </div>
              ) : (
                <EpisodeSelector
                  groups={groups}
                  selected={selected}
                  onSelect={(unit, season) => {
                    setSelected(unit);
                    setSelectedSeason(season);
                    setCreateError(null);
                  }}
                />
              )}
            </div>
          </div>

          {/* Boundary confirm bar */}
          {selected ? (
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-panel/95 pt-3 pb-4 backdrop-blur-sm lg:left-[264px]">
              <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-accent">
                      <Lock className="size-3" />
                      Your spoiler boundary
                    </p>
                    <p className="mt-1 truncate text-sm text-zinc-100">
                      <span className="font-medium">{content.title}</span>
                      <span className="text-mute">
                        {" "}· Watched until{" "}
                        {episodeLongLabel(selected, selectedSeason)}
                        {selected.title ? ` — “${selected.title}”` : ""}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[12px] text-faint">
                      Nothing beyond this episode will reach you in this
                      conversation.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {createError ? (
                      <span className="hidden max-w-64 text-[12px] text-danger sm:block">
                        {createError}
                      </span>
                    ) : null}
                    {!user ? (
                      <div className="flex items-center gap-2 text-[13px] text-faint">
                        <Loader2 className="size-3.5 animate-spin" />
                        Setting up your session…
                      </div>
                    ) : null}
                    <Button
                      variant="primary"
                      loading={creating}
                      disabled={!user}
                      onClick={() => void confirm()}
                    >
                      Confirm and start chatting
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
