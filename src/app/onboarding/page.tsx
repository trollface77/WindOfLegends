import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { OnboardingForm } from "@/features/profile";
import { requireRider } from "@/features/profile/server/queries";
import { getSpotOptions } from "@/features/geo/server/queries";
import { getMessages } from "@/i18n/server";

export const metadata: Metadata = { title: "Onboarding" };

export default async function OnboardingPage() {
  const rider = await requireRider();
  if (rider.profile.onboarded_at) redirect("/home");
  const [t, spots] = await Promise.all([getMessages(), getSpotOptions()]);
  const placeholderUsername = /^rider_[0-9a-f]{10}$/.test(
    rider.profile.username,
  )
    ? ""
    : rider.profile.username;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 py-10">
      <Logo className="self-center text-lg" />
      <Card className="flex flex-col gap-6 p-6">
        <header className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-bold">
            {t.onboarding.title}
          </h1>
          <p className="text-sm text-mist">{t.onboarding.subtitle}</p>
        </header>
        <OnboardingForm
          t={t}
          spots={spots}
          defaults={{
            username: placeholderUsername,
            displayName:
              rider.profile.display_name === "New rider"
                ? ""
                : rider.profile.display_name,
            homeSpotId: rider.profile.home_spot_id,
            gpsConsent: rider.preferences.gps_consent,
          }}
        />
      </Card>
    </main>
  );
}
