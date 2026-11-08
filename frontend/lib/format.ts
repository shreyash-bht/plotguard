/** Shared formatting helpers. */

/** "2024-05-31" | ISO instant -> "May 31, 2024"; null-safe. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** ISO instant -> "14:32" (local). */
export function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/** "ANIME" | "TV_SHOW" | "MOVIE" -> display label. */
export function contentTypeLabel(type: string): string {
  switch (type) {
    case "ANIME":
      return "Anime";
    case "TV_SHOW":
      return "TV Show";
    default:
      return "Movie";
  }
}
