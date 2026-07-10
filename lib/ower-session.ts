const STORAGE_PREFIX = "split-bill:ower:";

function storageKey(billId: string): string {
  return `${STORAGE_PREFIX}${billId}`;
}

export function getOwerName(billId: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = sessionStorage.getItem(storageKey(billId));
  return value?.trim() ? value.trim() : null;
}

export function setOwerName(billId: string, name: string): void {
  sessionStorage.setItem(storageKey(billId), name.trim());
}

export function clearOwerName(billId: string): void {
  sessionStorage.removeItem(storageKey(billId));
}
