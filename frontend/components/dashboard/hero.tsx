import { ArrowRight, MessageSquareText, ShieldCheck, EyeOff } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const bullets = [
  {
    icon: ShieldCheck,
    title: "Spoiler-free by design",
    text: "The AI can only see content up to the episode you lock as your boundary.",
  },
  {
    icon: MessageSquareText,
    title: "Ask in plain words",
    text: "Characters, plot twists, theories — follow-ups keep their context.",
  },
  {
    icon: EyeOff,
    title: "Nothing leaks ahead",
    text: "Retrieval skips everything beyond your viewing progress, every reply.",
  },
];

export function Hero() {
  return (
    <section className="relative pt-14 pb-12 lg:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-2xl text-center">
        <p className="text-[12px] font-medium tracking-[0.18em] text-accent uppercase">
          Spoiler-aware AI
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance text-zinc-50 sm:text-5xl">
          Your story. Your pace.{" "}
          <span className="text-accent">Zero spoilers.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-mute">
          Plotguard AI answers anything about your favorite anime and shows using
          your exact starting point — when you picked an episode as your
          boundary, the AI&apos;s story knowledge ends there.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/select">
            <Button variant="primary" size="lg">
              Start chatting
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-3">
        {bullets.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-xl border border-line bg-panel p-4"
          >
            <Icon className="size-4 text-accent" />
            <p className="mt-2.5 text-[13px] font-medium text-zinc-100">{title}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-faint">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
