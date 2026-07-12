import { jsonError } from "@/lib/api/http";
import {
  getPayerSessionFromRequest,
  type PayerSession,
} from "@/lib/payer-session";

type RequirePayerSessionResult =
  | { ok: true; session: PayerSession }
  | { ok: false; response: Response };

export function requirePayerSession(
  request: Request,
): RequirePayerSessionResult {
  const session = getPayerSessionFromRequest(request);

  if (!session) {
    return {
      ok: false,
      response: jsonError("Sign in with a username first.", 401),
    };
  }

  return { ok: true, session };
}
