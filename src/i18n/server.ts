import "server-only";
import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  matchLocale,
  type Locale,
} from "./config";
import type { Messages } from "./messages/pt-BR";

const loaders: Record<Locale, () => Promise<{ default: Messages }>> = {
  "pt-BR": () => import("./messages/pt-BR"),
  en: () => import("./messages/en"),
  es: () => import("./messages/es"),
};

/** Locale from the rider's cookie, falling back to the browser language. */
export async function getLocale(): Promise<Locale> {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  return (
    matchLocale((await headers()).get("accept-language")) ?? DEFAULT_LOCALE
  );
}

export async function getMessages(locale?: Locale): Promise<Messages> {
  return (await loaders[locale ?? (await getLocale())]()).default;
}
