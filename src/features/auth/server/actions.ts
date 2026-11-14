"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";
import { getMessages } from "@/i18n/server";
import { safeNextPath, signInSchema } from "../schemas";

export type SignInState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string; email?: string };

function callbackUrl(next: string) {
  const url = new URL("/auth/callback", publicEnv().NEXT_PUBLIC_SITE_URL);
  url.searchParams.set("next", safeNextPath(next));
  return url.toString();
}

export async function signInWithEmail(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const t = await getMessages();
  const parsed = signInSchema.safeParse({
    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
    next: String(formData.get("next") ?? ""),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: t.auth.invalidEmail,
      email: String(formData.get("email") ?? ""),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: callbackUrl(parsed.data.next ?? "/home"),
      shouldCreateUser: true,
    },
  });
  if (error) {
    console.error("signInWithOtp failed", error.status, error.code);
    return {
      status: "error",
      message: t.auth.sendFailed,
      email: parsed.data.email,
    };
  }
  return { status: "sent", email: parsed.data.email };
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  if (!publicEnv().NEXT_PUBLIC_AUTH_GOOGLE_ENABLED) redirect("/login");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl(String(formData.get("next") ?? "/home")),
    },
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
