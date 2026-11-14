"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMessages } from "@/i18n/server";
import type { Messages } from "@/i18n/messages/pt-BR";
import {
  checkAvatar,
  fieldErrors,
  onboardingSchema,
  profileSchema,
} from "../schemas";
import { requireOnboardedRider, requireRider } from "./queries";

export type FormState = {
  status: "idle" | "error" | "saved";
  errors?: Record<string, string>;
  message?: string;
};

type ValidationKey = keyof Messages["validation"];

function translate(
  errors: Record<string, string>,
  t: Messages,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(errors).map(([field, key]) => [
      field,
      t.validation[key as ValidationKey] ?? t.common.genericError,
    ]),
  );
}

const UNIQUE_VIOLATION = "23505";

export async function completeOnboarding(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const rider = await requireRider();
  const t = await getMessages();
  const parsed = onboardingSchema.safeParse({
    username: formData.get("username") ?? "",
    displayName: formData.get("displayName") ?? "",
    homeSpotId: formData.get("homeSpotId") ?? "",
    gpsConsent: formData.get("gpsConsent") === "on",
  });
  if (!parsed.success)
    return { status: "error", errors: translate(fieldErrors(parsed.error), t) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      username: parsed.data.username,
      display_name: parsed.data.displayName,
      home_spot_id: parsed.data.homeSpotId,
      onboarded_at: rider.profile.onboarded_at ?? new Date().toISOString(),
    })
    .eq("id", rider.id);
  if (error) {
    if (error.code === UNIQUE_VIOLATION)
      return {
        status: "error",
        errors: { username: t.validation.usernameTaken },
      };
    console.error("completeOnboarding failed", error.code);
    return { status: "error", message: t.common.genericError };
  }

  const consent = await setGpsConsent(
    rider.id,
    parsed.data.gpsConsent,
    rider.preferences.gps_consent,
  );
  if (!consent) return { status: "error", message: t.common.genericError };

  revalidatePath("/", "layout");
  redirect("/home");
}

export async function updateProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const rider = await requireOnboardedRider();
  const t = await getMessages();
  const parsed = profileSchema.safeParse({
    username: formData.get("username") ?? "",
    displayName: formData.get("displayName") ?? "",
    bio: formData.get("bio") ?? "",
    homeSpotId: formData.get("homeSpotId") ?? "",
    gpsConsent: formData.get("gpsConsent") === "on",
  });
  if (!parsed.success)
    return { status: "error", errors: translate(fieldErrors(parsed.error), t) };

  const supabase = await createClient();
  let avatarUrl: string | undefined;

  const avatar = formData.get("avatar");
  if (avatar instanceof File && avatar.size > 0) {
    const problem = checkAvatar(avatar);
    if (problem)
      return { status: "error", errors: { avatar: t.validation[problem] } };
    const path = `${rider.id}/avatar`;
    const upload = await supabase.storage.from("avatars").upload(path, avatar, {
      upsert: true,
      contentType: avatar.type,
      cacheControl: "3600",
    });
    if (upload.error) {
      console.error("avatar upload failed", upload.error.message);
      return { status: "error", errors: { avatar: t.common.genericError } };
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    avatarUrl = `${data.publicUrl}?v=${Date.now()}`;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username: parsed.data.username,
      display_name: parsed.data.displayName,
      bio: parsed.data.bio,
      home_spot_id: parsed.data.homeSpotId,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq("id", rider.id);
  if (error) {
    if (error.code === UNIQUE_VIOLATION)
      return {
        status: "error",
        errors: { username: t.validation.usernameTaken },
      };
    console.error("updateProfile failed", error.code);
    return { status: "error", message: t.common.genericError };
  }

  const consent = await setGpsConsent(
    rider.id,
    parsed.data.gpsConsent,
    rider.preferences.gps_consent,
  );
  if (!consent) return { status: "error", message: t.common.genericError };

  revalidatePath("/", "layout");
  return { status: "saved", message: t.profile.saved };
}

/** Records consent with a timestamp; withdrawing consent clears it. */
async function setGpsConsent(
  riderId: string,
  wanted: boolean,
  current: boolean,
): Promise<boolean> {
  if (wanted === current) return true;
  const supabase = await createClient();
  const { error } = await supabase
    .from("rider_preferences")
    .update({
      gps_consent: wanted,
      gps_consent_at: wanted ? new Date().toISOString() : null,
    })
    .eq("rider_id", riderId);
  if (error) console.error("setGpsConsent failed", error.code);
  return !error;
}
