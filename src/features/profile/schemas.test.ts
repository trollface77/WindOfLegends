import { describe, expect, it } from "vitest";
import {
  checkAvatar,
  fieldErrors,
  onboardingSchema,
  profileSchema,
  usernameSchema,
} from "./schemas";

describe("usernameSchema", () => {
  it.each(["kite_ana", "Rider42", "abc", "a".repeat(24)])("accepts %s", (u) => {
    expect(usernameSchema.safeParse(u).success).toBe(true);
  });

  it.each([
    "ab",
    "a".repeat(25),
    "with space",
    "ação",
    "edit",
    "ADMIN",
    "rider_0123456789",
  ])("rejects %s", (u) => {
    expect(usernameSchema.safeParse(u).success).toBe(false);
  });
});

describe("onboardingSchema", () => {
  const base = {
    username: "kite_ana",
    displayName: "Ana",
    homeSpotId: "",
    gpsConsent: false,
  };

  it("turns an empty home spot into null", () => {
    const parsed = onboardingSchema.parse(base);
    expect(parsed.homeSpotId).toBeNull();
  });

  it("rejects a non-uuid home spot", () => {
    expect(
      onboardingSchema.safeParse({ ...base, homeSpotId: "prea" }).success,
    ).toBe(false);
  });

  it("maps errors to message keys per field", () => {
    const result = onboardingSchema.safeParse({
      ...base,
      username: "x",
      displayName: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldErrors(result.error)).toMatchObject({
        username: "usernameFormat",
        displayName: "displayName",
      });
    }
  });
});

describe("profileSchema", () => {
  it("limits bio to 280 characters and blanks to null", () => {
    const base = {
      username: "kite_ana",
      displayName: "Ana",
      homeSpotId: "",
      gpsConsent: true,
    };
    expect(profileSchema.parse({ ...base, bio: "  " }).bio).toBeNull();
    expect(
      profileSchema.safeParse({ ...base, bio: "x".repeat(281) }).success,
    ).toBe(false);
  });
});

describe("checkAvatar", () => {
  it("accepts small images", () =>
    expect(checkAvatar({ size: 1000, type: "image/png" })).toBeNull());
  it("rejects other types", () =>
    expect(checkAvatar({ size: 1000, type: "image/gif" })).toBe("avatarType"));
  it("rejects large files", () =>
    expect(checkAvatar({ size: 3e6, type: "image/jpeg" })).toBe("avatarSize"));
});
