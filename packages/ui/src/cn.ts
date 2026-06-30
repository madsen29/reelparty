/** Tiny className joiner (keeps NativeWind class strings readable). */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
