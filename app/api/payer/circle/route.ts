import { payerCircleAddSchema } from "@/lib/api/schemas";
import { jsonError, jsonResponse, parseJsonBody } from "@/lib/api/http";
import { requirePayerSession } from "@/lib/api/require-payer-session";
import {
  addCircleMember,
  listCircleMembers,
} from "@/lib/db/payer-circle";
import { getPayerByUsername } from "@/lib/db/payers";
import { normalizePayerUsername } from "@/lib/payer-account";
import {
  circleAddErrorMessage,
  validateCircleAdd,
} from "@/lib/payer-circle";

export async function GET(request: Request) {
  const auth = requirePayerSession(request);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const members = await listCircleMembers(auth.session.payerId);

    return jsonResponse({
      members: members.map((member) => ({
        payerId: member.payerId,
        username: member.username,
        addedAt: member.addedAt,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list circle";
    return jsonError(message, 500);
  }
}

export async function POST(request: Request) {
  const auth = requirePayerSession(request);

  if (!auth.ok) {
    return auth.response;
  }

  const parsed = await parseJsonBody(request, payerCircleAddSchema);

  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const existing = await listCircleMembers(auth.session.payerId);
    const validationError = validateCircleAdd({
      ownerUsername: auth.session.username,
      memberUsername: parsed.data.username,
      existingMemberUsernames: existing.map((member) => member.username),
    });

    if (validationError) {
      return jsonError(circleAddErrorMessage(validationError), 400);
    }

    const normalizedUsername = normalizePayerUsername(parsed.data.username);
    const member = await getPayerByUsername(normalizedUsername);

    if (!member) {
      return jsonError("No account with that username.", 404);
    }

    const row = await addCircleMember({
      ownerPayerId: auth.session.payerId,
      memberPayerId: member.id,
    });

    return jsonResponse(
      {
        member: {
          payerId: member.id,
          username: member.username,
          addedAt: row.created_at,
        },
      },
      201,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add circle member";
    return jsonError(message, 500);
  }
}
