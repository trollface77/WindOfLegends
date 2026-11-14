import type { Metadata } from "next";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LevelBadge } from "@/components/game/level-badge";
import { XPBar } from "@/components/game/xp-bar";
import { levelProgress, MVP_MAX_LEVEL } from "@/features/progression";
import { requireOnboardedRider } from "@/features/profile/server/queries";
import { format } from "@/i18n/config";
import { getMessages } from "@/i18n/server";

export const metadata: Metadata = { title: "Home" };

export default async function HomePage() {
  const [rider, t] = await Promise.all([
    requireOnboardedRider(),
    getMessages(),
  ]);
  const progress = levelProgress(rider.stats.lifetime_xp, MVP_MAX_LEVEL);
  const firstName =
    rider.profile.display_name.split(" ")[0] ?? rider.profile.display_name;

  return (
    <>
      <Card className="flex flex-col gap-4 bg-gradient-to-br from-deep to-reef/60 p-5">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-2xl font-bold">
            {format(t.home.greeting, { name: firstName })}{" "}
            <span aria-hidden>🌊</span>
          </h1>
          <LevelBadge
            level={progress.level}
            rank={progress.rank}
            className="self-start"
          />
        </div>
        <XPBar progress={progress} />
      </Card>

      <section className="flex flex-col gap-3">
        <CardTitle>{t.home.missionsTitle}</CardTitle>
        <EmptyState
          icon="🎯"
          title={t.common.comingSoon}
          description={t.home.missionsEmpty}
        />
      </section>

      <section className="flex flex-col gap-3">
        <CardTitle>{t.home.downwindsTitle}</CardTitle>
        <EmptyState
          icon="🪁"
          title={t.common.comingSoon}
          description={t.home.downwindsEmpty}
        />
      </section>
    </>
  );
}
