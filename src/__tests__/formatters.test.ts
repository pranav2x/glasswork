import { describe, it, expect, vi, afterEach } from "vitest";
import { getInitials, formatTimeAgo, formatRelativeDate } from "@/lib/formatters";

describe("getInitials", () => {
  it("returns ? for null/undefined name", () => {
    expect(getInitials(null)).toBe("?");
    expect(getInitials(undefined)).toBe("?");
    expect(getInitials("")).toBe("?");
  });

  it("returns single initial for single name", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("returns two initials for full name", () => {
    expect(getInitials("Alice Johnson")).toBe("AJ");
  });

  it("returns at most two initials", () => {
    expect(getInitials("Alice Bob Charlie")).toBe("AB");
  });

  it("uppercases the initials", () => {
    expect(getInitials("alice bob")).toBe("AB");
  });
});

describe("formatTimeAgo", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'Just now' for recent timestamps", () => {
    expect(formatTimeAgo(Date.now())).toBe("Just now");
  });

  it("returns minutes ago", () => {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    expect(formatTimeAgo(fiveMinAgo)).toBe("5 min ago");
  });

  it("returns hours ago", () => {
    const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
    expect(formatTimeAgo(threeHoursAgo)).toBe("3h ago");
  });

  it("returns days ago", () => {
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
    expect(formatTimeAgo(twoDaysAgo)).toBe("2d ago");
  });
});

describe("formatRelativeDate", () => {
  it("returns 'Today' for today's date", () => {
    expect(formatRelativeDate(new Date().toISOString())).toBe("Today");
  });

  it("returns 'Yesterday' for yesterday", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(yesterday.toISOString())).toBe("Yesterday");
  });
});
