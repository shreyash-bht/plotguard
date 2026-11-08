"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

import { cn } from "@/lib/cn";

const items = [{ href: "/", label: "Home" }];

/**
 * Reads the URL, so under cacheComponents it hangs until the client knows the
 * pathname; Suspense-wrapped by {@link SidebarNav}.
 */
function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const current = pathname === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={current ? "page" : undefined}
              className={cn(
                "flex h-8 items-center rounded-lg px-2 text-[13px] transition-colors",
                current
                  ? "bg-hover text-zinc-100"
                  : "text-mute hover:bg-hover/60 hover:text-zinc-100",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3">
      <p className="px-2 pt-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-faint">
        Navigate
      </p>
      <Suspense fallback={<div className="h-8 animate-pulse rounded-lg bg-raise" />}>
        <NavLinks onNavigate={onNavigate} />
      </Suspense>
    </nav>
  );
}
