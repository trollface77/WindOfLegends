"use client";

import { useActionState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FormField, Input, Textarea } from "@/components/ui/form-field";
import type { SpotOption } from "@/features/geo";
import type { Messages } from "@/i18n/messages/pt-BR";
import { updateProfile, type FormState } from "../server/actions";
import { AVATAR_TYPES } from "../schemas";
import { GpsConsentField } from "./gps-consent";
import { SpotSelect } from "./spot-select";

interface Props {
  t: Messages;
  spots: SpotOption[];
  defaults: {
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    homeSpotId: string | null;
    gpsConsent: boolean;
  };
}

export function EditProfileForm({ t, spots, defaults }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    updateProfile,
    { status: "idle" },
  );
  const e = state.errors ?? {};

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Avatar
          name={defaults.displayName}
          src={defaults.avatarUrl}
          size={72}
        />
        <div className="flex-1">
          <FormField
            id="avatar"
            label={t.profile.avatar}
            hint={t.profile.avatarHint}
            error={e.avatar}
          >
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept={AVATAR_TYPES.join(",")}
              className="text-sm text-mist file:mr-3 file:rounded-full file:border-0 file:bg-swell file:px-3 file:py-1.5 file:text-foam"
            />
          </FormField>
        </div>
      </div>
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
          defaultValue={defaults.displayName}
          error={e.displayName}
        />
      </FormField>
      <FormField
        id="bio"
        label={`${t.profile.bio} (${t.common.optional})`}
        error={e.bio}
      >
        <Textarea
          id="bio"
          name="bio"
          maxLength={280}
          defaultValue={defaults.bio ?? ""}
          error={e.bio}
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
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={
            state.status === "error"
              ? "text-sm text-coral"
              : "text-sm text-turquoise"
          }
        >
          {state.message}
        </p>
      )}
      <Button type="submit" size="lg" loading={pending}>
        {t.common.save}
      </Button>
    </form>
  );
}
