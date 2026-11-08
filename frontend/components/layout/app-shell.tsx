"use client";

import { Menu, Shield, X } from "lucide-react";
import { useState } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { GuestBoot } from "@/components/layout/guest-boot";
import { SettingsModal } from "@/components/layout/settings-modal";
import { useSessionStore } from "@/stores/session";
import { cn } from "@/lib/cn";

/** Client shell around every page: desktop rail + mobile drawer + modals. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-ink">
      {/* Desktop rail */}
      <aside className="hidden w-[264px] shrink-0 lg:block">
        <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          drawerOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          onClick={() => setDrawerOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/60 transition-opacity duration-200",
            drawerOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute top-0 bottom-0 left-0 w-[264px] transition-transform duration-200",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Sidebar
            onOpenSettings={() => {
              setSettingsOpen(true);
              setDrawerOpen(false);
            }}
            onNavigate={() => setDrawerOpen(false)}
          />
        </div>
      </div>

      {/* Mobile top bar */}
      <MobileTopBar drawerOpen={drawerOpen} onToggle={() => setDrawerOpen((v) => !v)} />

      <main className="min-w-0 flex-1 overflow-y-auto pt-12 lg:pt-0">{children}</main>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <GuestBoot />
    </div>
  );
}

function MobileTopBar({
  drawerOpen,
  onToggle,
}: {
  drawerOpen: boolean;
  onToggle: () => void;
}) {
  const username = useSessionStore((s) => s.user?.username ?? null);
  return (
    <div className="fixed inset-x-0 top-0 z-30 flex h-12 items-center gap-3 border-b border-line bg-panel px-3 lg:hidden">
      <button
        aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
        onClick={onToggle}
        className="rounded-md p-1.5 text-mute transition-colors hover:bg-hover hover:text-zinc-100"
      >
        {drawerOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      <span className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-accent/15 ring-1 ring-accent/25">
          <Shield className="size-3.5 text-accent" strokeWidth={2.2} />
        </span>
        <span className="text-sm font-semibold text-zinc-100">PlotGuard</span>
      </span>
      <span className="ml-auto truncate text-[12px] text-mute">{username ?? ""}</span>
    </div>
  );
}
