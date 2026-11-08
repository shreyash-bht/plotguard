"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useSessionStore } from "@/stores/session";

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useSessionStore((s) => s.user);
  const clearUser = useSessionStore((s) => s.clearUser);
  const [confirming, setConfirming] = useState(false);

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="space-y-5">
        <section>
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-faint">
            Guest session
          </h3>
          <div className="mt-2 rounded-xl border border-line bg-raise p-3 text-[13px]">
            {user ? (
              <div className="space-y-1">
                <p className="font-medium text-zinc-100">{user.username}</p>
                <p className="font-mono text-[11px] break-all text-faint">{user.userId}</p>
                <p className="text-[12px] text-mute">
                  Registered automatically so you can browse without an account.
                </p>
              </div>
            ) : (
              <p className="text-mute">Registering a guest session…</p>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-faint">
            Data
          </h3>
          <p className="mt-2 text-[13px] text-mute">
            Clearing the guest session removes the locally stored identity and
            recent conversation references. Conversations already created on the
            server are not affected.
          </p>
          {confirming ? (
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  clearUser();
                  setConfirming(false);
                }}
              >
                Yes, clear session
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              disabled={!user}
              onClick={() => setConfirming(true)}
            >
              Clear guest session
            </Button>
          )}
        </section>
      </div>
    </Modal>
  );
}
