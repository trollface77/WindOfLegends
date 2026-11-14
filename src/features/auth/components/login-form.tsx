"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/form-field";
import { format } from "@/i18n/config";
import type { Messages } from "@/i18n/messages/pt-BR";
import {
  signInWithEmail,
  signInWithGoogle,
  type SignInState,
} from "../server/actions";

interface Props {
  t: Messages["auth"];
  next: string;
  googleEnabled: boolean;
  initialError?: string;
}

export function LoginForm({ t, next, googleEnabled, initialError }: Props) {
  const [state, action, pending] = useActionState<SignInState, FormData>(
    signInWithEmail,
    initialError
      ? { status: "error", message: initialError }
      : { status: "idle" },
  );

  if (state.status === "sent") {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 text-center"
      >
        <div className="text-4xl" aria-hidden>
          📬
        </div>
        <h2 className="font-display text-xl font-semibold">
          {t.checkEmailTitle}
        </h2>
        <p className="text-mist">
          {format(t.checkEmailBody, { email: state.email })}
        </p>
      </div>
    );
  }

  const error = state.status === "error" ? state.message : undefined;

  return (
    <div className="flex flex-col gap-5">
      <form action={action} className="flex flex-col gap-4" noValidate>
        <input type="hidden" name="next" value={next} />
        <FormField id="email" label={t.emailLabel} error={error}>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder={t.emailPlaceholder}
            defaultValue={state.status === "error" ? state.email : undefined}
            error={error}
          />
        </FormField>
        <Button type="submit" size="lg" loading={pending}>
          {t.sendLink}
        </Button>
      </form>

      {googleEnabled && (
        <>
          <div className="flex items-center gap-3 text-xs text-mist">
            <span className="h-px flex-1 bg-white/10" />
            {t.or}
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <form action={signInWithGoogle}>
            <input type="hidden" name="next" value={next} />
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full"
            >
              {t.google}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
