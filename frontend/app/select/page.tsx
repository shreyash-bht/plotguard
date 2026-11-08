import { Suspense } from "react";

import { SelectFlow } from "@/components/episode/select-flow";

type SelectPageProps = PageProps<"/select">;

function SelectPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-12 pb-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          <div className="aspect-[16/10] animate-pulse rounded-xl bg-raise" />
          <div className="h-5 w-2/3 animate-pulse rounded bg-raise" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-raise" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-11 animate-pulse rounded-lg bg-raise" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Reads the dynamic searchParams inside the Suspense boundary (cacheComponents). */
async function SelectSection({ searchParams }: { searchParams: SelectPageProps["searchParams"] }) {
  const { show } = await searchParams;
  const showId = typeof show === "string" ? show : undefined;
  return <SelectFlow initialShowId={showId} />;
}

export default function SelectPage({ searchParams }: SelectPageProps) {
  // searchParams is dynamic data under cacheComponents: this boundary lets the
  // shell prerender while the flow streams in with the resolved query.
  return (
    <Suspense fallback={<SelectPageSkeleton />}>
      <SelectSection searchParams={searchParams} />
    </Suspense>
  );
}
