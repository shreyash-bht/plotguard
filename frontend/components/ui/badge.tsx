import { cn } from "@/lib/cn";

type Tone = "neutral" | "accent" | "ok" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-raise text-mute border-line",
  accent: "bg-accent/10 text-accent border-accent/20",
  ok: "bg-ok/10 text-ok border-ok/20",
  danger: "bg-danger/10 text-danger border-danger/20",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
