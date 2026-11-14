import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { LevelBadge } from "@/components/game/level-badge";
import { XPBar } from "@/components/game/xp-bar";
import { levelProgress, MVP_MAX_LEVEL } from "@/features/progression";
import type { Messages } from "@/i18n/messages/pt-BR";
import type { PublicRider } from "../server/queries";

export function ProfileHeader({
  rider,
  t,
  locale,
}: {
  rider: PublicRider;
  t: Messages;
  locale: string;
}) {
  const progress = levelProgress(rider.lifetimeXp, MVP_MAX_LEVEL);
  const since = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(new Date(rider.createdAt));
  const xp = new Intl.NumberFormat(locale).format(rider.lifetimeXp);

  return (
    <Card className="flex flex-col gap-5 p-5">
      <div className="flex items-center gap-4">
        <Avatar name={rider.displayName} src={rider.avatarUrl} size={72} />
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="truncate font-display text-2xl font-bold">
            {rider.displayName}
          </h1>
          <p className="text-sm text-mist">@{rider.username}</p>
          <LevelBadge
            level={progress.level}
            rank={progress.rank}
            className="self-start"
          />
        </div>
      </div>
      <XPBar progress={progress} />
      <p className="text-sm text-foam/90">
        {rider.bio ?? <span className="text-mist">{t.profile.noBio}</span>}
      </p>
      <dl className="grid grid-cols-3 gap-3 text-center">
        <Stat label={t.profile.lifetimeXp} value={xp} />
        <Stat label={t.profile.homeSpot} value={rider.homeSpotName ?? "—"} />
        <Stat label={t.profile.memberSince} value={since} />
      </dl>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-swell/60 px-2 py-3">
      <dt className="text-[11px] tracking-wide text-mist uppercase">{label}</dt>
      <dd className="truncate font-display font-semibold tabular-nums">
        {value}
      </dd>
    </div>
  );
}
