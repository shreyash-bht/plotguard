export type ContentType = "ANIME" | "TV_SHOW" | "MOVIE";

/** Mirror of the Spring Boot `Content` entity (camelCase JSON). */
export interface Content {
  contentId: string;
  title: string;
  description: string | null;
  contentType: ContentType;
  /** Serialized by Jackson as "yyyy-MM-dd". */
  releaseDate: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Mirror of the `Season` entity. */
export interface Season {
  seasonId: string;
  contentId: string;
  seasonNumber: number;
  title: string | null;
  description: string | null;
}

export type StoryUnitType = "EPISODE" | "CHAPTER" | "OVA" | "MOVIE";

/** Mirror of the `StoryUnit` entity. `storyOrder` is the spoiler-boundary integer. */
export interface StoryUnit {
  storyUnitId: string;
  contentId: string;
  seasonId: string | null;
  storyUnitType: StoryUnitType;
  unitNumber: number;
  title: string | null;
  description: string | null;
  storyOrder: number | null;
  releaseDate: string | null;
  createdAt: string;
  updatedAt: string;
}
