import type { LevelProgress } from "@/features/progression";

const fmt = new Intl.NumberFormat("en-US");

/** Progress to the next level. Values always come from the server. */
export function XPBar({
  progress,
  label = "XP",
}: {
  progress: LevelProgress;
  label?: string;
}) {
  const percent = Math.round(progress.ratio * 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div
        role="progressbar"
        aria-label={`${label}: ${percent}%`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2.5 overflow-hidden rounded-full bg-swell"
      >
        <div
          className="h-full origin-left animate-fill rounded-full bg-gradient-to-r from-turquoise to-cyan"
          style={{ width: `${Math.max(percent, 2)}%` }}
        />
      </div>
      <p className="text-right text-xs text-mist tabular-nums">
        {progress.nextLevelXp === null
          ? `${fmt.format(progress.xp)} ${label}`
          : `${fmt.format(progress.xp)} / ${fmt.format(progress.nextLevelXp)} ${label}`}
      </p>
    </div>
  );
}
