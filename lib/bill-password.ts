const STORAGE_PREFIX = "split-bill:password:";

function storageKey(billId: string): string {
  return `${STORAGE_PREFIX}${billId}`;
}

export function readPasswordFromHash(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const hash = window.location.hash.replace(/^#/, "");
  return hash ? decodeURIComponent(hash) : "";
}

export function getStoredBillPassword(billId: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = sessionStorage.getItem(storageKey(billId));
  return value?.trim() ? value.trim() : null;
}

export function setStoredBillPassword(billId: string, password: string): void {
  sessionStorage.setItem(storageKey(billId), password.trim());
}

export function clearStoredBillPassword(billId: string): void {
  sessionStorage.removeItem(storageKey(billId));
}

/** Persist hash password when present; returns the effective password for this bill. */
export function syncBillPasswordFromHash(billId: string): string | null {
  const fromHash = readPasswordFromHash();
  if (fromHash) {
    setStoredBillPassword(billId, fromHash);
    return fromHash;
  }

  return getStoredBillPassword(billId);
}
