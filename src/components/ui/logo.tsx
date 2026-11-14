import { cn } from "@/lib/utils";

/** Wordmark: a kite-wing mark plus the name. Placeholder until official branding exists. */
export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-display font-bold tracking-tight",
        className,
      )}
    >
      <svg viewBox="0 0 32 32" aria-hidden className="size-7">
        <path
          d="M4 18C8 8 22 4 28 8c-6 0-14 4-18 14z"
          fill="var(--color-turquoise)"
        />
        <path
          d="M10 22 20 28"
          stroke="var(--color-cyan)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M6 26c6 2 14 2 22-2"
          stroke="var(--color-gold)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {!compact && <span>Wind of Legend</span>}
    </span>
  );
}
