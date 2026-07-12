import { z } from "zod";

import { jsonError, jsonResponse } from "@/lib/api/http";
import { requirePayerSession } from "@/lib/api/require-payer-session";
import { removeCircleMember } from "@/lib/db/payer-circle";

const memberPayerIdSchema = z.uuid({ error: "Invalid member id" });

export async function DELETE(
  request: Request,
  context: { params: Promise<{ memberPayerId: string }> },
) {
  const auth = requirePayerSession(request);

  if (!auth.ok) {
    return auth.response;
  }

  const { memberPayerId } = await context.params;
  const parsedId = memberPayerIdSchema.safeParse(memberPayerId);

  if (!parsedId.success) {
    return jsonError("Invalid member id", 400, parsedId.error.flatten());
  }

  try {
    const removed = await removeCircleMember({
      ownerPayerId: auth.session.payerId,
      memberPayerId: parsedId.data,
    });

    if (!removed) {
      return jsonError("Circle member not found.", 404);
    }

    return jsonResponse({ removed: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove circle member";
    return jsonError(message, 500);
  }
}
