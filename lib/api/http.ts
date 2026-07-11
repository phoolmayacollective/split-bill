import type { z } from "zod";
import { billIdSchema } from "@/lib/api/schemas";

export function jsonResponse<T>(
  data: T,
  status = 200,
  headers?: Record<string, string>,
): Response {
  return Response.json(data, { status, headers });
}

export function jsonError(
  message: string,
  status: number,
  details?: unknown,
): Response {
  return Response.json(
    details === undefined ? { error: message } : { error: message, details },
    { status },
  );
}

type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: Response };

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<ParseResult<T>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return { ok: false, response: jsonError("Invalid JSON body", 400) };
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    return {
      ok: false,
      response: jsonError("Validation failed", 400, result.error.flatten()),
    };
  }

  return { ok: true, data: result.data };
}

export function parseBillId(id: string): ParseResult<string> {
  const result = billIdSchema.safeParse(id);

  if (!result.success) {
    return {
      ok: false,
      response: jsonError("Invalid bill id", 400, result.error.flatten()),
    };
  }

  return { ok: true, data: result.data };
}
