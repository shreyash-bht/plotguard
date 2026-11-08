import { Hero } from "@/components/dashboard/hero";
import { ShowPicker } from "@/components/show/show-picker";

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-16 sm:px-6 lg:px-8">
      <Hero />

      <section className="mt-4">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
            Choose a show
          </h2>
          <p className="text-[13px] text-faint">
            Pick one, lock your episode, then ask anything.
          </p>
        </div>
        <ShowPicker />
      </section>
    </div>
  );
}
