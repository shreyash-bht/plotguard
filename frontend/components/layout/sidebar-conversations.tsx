"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { formatTime } from "@/lib/format";
import { listConversations, fetchShowTitle } from "@/services/conversations";
import { useConversationStore } from "@/stores/conversations";
import { useSessionStore } from "@/stores/session";
import type { CoreConversation } from "@/types/conversation";

interface SidebarItem {
  conversationId: string;
  title: string;
  /** Present once the local display cache knows this conversation. */
  boundaryLabel: string | null;
  lastActiveAt: string;
}

/**
 * Recent conversations, hydrated from the backend (`GET
 * /api/conversations/user/{userId}`), with display titles merged from the
 * local cache and fetched on demand for conversations created elsewhere.
 */
export function SidebarConversations({ onNavigate }: { onNavigate?: () => void }) {
  const user = useSessionStore((s) => s.user);
  const refMap = useConversationStore((s) => s.map);
  const [conversations, setConversations] = useState<CoreConversation[] | null>(null);
  const [titleById, setTitleById] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    let alive = true;
    const controller = new AbortController();
    // Deferred: kicks off async loading outside the effect's synchronous pass
    // (React lint: no cascading setState in effects).
    queueMicrotask(() => {
      void listConversations(user.userId, controller.signal)
        .then(async (list) => {
          if (!alive) return;
          setConversations(list);
          // Titles for conversations with no local ref: fetch lazily.
          const missing = list.filter(
            (conversation) =>
              !refMap[conversation.conversationId]?.showTitle &&
              titleById[conversation.contentId] === undefined,
          );
          const fetched = await Promise.all(
            missing.map(async (conversation) => {
              const title = await fetchShowTitle(
                conversation.contentId,
                controller.signal,
              ).catch(() => null);
              return [conversation.contentId, title] as const;
            }),
          );
          if (!alive) return;
          setTitleById((prev) => {
            const next = { ...prev };
            let changed = false;
            for (const [contentId, title] of fetched) {
              if (title && next[contentId] !== title) {
                next[contentId] = title;
                changed = true;
              }
            }
            return changed ? next : prev;
          });
        })
        .catch(() => {
          if (alive && !controller.signal.aborted) setConversations([]);
        });
    });
    return () => {
      alive = false;
      controller.abort();
    };
    // The server list is the snapshot; local map/title merges are display-only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  const visible: SidebarItem[] | null =
    conversations === null
      ? null
      : conversations.map((conversation) => {
          const ref = refMap[conversation.conversationId];
          return {
            conversationId: conversation.conversationId,
            title:
              ref?.showTitle ??
              titleById[conversation.contentId] ??
              "Untitled show",
            boundaryLabel: ref?.boundaryLabel ?? null,
            lastActiveAt: ref?.lastActiveAt ?? conversation.updatedAt,
          };
        });

  return (
    <div className="px-3 pt-4">
      <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-faint">
        Recent
      </p>
      {visible === null ? (
        <div className="space-y-0.5 pb-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-9 animate-pulse rounded-lg bg-raise" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="px-2 pb-3 text-[12px] leading-relaxed text-faint">
          No conversations yet. Pick a show to start one.
        </p>
      ) : (
        <ul className="space-y-0.5 pb-3">
          {visible.map((item) => (
            <li key={item.conversationId}>
              <Link
                href={`/chat/${item.conversationId}`}
                onClick={onNavigate}
                className="block rounded-lg px-2 py-1.5 transition-colors hover:bg-hover/60"
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate text-[13px] text-mute">
                    {item.title}
                  </span>
                  <span className="shrink-0 text-[10px] text-faint">
                    {formatTime(item.lastActiveAt)}
                  </span>
                </span>
                {item.boundaryLabel ? (
                  <span className="mt-0.5 block truncate text-[11px] text-accent/80">
                    {item.boundaryLabel}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
