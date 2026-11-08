"use client";

import { MessageCircleQuestion } from "lucide-react";

const suggestions = [
  "Why did this character make that decision?",
  "Explain the latest episode.",
  "What is the relationship between these two characters?",
  "Help me understand this plot twist.",
];

export function SuggestedQuestions({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-2 pb-4 sm:px-6">
      <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-faint">
        Try asking
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {suggestions.map((text) => (
          <button
            key={text}
            onClick={() => onPick(text)}
            className="group flex items-start gap-2.5 rounded-xl border border-line bg-panel px-3.5 py-3 text-left transition-colors hover:border-line-strong hover:bg-hover"
          >
            <MessageCircleQuestion className="mt-0.5 size-4 shrink-0 text-accent/70" />
            <span className="text-[13px] leading-snug text-mute group-hover:text-zinc-100">
              {text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
