export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** ISO timestamp; pending/error bubbles may carry none. */
  createdAt?: string;
  /** Rendered as an inline error state with a retry affordance. */
  error?: boolean;
}
