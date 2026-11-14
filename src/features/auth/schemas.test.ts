import { describe, expect, it } from "vitest";
import { safeNextPath, signInSchema } from "./schemas";

describe("safeNextPath", () => {
  it.each([
    [undefined, "/home"],
    ["", "/home"],
    ["/profile/edit", "/profile/edit"],
    ["https://evil.example", "/home"],
    ["//evil.example", "/home"],
    ["/\\evil.example", "/home"],
  ])("%s → %s", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });
});

describe("signInSchema", () => {
  it("accepts a valid email", () => {
    expect(signInSchema.safeParse({ email: "rider@example.com" }).success).toBe(
      true,
    );
  });
  it("rejects an invalid email", () => {
    expect(signInSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});
