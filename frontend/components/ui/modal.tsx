"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import { cn } from "@/lib/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children: React.ReactNode;
}

/** Minimal centered modal. Closes on Escape and backdrop click. */
export function Modal({ open, onClose, title, className, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          "w-full max-w-md rounded-2xl border border-line bg-panel shadow-2xl shadow-black/40",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-sm font-medium text-zinc-100">{title}</h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="rounded-md p-1 text-faint transition-colors hover:bg-hover hover:text-zinc-100"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
