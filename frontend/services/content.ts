import { coreApi } from "@/services/api-client";
import type { Content, Season, StoryUnit } from "@/types/content";

/** GET /api/contents */
export function listContents(signal?: AbortSignal): Promise<Content[]> {
  return coreApi.get<Content[]>("/contents", signal);
}

/** GET /api/contents/{contentId} */
export function getContent(
  contentId: string,
  signal?: AbortSignal,
): Promise<Content> {
  return coreApi.get<Content>(`/contents/${contentId}`, signal);
}

/** GET /api/contents/{contentId}/seasons */
export function listSeasons(
  contentId: string,
  signal?: AbortSignal,
): Promise<Season[]> {
  return coreApi.get<Season[]>(`/contents/${contentId}/seasons`, signal);
}

/** GET /api/contents/{contentId}/story-units */
export function listStoryUnits(
  contentId: string,
  signal?: AbortSignal,
): Promise<StoryUnit[]> {
  return coreApi.get<StoryUnit[]>(`/contents/${contentId}/story-units`, signal);
}
