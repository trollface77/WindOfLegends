"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/form-field";
import type { SpotOption } from "@/features/geo";
import type { Messages } from "@/i18n/messages/pt-BR";
import { completeOnboarding, type FormState } from "../server/actions";
import { GpsConsentField } from "./gps-consent";
import { SpotSelect } from "./spot-select";

interface Props {
  t: Messages;
  spots: SpotOption[];
  defaults: {
    username: string;
    displayName: string;
    homeSpotId: string | null;
    gpsConsent: boolean;
  };
}

export function OnboardingForm({ t, spots, defaults }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    completeOnboarding,
    { status: "idle" },
  );
  const e = state.errors ?? {};

  return (
    <form action={action} className="flex flex-col gap-5">
      <FormField
        id="username"
        label={t.onboarding.username}
        hint={t.onboarding.usernameHint}
        error={e.username}
      >
        <Input
          id="username"
          name="username"
          required
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={24}
          defaultValue={defaults.username}
          hint={t.onboarding.usernameHint}
          error={e.username}
        />
      </FormField>
      <FormField
        id="displayName"
        label={t.onboarding.displayName}
        error={e.displayName}
      >
        <Input
          id="displayName"
          name="displayName"
          required
          maxLength={60}
          autoComplete="nickname"
          defaultValue={defaults.displayName}
          error={e.displayName}
        />
      </FormField>
      <SpotSelect
        label={t.onboarding.homeSpot}
        noneLabel={t.onboarding.homeSpotNone}
        spots={spots}
        defaultValue={defaults.homeSpotId}
        error={e.homeSpotId}
      />
      <GpsConsentField t={t.onboarding} defaultChecked={defaults.gpsConsent} />
      {state.message && (
        <p role="alert" className="text-sm text-coral">
          {state.message}
        </p>
      )}
      <Button type="submit" size="lg" loading={pending}>
        {t.onboarding.submit}
      </Button>
    </form>
  );
}
