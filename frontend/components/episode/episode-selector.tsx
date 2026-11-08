"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/cn";
import { episodeShortLabel, episodeLongLabel } from "@/lib/episodes";
import type { EpisodeGroup } from "@/lib/episodes";
import type { StoryUnit } from "@/types/content";

export interface EpisodeSelectorProps {
  groups: EpisodeGroup[];
  selected: StoryUnit | null;
  onSelect: (unit: StoryUnit, season: EpisodeGroup["season"]) => void;
}

/**
 * Season-grouped, scrollable episode list. The selected (watched-until)
 * episode is highlighted and marked with a check.
 */
export function EpisodeSelector({
  groups,
  selected,
  onSelect,
}: EpisodeSelectorProps) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.season?.seasonId ?? "extras"}>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-faint">
            {group.season
              ? group.season.title ?? `Season ${group.season.seasonNumber}`
              : "Extras"}
          </p>
          <ul className="space-y-1">
            {group.units.map((unit) => {
              const isSelected = unit.storyUnitId === selected?.storyUnitId;
              return (
                <li key={unit.storyUnitId}>
                  <button
                    onClick={() => onSelect(unit, group.season)}
                    aria-pressed={isSelected}
                    data-episode-label={episodeShortLabel(unit, group.season)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                      isSelected
                        ? "border-accent/40 bg-accent/10"
                        : "border-transparent hover:bg-hover",
                    )}
                  >
                    <span
                      className={cn(
                        "w-16 shrink-0 font-mono text-[11px]",
                        isSelected ? "text-accent" : "text-faint",
                      )}
                    >
                      {episodeShortLabel(unit, group.season)}
                    </span>
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-[13px]",
                        isSelected
                          ? "font-medium text-zinc-100"
                          : "text-mute",
                      )}
                    >
                      {unit.title ?? episodeLongLabel(unit, group.season)}
                    </span>
                    {isSelected ? (
                      <Check className="size-4 shrink-0 text-accent" />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
