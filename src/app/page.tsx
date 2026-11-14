import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { getMessages } from "@/i18n/server";

export default async function LandingPage() {
  const t = await getMessages();
  const pillars = [
    { icon: "🧭", ...t.landing.pillars.explore },
    { icon: "⚡", ...t.landing.pillars.progress },
    { icon: "🤙", ...t.landing.pillars.crew },
  ];

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col gap-10 overflow-hidden px-5 pt-12 pb-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-96 bg-[radial-gradient(ellipse_at_center,var(--color-turquoise)_0%,transparent_65%)] opacity-20"
      />
      <Logo className="text-lg" />
      <section className="flex flex-col gap-4">
        <h1 className="font-display text-4xl leading-tight font-bold">
          {t.landing.title}
        </h1>
        <p className="text-mist">{t.landing.subtitle}</p>
        <Link href="/login" className={buttonClasses("primary", "lg", "mt-2")}>
          {t.landing.cta}
        </Link>
      </section>
      <section className="flex flex-col gap-3">
        {pillars.map((p) => (
          <Card key={p.title} className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden>
              {p.icon}
            </span>
            <div>
              <h2 className="font-display font-semibold">{p.title}</h2>
              <p className="text-sm text-mist">{p.body}</p>
            </div>
          </Card>
        ))}
      </section>
      <p className="mt-auto text-center text-xs tracking-widest text-mist uppercase">
        {t.common.tagline}
      </p>
    </main>
  );
}
