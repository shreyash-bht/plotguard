"use client";

import { useEffect, useMemo, useState } from "react";

import { EpisodeSelector } from "@/components/episode/episode-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  groupStoryUnits,
  episodeShortLabel,
  episodeLongLabel,
} from "@/lib/episodes";
import { listSeasons, listStoryUnits } from "@/services/content";
import { patchConversationBoundary } from "@/services/conversations";
import { ApiError } from "@/services/api-client";
import { useConversationStore } from "@/stores/conversations";
import { useSessionStore } from "@/stores/session";
import type { Season, StoryUnit } from "@/types/content";

export interface BoundaryModalProps {
  open: boolean;
  onClose: () => void;
  conversationId: string;
}

/**
 * Lets the user raise (or lower) the spoiler boundary of an existing
 * conversation. The change takes effect immediately for the next message.
 */
export function BoundaryModal({ open, onClose, conversationId }: BoundaryModalProps) {
  const save = useConversationStore((s) => s.save);
  const conversation = useConversationStore((s) => s.map[conversationId]);
  const user = useSessionStore((s) => s.user);

  const [storyUnits, setStoryUnits] = useState<StoryUnit[] | null>(null);
  const [seasons, setSeasons] = useState<Season[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<StoryUnit | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [saving, setSaving] = useState(false);
  const [patchError, setPatchError] = useState<string | null>(null);

  const load = useMemo(
    () => async (contentId: string, currentMaxOrder: number | undefined, signal: AbortSignal) => {
      try {
        const [units, seasonsData] = await Promise.all([
          listStoryUnits(contentId, signal),
          listSeasons(contentId, signal).catch(() => [] as Season[]),
        ]);
        if (signal.aborted) return;
        setStoryUnits(units);
        setSeasons(seasonsData);
        const current = units.find(
          (u) => (u.storyOrder ?? u.unitNumber) === currentMaxOrder,
        );
        const currentSeason = current?.seasonId
          ? seasonsData.find((s) => s.seasonId === current.seasonId) ?? null
          : null;
        if (current) {
          setSelected(current);
          setSelectedSeason(currentSeason);
        }
      } catch (err) {
        if (!signal.aborted) {
          setError(
            err instanceof ApiError
              ? err.message
              : "Could not load episodes for this show.",
          );
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!open || !conversation) return;
    const controller = new AbortController();
    // Deferred: kicks off async loading outside the effect's synchronous pass
    // (React lint: no cascading setState in effects).
    queueMicrotask(() =>
      void load(conversation.content_id, conversation.max_story_order, controller.signal),
    );
    return () => controller.abort();
  }, [open, conversation, load]);

  if (!conversation) return null;

  const confirm = async () => {
    if (!selected || !conversation || !user) return;
    const maxStoryOrder = selected.storyOrder ?? selected.unitNumber;
    // Optimistic: the per-request boundary governs the next chat call, so the
    // local update alone makes the change effective immediately.
    save({
      conversation_id: conversation.conversation_id,
      content_id: conversation.content_id,
      max_story_order: maxStoryOrder,
      showTitle: conversation.showTitle,
      boundaryLabel: episodeShortLabel(selected, selectedSeason),
      boundaryLongLabel: episodeLongLabel(selected, selectedSeason),
      lastActiveAt: new Date().toISOString(),
      // Boundary moved after messages were exchanged — flag for UI.
      boundaryChanged: true,
    });
    setSaving(true);
    setPatchError(null);
    try {
      await patchConversationBoundary(conversation.conversation_id, {
        user_id: user.userId,
        max_story_order: maxStoryOrder,
      });
      onClose();
    } catch (err) {
      setPatchError(
        err instanceof ApiError
          ? err.message
          : "Could not sync the boundary to the server. It still applies to this chat.",
      );
    } finally {
      setSaving(false);
    }
  };

  const groups = groupStoryUnits(storyUnits ?? [], seasons ?? []);

  return (
    <Modal open={open} onClose={onClose} title="Change spoiler boundary">
      <p className="text-[13px] leading-relaxed text-mute">
        Changing this may expose{" "}
        <span className="text-zinc-100">additional story information</span>{" "}
        you haven&apos;t seen yet, for the rest of this conversation. Ask
        carefully after raising the boundary. Current:{" "}
        <Badge tone="accent" className="mx-0.5 align-middle">
          {conversation.boundaryLabel}
        </Badge>
      </p>

      <div className="mt-4 max-h-72 overflow-y-auto pr-1">
        {error ? (
          <div className="rounded-lg border border-danger/25 bg-danger/5 px-3 py-2 text-[13px] text-danger">
            {error}
          </div>
        ) : storyUnits === null ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : storyUnits.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-[13px] text-faint">
            No episodes registered for this show.
          </div>
        ) : (
          <EpisodeSelector
            groups={groups}
            selected={selected}
            onSelect={(unit, season) => {
              setSelected(unit);
              setSelectedSeason(season);
            }}
          />
        )}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        {patchError ? (
          <p className="mr-auto max-w-56 text-right text-[12px] leading-snug text-danger">
            {patchError}
          </p>
        ) : null}
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="primary"
          disabled={!selected || !user}
          loading={saving}
          onClick={() => void confirm()}
          size="sm"
          className="h-9 px-3.5 text-[13px]"
        >
          Update boundary
        </Button>
      </div>
    </Modal>
  );
}
