import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

/** Data Access Layer: the only place that resolves "who is the current rider". */
export const getAuthUserId = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.sub ?? null;
});

export interface CurrentRider {
  id: string;
  profile: Tables<"profiles">;
  stats: Pick<Tables<"rider_stats">, "lifetime_xp" | "level">;
  preferences: Pick<Tables<"rider_preferences">, "gps_consent" | "locale">;
}

/** Current rider or redirect to /login. Does not enforce onboarding. */
export const requireRider = cache(async (): Promise<CurrentRider> => {
  const userId = await getAuthUserId();
  if (!userId) redirect("/login");

  const supabase = await createClient();
  const [profile, stats, preferences] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("rider_stats")
      .select("lifetime_xp, level")
      .eq("rider_id", userId)
      .single(),
    supabase
      .from("rider_preferences")
      .select("gps_consent, locale")
      .eq("rider_id", userId)
      .single(),
  ]);
  if (profile.error || stats.error || preferences.error) {
    // The signup trigger creates all three rows; a missing row means a broken account.
    throw new Error("Rider account is incomplete");
  }
  return {
    id: userId,
    profile: profile.data,
    stats: stats.data,
    preferences: preferences.data,
  };
});

/** Current rider who has finished onboarding, or redirect. */
export const requireOnboardedRider = cache(async (): Promise<CurrentRider> => {
  const rider = await requireRider();
  if (!rider.profile.onboarded_at) redirect("/onboarding");
  return rider;
});

export interface PublicRider {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  homeSpotName: string | null;
  createdAt: string;
  lifetimeXp: number;
}

export const getPublicRider = cache(
  async (username: string): Promise<PublicRider | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("rider_public_profiles")
      .select(
        "id, username, display_name, avatar_url, bio, created_at, lifetime_xp, home_spot:spots(name)",
      )
      .eq("username", username)
      .maybeSingle();
    if (error) throw new Error(`Failed to load rider: ${error.message}`);
    if (!data) return null;
    const spot = data.home_spot as { name: string } | { name: string }[] | null;
    return {
      id: data.id,
      username: data.username,
      displayName: data.display_name,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      homeSpotName: Array.isArray(spot)
        ? (spot[0]?.name ?? null)
        : (spot?.name ?? null),
      createdAt: data.created_at,
      lifetimeXp: data.lifetime_xp,
    };
  },
);
