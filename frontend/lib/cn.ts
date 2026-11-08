/** Join class names, skipping falsy values. Minimal replacement for clsx. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
