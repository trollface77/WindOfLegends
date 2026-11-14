import { z } from "zod";

export const signInSchema = z.object({
  email: z.email().max(254),
  next: z.string().optional(),
});

/** Only allow same-site relative redirects after sign-in. */
export function safeNextPath(next: string | null | undefined): string {
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.startsWith("/\\")
  )
    return "/home";
  return next;
}
