"use client";

import { useCallback, useEffect, useState } from "react";

import { registerGuest } from "@/services/auth";
import { useSessionStore } from "@/stores/session";
import type { GuestUser } from "@/types/user";

export type SessionStatus = "has-user" | "registering" | "failed";

interface SessionResult {
  user: GuestUser | null;
  status: SessionStatus;
  retry: () => void;
}

/**
 * In-flight registerGuest shared across every mount (StrictMode double-effects,
 * multiple tabs of the same page), so at most one guest is ever registered.
 */
let inflight: Promise<GuestUser> | null = null;

function ensureGuest(): Promise<GuestUser> {
  const existing = useSessionStore.getState().user;
  if (existing) return Promise.resolve(existing);
  if (!inflight) {
    inflight = registerGuest()
      .then((user) => {
        useSessionStore.getState().setUser(user);
        return user;
      })
      .catch((error) => {
        inflight = null;
        throw error;
      });
  }
  return inflight;
}

/** Fires guest registration; used for implicit bootstrapping (sidebar). */
export function useGuestSession(): SessionResult {
  const user = useSessionStore((s) => s.user);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (user) return;
    let alive = true;
    ensureGuest()
      .then(() => {
        // The store update re-renders with the user; nothing else to do.
        if (alive) setFailed(false);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [user, attempt]);

  // Derived: avoids synchronous setState inside the effect.
  const status: SessionStatus = user ? "has-user" : failed ? "failed" : "registering";

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { user, status, retry };
}
