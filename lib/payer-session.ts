import { createHmac, timingSafeEqual } from "node:crypto";

export const PAYER_SESSION_COOKIE = "payer_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type PayerSession = {
  payerId: string;
  username: string;
};

type SessionPayload = PayerSession & {
  exp: number;
};

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing SESSION_SECRET environment variable");
  }
  return secret;
}

function signPayload(payloadB64: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(payloadB64)
    .digest("base64url");
}

export function createSessionToken(session: PayerSession): string {
  const payload: SessionPayload = {
    ...session,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${signPayload(payloadB64)}`;
}

export function parseSessionToken(token: string): PayerSession | null {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payloadB64);
  const provided = Buffer.from(signature, "utf8");
  const expected = Buffer.from(expectedSignature, "utf8");

  if (provided.length !== expected.length) {
    return null;
  }

  if (!timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (
      typeof payload.payerId !== "string" ||
      typeof payload.username !== "string" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }

    if (payload.exp <= Date.now()) {
      return null;
    }

    return {
      payerId: payload.payerId,
      username: payload.username,
    };
  } catch {
    return null;
  }
}

export function buildSessionCookie(token: string): string {
  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `${PAYER_SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure}`;
}

export function buildClearSessionCookie(): string {
  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `${PAYER_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function getCookieValue(
  cookieHeader: string | null,
  name: string,
): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (rawName === name) {
      return decodeURIComponent(rawValue.join("="));
    }
  }

  return null;
}

export function getPayerSessionFromRequest(
  request: Request,
): PayerSession | null {
  const token = getCookieValue(
    request.headers.get("cookie"),
    PAYER_SESSION_COOKIE,
  );

  if (!token) {
    return null;
  }

  return parseSessionToken(token);
}
