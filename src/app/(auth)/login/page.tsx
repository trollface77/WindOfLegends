import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm, safeNextPath } from "@/features/auth";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { getMessages } from "@/i18n/server";
import { publicEnv } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const t = await getMessages();
  const next = safeNextPath(
    typeof params.next === "string" ? params.next : undefined,
  );
  const initialError = params.error ? t.auth.callbackFailed : undefined;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-5 py-10">
      <Link href="/" className="self-center">
        <Logo className="text-xl" />
      </Link>
      <Card className="flex flex-col gap-6 p-6">
        <header className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-bold">{t.auth.title}</h1>
          <p className="text-sm text-mist">{t.auth.subtitle}</p>
        </header>
        <LoginForm
          t={t.auth}
          next={next}
          googleEnabled={publicEnv().NEXT_PUBLIC_AUTH_GOOGLE_ENABLED}
          initialError={initialError}
        />
      </Card>
    </main>
  );
}
