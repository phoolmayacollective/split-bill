import { timingSafeEqual } from "node:crypto";

import type { BillRow } from "@/lib/database.types";
import { parsePayerPasswordHash } from "@/lib/payer-password";

export function verifyPayerPasswordHash(
  providedHash: string | null,
  bill: Pick<BillRow, "payer_password_hash">,
): boolean {
  const storedHash = bill.payer_password_hash?.trim();

  if (!storedHash) {
    return true;
  }

  if (!providedHash) {
    return false;
  }

  const provided = Buffer.from(providedHash, "utf8");
  const stored = Buffer.from(storedHash, "utf8");

  if (provided.length !== stored.length) {
    return false;
  }

  return timingSafeEqual(provided, stored);
}

export function isPayerRequestAuthorized(
  request: Request,
  bill: Pick<BillRow, "payer_password_hash">,
): boolean {
  return verifyPayerPasswordHash(parsePayerPasswordHash(request), bill);
}
