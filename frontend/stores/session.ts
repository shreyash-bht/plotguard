import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { GuestUser } from "@/types/user";

interface SessionState {
  user: GuestUser | null;
  setUser: (user: GuestUser) => void;
  clearUser: () => void;
}

/**
 * Guest identity. Persisted so refreshes reuse the same guest (>= 1 day) instead
 * of re-registering. The backend returns no token for guests and its public
 * endpoints require none, so only the user object is stored.
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    { name: "plotguard-session", version: 1 },
  ),
);
