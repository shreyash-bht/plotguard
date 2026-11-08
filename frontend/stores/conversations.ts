import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ConversationRef } from "@/types/conversation";

interface ConversationEntry {
  map: Record<string, ConversationRef>;
}

interface ConversationState extends ConversationEntry {
  save: (ref: ConversationRef) => void;
}

/**
 * Conversation metadata (show, boundary, timestamps) per conversation id.
 * The backend stores messages server-side but exposes no "list conversations"
 * endpoint, so this is the client's index into conversations it created.
 */
export const useConversationStore = create<ConversationState>()(
  persist(
    (set) => ({
      map: {},
      save: (ref) => set((s) => ({ map: { ...s.map, [ref.conversation_id]: ref } })),
    }),
    { name: "plotguard-conversations", version: 1 },
  ),
);

export function getConversationRef(id: string): ConversationRef | undefined {
  return useConversationStore.getState().map[id];
}
