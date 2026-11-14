import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/empty-state";
import { getMessages } from "@/i18n/server";

export const metadata: Metadata = { title: "League" };

export default async function LeaguePage() {
  const t = await getMessages();
  return (
    <>
      <h1 className="font-display text-2xl font-bold">{t.nav.league}</h1>
      <EmptyState
        icon="🏆"
        title={t.common.comingSoon}
        description={t.placeholders.league}
      />
    </>
  );
}
