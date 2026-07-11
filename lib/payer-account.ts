import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

export function normalizePayerUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function isValidPayerUsername(username: string): boolean {
  const normalized = normalizePayerUsername(username);
  return /^[a-z0-9_]{2,32}$/.test(normalized);
}

export async function hashAccountPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt.toString("base64")}.${hash.toString("base64")}`;
}

export async function verifyAccountPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [saltB64, hashB64] = stored.split(".");
  if (!saltB64 || !hashB64) {
    return false;
  }

  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");
  const actual = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}
