import { getStoredBillPassword } from "@/lib/bill-password";
import type { BillRow } from "@/lib/database.types";

export const PAYER_PASSWORD_KDF_ITERATIONS = 100_000;
const PAYER_PASSWORD_HASH_BYTES = 32;

function getSubtle(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("Web Crypto API is not available");
  }
  return subtle;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function billRequiresPayerPassword(
  bill: Pick<BillRow, "payer_password_hash">,
): boolean {
  return Boolean(bill.payer_password_hash?.trim());
}

export async function hashPayerViewPassword(
  password: string,
  billId: string,
  iterations = PAYER_PASSWORD_KDF_ITERATIONS,
): Promise<string> {
  const subtle = getSubtle();
  const keyMaterial = await subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(billId),
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    PAYER_PASSWORD_HASH_BYTES * 8,
  );

  return bytesToBase64(new Uint8Array(bits));
}

export function parsePayerPasswordHash(request: Request): string | null {
  const hash = request.headers.get("X-Bill-Password-Hash")?.trim();
  return hash || null;
}

export async function buildPayerAuthHeaders(
  billId: string,
): Promise<Record<string, string>> {
  const password = getStoredBillPassword(billId);
  if (!password) {
    return {};
  }

  return {
    "X-Bill-Password-Hash": await hashPayerViewPassword(password, billId),
  };
}
