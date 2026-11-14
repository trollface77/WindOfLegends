import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import { BottomNav } from "@/components/layout/bottom-nav";
import { requireOnboardedRider } from "@/features/profile/server/queries";
import { getMessages } from "@/i18n/server";

/** Authenticated app shell: top bar + bottom navigation. */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [rider, t] = await Promise.all([
    requireOnboardedRider(),
    getMessages(),
  ]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-abyss/90 px-5 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 backdrop-blur">
        <Link href="/home" aria-label={t.nav.home}>
          <Logo className="text-base" />
        </Link>
        <Link
          href={`/profile/${rider.profile.username}`}
          aria-label={t.nav.profile}
        >
          <Avatar
            name={rider.profile.display_name}
            src={rider.profile.avatar_url}
            size={36}
          />
        </Link>
      </header>
      <main className="flex flex-1 flex-col gap-5 px-5 pt-2 pb-28">
        {children}
      </main>
      <BottomNav
        items={[
          { href: "/home", label: t.nav.home, icon: "home" },
          { href: "/explore", label: t.nav.explore, icon: "explore" },
          { href: "/create", label: t.nav.create, icon: "create" },
          { href: "/league", label: t.nav.league, icon: "league" },
          { href: "/profile", label: t.nav.profile, icon: "profile" },
        ]}
      />
    </div>
  );
}
