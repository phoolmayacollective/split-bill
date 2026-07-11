import { jsonError } from "@/lib/api/http";
import type { BillWithClaims } from "@/lib/database.types";
import { billRequiresPayerPassword } from "@/lib/payer-password";
import { isPayerRequestAuthorized } from "@/lib/payer-password-server";

type PayerAuthResult =
  | { ok: true }
  | { ok: false; response: Response };

export function requirePayerPassword(
  request: Request,
  bill: BillWithClaims,
): PayerAuthResult {
  if (!billRequiresPayerPassword(bill)) {
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
