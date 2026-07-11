import { nanoid } from "nanoid";

export function generateSharePassword(): string {
  return nanoid(16);
}
