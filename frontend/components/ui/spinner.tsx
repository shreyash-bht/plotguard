import type { SVGProps } from "react";

import { cn } from "@/lib/cn";

export function Spinner({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-label="Loading"
      role="status"
      viewBox="0 0 24 24"
      fill="none"
      className={cn("size-4 animate-spin text-accent", className)}
      {...props}
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-90"
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
