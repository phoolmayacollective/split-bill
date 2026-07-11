/** Trim, drop empties, dedupe case-insensitively (keeps first spelling). */
export function normalizeParticipants(names: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const name of names) {
    const trimmed = name.trim();
    if (!trimmed) continue;

    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

/** Match typed name to a roster entry; returns canonical roster spelling. */
export function matchRosterName(
  participants: string[],
  input: string,
): string | null {
  const key = input.trim().toLowerCase();
  if (!key) return null;

  return participants.find((name) => name.toLowerCase() === key) ?? null;
}

export function parseBillParticipants(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return normalizeParticipants(
    value.filter((entry): entry is string => typeof entry === "string"),
  );
}
