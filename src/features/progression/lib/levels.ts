/**
 * Rider level curve (design doc §3.3).
 *
 * Milestone levels are fixed. Levels in between use geometric interpolation
 * between the neighbouring milestones, rounded to 10 XP. The database seed
 * (rider_levels) must match `LEVEL_TABLE`; a unit test guards this.
 *
 * This module only *reads* progress for display. XP is awarded server-side.
 */

export const MAX_LEVEL = 50;
/** Levels enabled for the MVP (design doc §15). */
export const MVP_MAX_LEVEL = 10;

export const MILESTONES: ReadonlyArray<{
  level: number;
  xp: number;
  rank: string;
}> = [
  { level: 1, xp: 0, rank: "Rookie" },
  { level: 2, xp: 100, rank: "Apprentice" },
  { level: 3, xp: 250, rank: "Rider" },
  { level: 5, xp: 700, rank: "Explorer" },
  { level: 10, xp: 2_000, rank: "Adventurer" },
  { level: 15, xp: 4_500, rank: "Wind Chaser" },
  { level: 20, xp: 8_000, rank: "Wave Hunter" },
  { level: 25, xp: 13_000, rank: "Pro Rider" },
  { level: 30, xp: 20_000, rank: "Elite" },
  { level: 35, xp: 30_000, rank: "Master Rider" },
  { level: 40, xp: 45_000, rank: "Legend" },
  { level: 45, xp: 65_000, rank: "Wind Master" },
  { level: 50, xp: 100_000, rank: "Icon" },
];

function buildTable(): number[] {
  const table: number[] = [];
  for (let level = 1; level <= MAX_LEVEL; level++) {
    const exact = MILESTONES.find((m) => m.level === level);
    if (exact) {
      table.push(exact.xp);
      continue;
    }
    const lower = [...MILESTONES].reverse().find((m) => m.level < level)!;
    const upper = MILESTONES.find((m) => m.level > level)!;
    const t = (level - lower.level) / (upper.level - lower.level);
    const xp = lower.xp * Math.pow(upper.xp / lower.xp, t);
    table.push(Math.round(xp / 10) * 10);
  }
  return table;
}

/** XP required to reach each level; index 0 is level 1. */
export const LEVEL_TABLE: readonly number[] = Object.freeze(buildTable());

export function xpRequiredForLevel(level: number): number {
  const clamped = Math.min(Math.max(Math.trunc(level), 1), MAX_LEVEL);
  return LEVEL_TABLE[clamped - 1]!;
}

/** Highest level reached with `xp`, optionally capped (the MVP caps at 10). */
export function levelForXp(xp: number, cap: number = MAX_LEVEL): number {
  const safeXp = Math.max(0, Math.floor(xp));
  let level = 1;
  for (let i = 1; i < Math.min(cap, MAX_LEVEL); i++) {
    if (safeXp >= LEVEL_TABLE[i]!) level = i + 1;
    else break;
  }
  return level;
}

/** Rank title for a level: the title of the highest milestone at or below it. */
export function rankTitleForLevel(level: number): string {
  return [...MILESTONES].reverse().find((m) => m.level <= level)!.rank;
}

export interface LevelProgress {
  level: number;
  rank: string;
  xp: number;
  currentLevelXp: number;
  nextLevelXp: number | null;
  /** 0..1 progress towards the next level (1 at the cap). */
  ratio: number;
}

export function levelProgress(
  xp: number,
  cap: number = MAX_LEVEL,
): LevelProgress {
  const safeXp = Math.max(0, Math.floor(xp));
  const level = levelForXp(safeXp, cap);
  const currentLevelXp = xpRequiredForLevel(level);
  const atCap = level >= Math.min(cap, MAX_LEVEL);
  const nextLevelXp = atCap ? null : xpRequiredForLevel(level + 1);
  const ratio =
    nextLevelXp === null
      ? 1
      : Math.min(1, (safeXp - currentLevelXp) / (nextLevelXp - currentLevelXp));
  return {
    level,
    rank: rankTitleForLevel(level),
    xp: safeXp,
    currentLevelXp,
    nextLevelXp,
    ratio,
  };
}
