import { Suspense } from "react";

import { ChatView } from "@/components/chat/chat-view";

type ChatPageProps = PageProps<"/chat/[conversationId]">;

/** Reads the dynamic params inside the Suspense boundary (cacheComponents). */
async function ChatSection({ params }: { params: ChatPageProps["params"] }) {
  const { conversationId } = await params;
  return <ChatView conversationId={conversationId} />;
}

export default function ChatPage({ params }: ChatPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl space-y-4 px-4 pt-16 sm:px-6">
          <div className="h-5 w-1/3 animate-pulse rounded bg-raise" />
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-raise" />
          ))}
        </div>
      }
    >
      <ChatSection params={params} />
    </Suspense>
  );
}
