import { z } from "zod";

/** Usernames that would collide with routes or impersonate staff. */
export const RESERVED_USERNAMES = new Set([
  "edit",
  "settings",
  "admin",
  "moderator",
  "support",
  "me",
  "new",
  "api",
]);

export const usernameSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9_]{3,24}$/, "usernameFormat")
  .refine(
    (u) =>
      !RESERVED_USERNAMES.has(u.toLowerCase()) &&
      !/^rider_[0-9a-f]{10}$/.test(u),
    "usernameTaken",
  );

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "displayName")
  .max(60, "displayName");

const optionalUuid = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .pipe(z.uuid().nullable());

export const onboardingSchema = z.object({
  username: usernameSchema,
  displayName: displayNameSchema,
  homeSpotId: optionalUuid,
  gpsConsent: z.boolean(),
});

export const profileSchema = z.object({
  username: usernameSchema,
  displayName: displayNameSchema,
  bio: z
    .string()
    .trim()
    .max(280, "bio")
    .transform((v) => (v === "" ? null : v)),
  homeSpotId: optionalUuid,
  gpsConsent: z.boolean(),
});

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Returns a validation message key, or null when the avatar is acceptable. */
export function checkAvatar(file: {
  size: number;
  type: string;
}): "avatarType" | "avatarSize" | null {
  if (!(AVATAR_TYPES as readonly string[]).includes(file.type))
    return "avatarType";
  if (file.size > AVATAR_MAX_BYTES) return "avatarSize";
  return null;
}

/** Field → message key, from a failed Zod parse. Keys index the `validation` messages. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    out[field] ??= issue.message;
  }
  return out;
}
