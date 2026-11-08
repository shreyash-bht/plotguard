"use client";

import { MessageSquarePlus, Settings, Shield } from "lucide-react";
import Link from "next/link";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { SidebarUser } from "@/components/layout/sidebar-user";
import { useSessionStore } from "@/stores/session";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex size-7 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/25">
        <Shield className="size-4 text-accent" strokeWidth={2.2} />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-zinc-100">
        PlotGuard
      </span>
    </Link>
  );
}

export interface SidebarProps {
  /** Settings opener, provided by the shell so the modal lives above both panels. */
  onOpenSettings: () => void;
  onNavigate?: () => void;
}

export function Sidebar({ onOpenSettings, onNavigate }: SidebarProps) {
  const username = useSessionStore((s) => s.user?.username ?? null);

  return (
    <div className="flex h-full w-full flex-col border-r border-line bg-panel">
      <div className="px-4 pt-5 pb-3">
        <Logo />
      </div>

      <div className="px-3 pb-3">
        <Link
          href="/select"
          onClick={onNavigate}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-accent-strong text-sm font-medium text-white transition-colors hover:bg-accent-strong-hover"
        >
          <MessageSquarePlus className="size-4" />
          New conversation
        </Link>
      </div>

      <SidebarNav onNavigate={onNavigate} />

      <div className="border-t border-line px-3 py-3">
        <button
          onClick={onOpenSettings}
          className="flex h-8 w-full items-center gap-2 rounded-lg px-2 text-[13px] text-mute transition-colors hover:bg-hover/60 hover:text-zinc-100"
        >
          <Settings className="size-4" />
          Settings
        </button>
        <SidebarUser username={username} />
      </div>
    </div>
  );
}
