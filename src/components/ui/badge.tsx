import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "turquoise" | "gold" | "coral";

const tones: Record<Tone, string> = {
  neutral: "bg-swell text-mist",
  turquoise: "bg-turquoise/15 text-turquoise",
  gold: "bg-gold/15 text-gold",
  coral: "bg-coral/15 text-coral",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
