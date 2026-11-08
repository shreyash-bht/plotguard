"use client";

import { CornerDownLeft } from "lucide-react";
import { useRef, useState } from "react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export interface ChatInputProps {
  disabled?: boolean;
  onSend: (text: string) => void;
}

/**
 * Responsive message composer: Enter sends, Shift+Enter inserts a newline,
 * auto-grows up to a cap. Falls back to h-12 touch target spacing on mobile.
 */
export function ChatInput({ disabled = false, onSend }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow with content (content-box rows via scrollHeight).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value]);

  const send = () => {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl border border-line bg-panel p-2",
          "focus-within:border-accent/40",
        )}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            disabled
              ? "Waiting for the reply…"
              : "Ask anything about the story so far…"
          }
          disabled={disabled}
          className="max-h-44 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-[14.5px] leading-relaxed text-zinc-100 placeholder:text-faint focus:outline-none disabled:opacity-50"
        />
        <Button
          variant="primary"
          size="md"
          onClick={send}
          disabled={disabled || value.trim() === ""}
          className="shrink-0"
          aria-label="Send message"
        >
          Send
        </Button>
      </div>
      <p className="mt-2 hidden items-center justify-center gap-1 text-[11px] text-faint sm:flex">
        <CornerDownLeft className="size-3" />
        to send · Shift + Enter for a new line
      </p>
      {/* touch-friendly bottom padding on mobile */}
      <div className="h-2 sm:hidden" />
    </div>
  );
}
