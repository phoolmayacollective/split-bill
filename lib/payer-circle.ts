import {
  isValidPayerUsername,
  normalizePayerUsername,
} from "@/lib/payer-account";

export type CircleAddErrorCode =
  | "invalid_username"
  | "self_add"
  | "duplicate";

export function validateCircleAdd(input: {
  ownerUsername: string;
  memberUsername: string;
  existingMemberUsernames: string[];
}): CircleAddErrorCode | null {
  const normalizedMember = normalizePayerUsername(input.memberUsername);

  if (!isValidPayerUsername(normalizedMember)) {
    return "invalid_username";
  }

  if (normalizePayerUsername(input.ownerUsername) === normalizedMember) {
    return "self_add";
  }

  const existingKeys = new Set(
    input.existingMemberUsernames.map((username) =>
      normalizePayerUsername(username),
    ),
  );

  if (existingKeys.has(normalizedMember)) {
    return "duplicate";
  }

  return null;
}

export function circleAddErrorMessage(code: CircleAddErrorCode): string {
  switch (code) {
    case "invalid_username":
      return "Username must be 2–32 characters: letters, numbers, or underscores.";
    case "self_add":
      return "You can't add yourself to your circle.";
    case "duplicate":
      return "They're already in your circle.";
  }
}
