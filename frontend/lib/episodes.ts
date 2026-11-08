import type { Season, StoryUnit } from "@/types/content";

export interface EpisodeGroup {
  season: Season | null;
  units: StoryUnit[];
}

/** Sort key: story order is the canonical viewing-order integer. */
function unitOrder(unit: StoryUnit): number {
  return unit.storyOrder ?? unit.unitNumber;
}

/** Group story units by their season (in season-number order), trailing an
 * "Extras" group for units with no season assignment. */
export function groupStoryUnits(
  units: StoryUnit[],
  seasons: Season[],
): EpisodeGroup[] {
  const ordered = [...units].sort((a, b) => unitOrder(a) - unitOrder(b));

  const groups: EpisodeGroup[] = seasons
    .slice()
    .sort((a, b) => a.seasonNumber - b.seasonNumber)
    .map((season) => ({ season, units: [] }));

  const indexBySeasonId = new Map(
    groups.map((g, i) => [g.season?.seasonId, i] as const),
  );
  const extras: StoryUnit[] = [];

  for (const unit of ordered) {
    const index = unit.seasonId ? indexBySeasonId.get(unit.seasonId) : undefined;
    if (index === undefined) {
      extras.push(unit);
    } else {
      groups[index].units.push(unit);
    }
  }

  if (extras.length > 0) {
    groups.push({ season: null, units: extras });
  }
  return groups;
}

/** "S1 · E4"; posts as "E4" when the unit has no season. */
export function episodeShortLabel(
  unit: StoryUnit,
  season: Season | null = null,
): string {
  if (season) {
    return `S${season.seasonNumber} · E${unit.unitNumber}`;
  }
  return `E${unit.unitNumber}`;
}

/** "Season 1, Episode 4"; "Episode 4" when no season. */
export function episodeLongLabel(
  unit: StoryUnit,
  season: Season | null = null,
): string {
  if (season) {
    return `Season ${season.seasonNumber}, Episode ${unit.unitNumber}`;
  }
  return `Episode ${unit.unitNumber}`;
}
