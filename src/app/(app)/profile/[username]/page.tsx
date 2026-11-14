import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, buttonClasses } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProfileHeader } from "@/features/profile";
import {
  getPublicRider,
  requireOnboardedRider,
} from "@/features/profile/server/queries";
import { signOut } from "@/features/auth/server/actions";
import { getLocale, getMessages } from "@/i18n/server";

export async function generateMetadata({
  params,
}: PageProps<"/profile/[username]">): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${decodeURIComponent(username)}` };
}

export default async function ProfilePage({
  params,
}: PageProps<"/profile/[username]">) {
  const { username } = await params;
  const [me, rider, t, locale] = await Promise.all([
    requireOnboardedRider(),
    getPublicRider(decodeURIComponent(username)),
    getMessages(),
    getLocale(),
  ]);
  if (!rider) notFound();
  const isMe = rider.id === me.id;

  return (
    <>
      <ProfileHeader rider={rider} t={t} locale={locale} />
      {isMe && (
        <div className="flex gap-3">
          <Link
            href="/profile/edit"
            className={buttonClasses("secondary", "md", "flex-1")}
          >
            {t.profile.edit}
          </Link>
          <form action={signOut}>
            <Button type="submit" variant="ghost">
              {t.common.signOut}
            </Button>
          </form>
        </div>
      )}
      <section className="flex flex-col gap-3">
        <CardTitle>{t.profile.achievementsTitle}</CardTitle>
        <EmptyState
          icon="🏅"
          title={t.common.comingSoon}
          description={t.profile.achievementsEmpty}
        />
      </section>
      <section className="flex flex-col gap-3">
        <CardTitle>{t.profile.sessionsTitle}</CardTitle>
        <EmptyState
          icon="🌊"
          title={t.common.comingSoon}
          description={t.profile.sessionsEmpty}
        />
      </section>
    </>
  );
}
