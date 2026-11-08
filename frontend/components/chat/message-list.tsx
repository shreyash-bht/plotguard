"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect, useRef } from "react";

import { Markdown } from "@/components/chat/markdown";
import type { ChatMessage } from "@/types/chat-message";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/cn";

function AssistantAvatar() {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[10px] font-semibold text-accent ring-1 ring-accent/25">
      PG
    </span>
  );
}

const Dots = () => (
  <span className="inline-flex items-center gap-1 py-1.5">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="size-1.5 animate-bounce rounded-full bg-accent/70"
        style={{ animationDelay: `${i * 0.15}s`, animationDuration: "1s" }}
      />
    ))}
  </span>
);

export interface MessageListProps {
  messages: ChatMessage[];
  /** The message id currently awaiting the AI response. */
  pendingId: string | null;
  onRetry?: () => void;
}

export function MessageList({ messages, pendingId, onRetry }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages and while awaiting the answer.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pendingId]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6">
      {messages.map((message) => {
        if (message.error) {
          return (
            <div
              key={message.id}
              className="mx-auto flex w-full max-w-2xl items-center gap-2.5 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3"
            >
              <TriangleAlert className="size-4 shrink-0 text-danger" />
              <p className="min-w-0 flex-1 text-[13px] text-mute">{message.content}</p>
              {onRetry ? (
                <button
                  onClick={onRetry}
                  className="flex shrink-0 items-center gap-1.5 rounded-md border border-line px-2 py-1 text-[12px] text-zinc-100 transition-colors hover:bg-hover"
                >
                  <RefreshCw className="size-3" />
                  Retry
                </button>
              ) : null}
            </div>
          );
        }

        if (message.role === "user") {
          return (
            <div key={message.id} className="flex justify-end">
              <div className="max-w-[85%] sm:max-w-[75%]">
                <div
                  className={cn(
                    "inline-block rounded-2xl rounded-br-md bg-accent px-4 py-2.5",
                    "shadow-[0_2px_10px_rgba(124,108,246,0.18)]",
                  )}
                >
                  <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap text-white">
                    {message.content}
                  </p>
                </div>
                {message.createdAt ? (
                  <p className="mt-1 pr-1 text-right text-[11px] text-faint">
                    {formatTime(message.createdAt)}
                  </p>
                ) : null}
              </div>
            </div>
          );
        }

        const pending = message.id === pendingId;
        return (
          <div key={message.id} className="flex gap-3">
            <AssistantAvatar />
            <div className="min-w-0 flex-1 pt-0.5">
              {pending ? (
                <Dots />
              ) : (
                <>
                  <Markdown content={message.content} />
                  {message.createdAt ? (
                    <p className="mt-1.5 text-[11px] text-faint">
                      {formatTime(message.createdAt)}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </div>
        );
      })}
      <div ref={endRef} aria-hidden />
    </div>
  );
}
