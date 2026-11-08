"use client";

import { ArrowLeft, Shield, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { BoundaryModal } from "@/components/chat/boundary-modal";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import { SuggestedQuestions } from "@/components/chat/suggested-questions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sendChatMessage } from "@/services/chat";
import { ApiError } from "@/services/api-client";
import { useConversationStore } from "@/stores/conversations";
import type { ChatMessage } from "@/types/chat-message";

function newId(): string {
  if (typeof crypto?.randomUUID === "function") return crypto.randomUUID();
  return `m-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export interface ChatViewProps {
  conversationId: string;
}

export function ChatView({ conversationId }: ChatViewProps) {
  const conversation = useConversationStore((s) => s.map[conversationId]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [boundaryOpen, setBoundaryOpen] = useState(false);
  /** Preserved so "Retry" can re-send the failed question. */
  const lastFailedQuestion = useRef<string | null>(null);

  const ask = useCallback(
    async (question: string) => {
      if (!conversation) return;
      const userMessage: ChatMessage = {
        id: newId(),
        role: "user",
        content: question,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      const answerId = newId();
      setMessages((prev) => [...prev, { id: answerId, role: "assistant", content: "" }]);
      setPendingId(answerId);
      lastFailedQuestion.current = question;

      try {
        const response = await sendChatMessage({
          conversation_id: conversation.conversation_id,
          content_id: conversation.content_id,
          max_story_order: conversation.max_story_order,
          user_question: question,
          is_send_metadata: false,
        });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === answerId
              ? { ...m, content: response.answer, createdAt: new Date().toISOString() }
              : m,
          ),
        );
        lastFailedQuestion.current = null;
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === answerId
              ? {
                  ...m,
                  content:
                    err instanceof ApiError
                      ? err.message
                      : "Something went wrong while generating the answer. Try again.",
                  error: true,
                }
              : m,
          ),
        );
      } finally {
        setPendingId(null);
      }
    },
    [conversation],
  );

  const retry = useCallback(() => {
    const question = lastFailedQuestion.current;
    if (!question) return;
    setMessages((prev) => {
      // Drop the trailing error bubble + its question, then re-ask fresh.
      const withoutError = [...prev];
      if (withoutError.length >= 2 && withoutError[withoutError.length - 1].error) {
        withoutError.pop();
        const lastUser = withoutError[withoutError.length - 1];
        if (lastUser.role === "user" && lastUser.content === question) {
          withoutError.pop();
        }
      }
      return withoutError;
    });
    void ask(question);
  }, [ask]);

  // Only reachable via a locally-registered conversation (no backend listing).
  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm font-medium text-zinc-100">
          This conversation isn&apos;t on this device
        </p>
        <p className="max-w-sm text-[13px] leading-relaxed text-faint">
          PlotGuard keeps the conversation index locally, and the current
          backend doesn&apos;t provide a way to fetch conversations by user
          yet. Start a new one below.
        </p>
        <Link href="/select" className="mt-1">
          <Button variant="primary">Start a new conversation</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-panel px-4 sm:px-6">
        <Link
          href="/"
          aria-label="Back to dashboard"
          className="rounded-md p-1 text-mute transition-colors hover:bg-hover hover:text-zinc-100"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-zinc-100">
            {conversation.showTitle}
          </h1>
          <p className="truncate text-[11px] text-faint">
            {conversation.boundaryChanged
              ? `Boundary changed · now ${conversation.boundaryLongLabel}`
              : `Spoilers end at ${conversation.boundaryLongLabel}`}
          </p>
        </div>
        <Badge tone="accent" className="shrink-0">
          <Shield className="size-3" />
          {conversation.boundaryLabel}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setBoundaryOpen(true)}
          className="shrink-0"
        >
          <SlidersHorizontal className="size-3.5" />
          <span className="hidden sm:inline">Change boundary</span>
          <span className="sm:hidden">Change</span>
        </Button>
      </header>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="pt-10 pb-2 text-center sm:pt-16">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
              {conversation.showTitle} — up to{" "}
              {conversation.boundaryLongLabel}
            </h2>
            <p className="mx-auto mt-2 max-w-md px-4 text-[13px] leading-relaxed text-faint">
              Ask anything about characters, storylines or theories. Answers
              will never reveal events beyond this episode.
            </p>
            <SuggestedQuestions onPick={(q) => void ask(q)} />
          </div>
        ) : (
          <MessageList
            messages={messages}
            pendingId={pendingId}
            onRetry={messages[messages.length - 1]?.error ? retry : undefined}
          />
        )}
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-line bg-panel pb-2 pt-3">
        <ChatInput disabled={pendingId !== null} onSend={(text) => void ask(text)} />
      </div>

      <BoundaryModal
        open={boundaryOpen}
        onClose={() => setBoundaryOpen(false)}
        conversationId={conversationId}
      />
    </div>
  );
}
