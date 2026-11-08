"use client";

import { LogOut } from "lucide-react";

import { useSessionStore } from "@/stores/session";

/** Avatar initials from the guest username, e.g. "AzureRaven1234" -> "AR". */
function initials(username: string): string {
  const first = username.match(/^[A-Z][a-z]?/)?.[0] ?? username.charAt(0);
  const second = username.match(/[A-Z]/g)?.slice(1)[0] ?? "";
  return (first.charAt(0) + (second || "")).toUpperCase();
}

export function SidebarUser({ username }: { username: string | null }) {
  const clearUser = useSessionStore((s) => s.clearUser);

  return (
    <div className="mt-1 flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-hover/60">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-raise text-[11px] font-semibold text-accent ring-1 ring-line-strong">
        {username ? initials(username) : "…"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-zinc-100">
          {username ?? "Starting session"}
        </span>
        <span className="block text-[11px] text-faint">Guest session</span>
      </span>
      {username ? (
        <button
          aria-label="Clear guest session"
          title="Clear guest session (a new one will be registered)"
          onClick={clearUser}
          className="rounded-md p-1 text-faint transition-colors hover:bg-hover hover:text-zinc-100"
        >
          <LogOut className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
