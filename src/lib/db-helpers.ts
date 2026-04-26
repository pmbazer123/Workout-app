// SQLite stores no native JSON — all JSON fields are strings.
// These helpers centralise the stringify/parse so callers don't forget.

export function toJson(value: unknown): string {
  return JSON.stringify(value)
}

export function fromJson<T>(value: string | null | undefined): T {
  if (!value) return [] as unknown as T
  return JSON.parse(value) as T
}
