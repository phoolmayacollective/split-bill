import { jsonError } from "@/lib/api/http";
import type { BillWithClaims } from "@/lib/database.types";
import { billRequiresPayerPassword } from "@/lib/payer-password";
import { isPayerRequestAuthorized } from "@/lib/payer-password-server";
import { getPayerSessionFromRequest } from "@/lib/payer-session";

type PayerAuthResult =
  | { ok: true }
  | { ok: false; response: Response };

export function isBillOwnedByPayerSession(
  request: Request,
  bill: Pick<BillWithClaims, "payer_id">,
): boolean {
  const session = getPayerSessionFromRequest(request);
  return Boolean(session && bill.payer_id && bill.payer_id === session.payerId);
}

export function requirePayerPassword(
  request: Request,
  bill: BillWithClaims,
): PayerAuthResult {
  if (!billRequiresPayerPassword(bill)) {
    return { ok: true };
  }

  if (isBillOwnedByPayerSession(request, bill)) {
    return { ok: true };
  }

  if (!isPayerRequestAuthorized(request, bill)) {
    return {
      ok: false,
      response: jsonError("Password required", 401, {
        password_required: true,
      }),
    };
  }

  return { ok: true };
}
