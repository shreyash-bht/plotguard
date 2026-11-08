import { coreApi } from "@/services/api-client";
import type { GuestUser } from "@/types/user";

/**
 * POST /auth/guest-register.
 * Returns the serialized User entity only — no token, and temp users have no
 * password, so the client keeps the raw user object as their identity. Backend
 * content endpoints are public, so no Authorization header is required today.
 */
export function registerGuest(signal?: AbortSignal): Promise<GuestUser> {
  return coreApi.post<GuestUser>("/auth/guest-register", {}, signal);
}
