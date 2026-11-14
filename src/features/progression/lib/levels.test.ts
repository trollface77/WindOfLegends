import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  LEVEL_TABLE,
  MAX_LEVEL,
  MILESTONES,
  MVP_MAX_LEVEL,
  levelForXp,
  levelProgress,
  rankTitleForLevel,
  xpRequiredForLevel,
} from "./levels";

describe("level curve", () => {
  it("has 50 levels starting at 0 XP", () => {
    expect(LEVEL_TABLE).toHaveLength(MAX_LEVEL);
    expect(LEVEL_TABLE[0]).toBe(0);
  });

  it("matches every milestone from the design document exactly", () => {
    for (const m of MILESTONES) expect(xpRequiredForLevel(m.level)).toBe(m.xp);
  });

  it("is strictly increasing", () => {
    for (let i = 1; i < LEVEL_TABLE.length; i++) {
      expect(LEVEL_TABLE[i]!).toBeGreaterThan(LEVEL_TABLE[i - 1]!);
    }
  });

  it("matches the rider_levels seed in the schema", () => {
    const sql = readFileSync(
      new URL("../../../../docs/03-initial-schema.sql", import.meta.url),
      "utf8",
    );
    const seeded = [
      ...sql.matchAll(/\((\d+),(?:'[^']*'|null),(\d+),(?:true|false)\)/g),
    ].map((m) => [Number(m[1]), Number(m[2])]);
    expect(seeded).toHaveLength(MAX_LEVEL);
    for (const [level, xp] of seeded)
      expect(xpRequiredForLevel(level!)).toBe(xp);
  });
});

describe("levelForXp", () => {
  it.each([
    [0, 1],
    [99, 1],
    [100, 2],
    [249, 2],
    [250, 3],
    [700, 5],
    [1_999, 9],
    [2_000, 10],
    [100_000, 50],
    [5_000_000, 50],
  ])("%i XP → level %i", (xp, level) => {
    expect(levelForXp(xp)).toBe(level);
  });

  it("treats negative or fractional XP safely", () => {
    expect(levelForXp(-50)).toBe(1);
    expect(levelForXp(99.9)).toBe(1);
  });

  it("respects the MVP cap of 10 levels", () => {
    expect(levelForXp(50_000, MVP_MAX_LEVEL)).toBe(10);
  });
});

describe("rank titles", () => {
  it("uses the highest milestone at or below the level", () => {
    expect(rankTitleForLevel(1)).toBe("Rookie");
    expect(rankTitleForLevel(4)).toBe("Rider");
    expect(rankTitleForLevel(10)).toBe("Adventurer");
    expect(rankTitleForLevel(49)).toBe("Wind Master");
    expect(rankTitleForLevel(50)).toBe("Icon");
  });
});

describe("levelProgress", () => {
  it("reports progress within the current level", () => {
    const p = levelProgress(175);
    expect(p).toMatchObject({
      level: 2,
      currentLevelXp: 100,
      nextLevelXp: 250,
      rank: "Apprentice",
    });
    expect(p.ratio).toBeCloseTo(0.5);
  });

  it("is full at the cap", () => {
    expect(levelProgress(3_000, MVP_MAX_LEVEL)).toMatchObject({
      level: 10,
      nextLevelXp: null,
      ratio: 1,
    });
  });
});
