"use client";

import { RefreshCw } from "lucide-react";

import { useGuestSession } from "@/hooks/use-guest-session";
import { Button } from "@/components/ui/button";

/**
 * Boots guest registration once the shell mounts, regardless of which page is
 * active, so the sidebar always has a username as soon as one exists.
 * If registration fails, surfaces a retry affordance instead of leaving the
 * sidebar stuck on "Starting session".
 */
export function GuestBoot() {
  const { status, retry } = useGuestSession();

  if (status !== "failed") return null;
  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-xl border border-danger/30 bg-panel px-4 py-3 shadow-xl shadow-black/30">
      <p className="text-[13px] text-mute">
        Session setup failed. Shows and conversations need a guest session.
      </p>
      <Button variant="secondary" size="sm" onClick={retry}>
        <RefreshCw className="size-3" />
        Retry
      </Button>
    </div>
  );
}
