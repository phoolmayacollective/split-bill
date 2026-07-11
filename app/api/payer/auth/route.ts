import { payerAuthSchema } from "@/lib/api/schemas";
import { jsonError, jsonResponse, parseJsonBody } from "@/lib/api/http";
import { createPayer, getPayerByUsername } from "@/lib/db/payers";
import {
  hashAccountPassword,
  isValidPayerUsername,
  normalizePayerUsername,
  verifyAccountPassword,
} from "@/lib/payer-account";
import { buildSessionCookie, createSessionToken } from "@/lib/payer-session";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, payerAuthSchema);

  if (!parsed.ok) {
    return parsed.response;
  }

  const username = normalizePayerUsername(parsed.data.username);
  const { password } = parsed.data;

  if (!isValidPayerUsername(username)) {
    return jsonError(
      "Username must be 2–32 characters: letters, numbers, or underscores.",
      400,
    );
  }

  if (password.length < 4) {
    return jsonError("Password must be at least 4 characters.", 400);
  }

  try {
    const existing = await getPayerByUsername(username);

    if (existing) {
      const valid = await verifyAccountPassword(password, existing.password_hash);
      if (!valid) {
        return jsonError("Wrong password for that username.", 401);
      }

      const token = createSessionToken({
        payerId: existing.id,
        username: existing.username,
      });

      return jsonResponse(
        {
          payer: { id: existing.id, username: existing.username },
          created: false,
        },
        200,
        { "Set-Cookie": buildSessionCookie(token) },
      );
    }

    const passwordHash = await hashAccountPassword(password);
    const payer = await createPayer({ username, passwordHash });
    const token = createSessionToken({
      payerId: payer.id,
      username: payer.username,
    });

    return jsonResponse(
      {
        payer: { id: payer.id, username: payer.username },
        created: true,
      },
      201,
      { "Set-Cookie": buildSessionCookie(token) },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Authentication failed";
    return jsonError(message, 500);
  }
}
