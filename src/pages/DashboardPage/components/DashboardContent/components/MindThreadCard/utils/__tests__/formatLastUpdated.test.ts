import { describe, it, expect, beforeEach, vi } from "vitest";
import { formatLastUpdated } from "../formatLastUpdated";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("formatLastUpdated", () => {
  it("should return 'just now' for dates within the last 60 seconds", () => {
    const now = new Date("2026-06-29T10:00:00");
    vi.setSystemTime(now);

    const thirtySecondsAgo = new Date("2026-06-29T09:59:30").toISOString();
    expect(formatLastUpdated(thirtySecondsAgo)).toBe("just now");

    const justBeforeAMinute = new Date("2026-06-29T09:59:01").toISOString();
    expect(formatLastUpdated(justBeforeAMinute)).toBe("just now");
  });

  it("should return '1 minute ago' for dates 1 minute in the past", () => {
    const now = new Date("2026-06-29T10:00:00");
    vi.setSystemTime(now);

    const oneMinuteAgo = new Date("2026-06-29T09:59:00").toISOString();
    expect(formatLastUpdated(oneMinuteAgo)).toBe("1 minute ago");
  });

  it("should return 'X minutes ago' for dates within the last hour", () => {
    const now = new Date("2026-06-29T10:00:00");
    vi.setSystemTime(now);

    const fiveMinutesAgo = new Date("2026-06-29T09:55:00").toISOString();
    expect(formatLastUpdated(fiveMinutesAgo)).toBe("5 minutes ago");

    const thirtyMinutesAgo = new Date("2026-06-29T09:30:00").toISOString();
    expect(formatLastUpdated(thirtyMinutesAgo)).toBe("30 minutes ago");

    const fiftyNineMinutesAgo = new Date("2026-06-29T09:01:00").toISOString();
    expect(formatLastUpdated(fiftyNineMinutesAgo)).toBe("59 minutes ago");
  });

  it("should return '1 hour ago' for dates 1 hour in the past", () => {
    const now = new Date("2026-06-29T10:00:00");
    vi.setSystemTime(now);

    const oneHourAgo = new Date("2026-06-29T09:00:00").toISOString();
    expect(formatLastUpdated(oneHourAgo)).toBe("1 hour ago");
  });

  it("should return 'X hours ago' for dates within the last 24 hours", () => {
    const now = new Date("2026-06-29T10:00:00");
    vi.setSystemTime(now);

    const twoHoursAgo = new Date("2026-06-29T08:00:00").toISOString();
    expect(formatLastUpdated(twoHoursAgo)).toBe("2 hours ago");

    const twelveHoursAgo = new Date("2026-06-28T22:00:00").toISOString();
    expect(formatLastUpdated(twelveHoursAgo)).toBe("12 hours ago");

    const twentyThreeHoursAgo = new Date("2026-06-28T11:00:00").toISOString();
    expect(formatLastUpdated(twentyThreeHoursAgo)).toBe("23 hours ago");
  });

  it("should return 'yesterday' for dates exactly 1 day in the past", () => {
    const now = new Date("2026-06-29T10:00:00");
    vi.setSystemTime(now);

    const oneDayAgo = new Date("2026-06-28T10:00:00").toISOString();
    expect(formatLastUpdated(oneDayAgo)).toBe("yesterday");
  });

  it("should return 'X days ago' for dates after 1 day in the past", () => {
    const now = new Date("2026-06-29T10:00:00");
    vi.setSystemTime(now);

    const twoDaysAgo = new Date("2026-06-27T10:00:00").toISOString();
    expect(formatLastUpdated(twoDaysAgo)).toBe("2 days ago");

    const fiveDaysAgo = new Date("2026-06-24T10:00:00").toISOString();
    expect(formatLastUpdated(fiveDaysAgo)).toBe("5 days ago");

    const sixDaysAgo = new Date("2026-06-23T10:00:00").toISOString();
    expect(formatLastUpdated(sixDaysAgo)).toBe("6 days ago");
  });

  it("should return an empty string when updated date is in the future", () => {
    const now = new Date("2026-06-29T10:00:00");
    vi.setSystemTime(now);

    const futureDate = new Date("2026-06-30T10:00:00").toISOString();
    expect(formatLastUpdated(futureDate)).toBe("");
  });

  it("should handle ISO date strings correctly", () => {
    const now = new Date("2026-06-29T10:00:00Z");
    vi.setSystemTime(now);

    const isoDate = new Date("2026-06-29T09:55:00Z").toISOString();
    expect(formatLastUpdated(isoDate)).toBe("5 minutes ago");
  });
});
