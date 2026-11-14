import type { Messages } from "@/i18n/messages/pt-BR";

export function GpsConsentField({
  t,
  defaultChecked,
}: {
  t: Messages["onboarding"];
  defaultChecked: boolean;
}) {
  return (
    <fieldset className="flex flex-col gap-3 rounded-card border border-cyan/20 bg-cyan/5 p-4">
      <legend className="sr-only">{t.gpsTitle}</legend>
      <p className="flex items-center gap-2 font-semibold text-cyan">
        <span aria-hidden>🛰️</span>
        {t.gpsTitle}
      </p>
      <p className="text-sm text-mist">{t.gpsBody}</p>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="gpsConsent"
          defaultChecked={defaultChecked}
          className="mt-0.5 size-5 shrink-0 accent-turquoise"
        />
        <span>{t.gpsConsent}</span>
      </label>
      <p className="text-xs text-mist">{t.gpsLater}</p>
    </fieldset>
  );
}
