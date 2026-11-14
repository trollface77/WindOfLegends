import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { EditProfileForm } from "@/features/profile";
import { requireOnboardedRider } from "@/features/profile/server/queries";
import { getSpotOptions } from "@/features/geo/server/queries";
import { getMessages } from "@/i18n/server";

export const metadata: Metadata = { title: "Edit profile" };

export default async function EditProfilePage() {
  const [rider, t, spots] = await Promise.all([
    requireOnboardedRider(),
    getMessages(),
    getSpotOptions(),
  ]);
  return (
    <>
      <h1 className="font-display text-2xl font-bold">{t.profile.editTitle}</h1>
      <Card className="p-5">
        <EditProfileForm
          t={t}
          spots={spots}
          defaults={{
            username: rider.profile.username,
            displayName: rider.profile.display_name,
            bio: rider.profile.bio,
            avatarUrl: rider.profile.avatar_url,
            homeSpotId: rider.profile.home_spot_id,
            gpsConsent: rider.preferences.gps_consent,
          }}
        />
      </Card>
    </>
  );
}
