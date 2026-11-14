import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

const controlClasses =
  "w-full rounded-xl border border-white/10 bg-swell px-3 py-2.5 text-foam placeholder:text-mist/70 " +
  "focus:border-cyan focus:outline-none aria-[invalid=true]:border-coral";

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

/** Label + control + hint + error, wired with aria attributes. */
export function FormField({ id, label, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foam">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-mist">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-coral">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

type WithMeta = { id: string; error?: string; hint?: string };

export function Input({
  id,
  error,
  hint,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & WithMeta) {
  return (
    <input
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hint)}
      className={cn(controlClasses, "h-11", className)}
      {...props}
    />
  );
}

export function Textarea({
  id,
  error,
  hint,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & WithMeta) {
  return (
    <textarea
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hint)}
      className={cn(controlClasses, "min-h-24", className)}
      {...props}
    />
  );
}

export function Select({
  id,
  error,
  hint,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & WithMeta) {
  return (
    <select
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(id, error, hint)}
      className={cn(controlClasses, "h-11", className)}
      {...props}
    />
  );
}
