export type SharePayloadMode = "url" | "text";

export function canUseWebShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export function isShareableLink(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  return /^https?:\/\//i.test(trimmed) || /^paypal\.me\//i.test(trimmed);
}

export function normalizeShareUrl(value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^paypal\.me\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

export function buildSharePayload(
  value: string,
  options: { mode: SharePayloadMode; title?: string },
): ShareData {
  const title = options.title ?? "Split Bill";

  if (options.mode === "text") {
    return { title, text: value };
  }

  return { title, url: normalizeShareUrl(value) };
}

export async function shareValue(
  value: string,
  options: { mode: SharePayloadMode; title?: string },
): Promise<boolean> {
  if (!canUseWebShare()) {
    return false;
  }

  try {
    await navigator.share(buildSharePayload(value, options));
    return true;
  } catch {
    return false;
  }
}
