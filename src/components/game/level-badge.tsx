import { cn } from "@/lib/utils";

/** "10 · Adventurer". Gold is reserved for achievements, so levels use turquoise. */
export function LevelBadge({
  level,
  rank,
  className,
}: {
  level: number;
  rank: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-turquoise/30 bg-turquoise/10 px-3 py-1 text-sm font-semibold text-turquoise",
        className,
      )}
    >
      <span className="font-display tabular-nums">{level}</span>
      <span aria-hidden className="text-turquoise/50">
        ·
      </span>
      <span>{rank}</span>
    </span>
  );
}
