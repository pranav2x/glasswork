import { describe, it, expect } from "vitest";
import { detectSourceType } from "@/lib/detect-source";

describe("detectSourceType", () => {
  it("detects Google Doc URLs", () => {
    const result = detectSourceType(
      "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVEcuQ/edit"
    );
    expect(result).toEqual({
      type: "google_doc",
      id: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVEcuQ",
    });
  });

  it("detects GitHub repo URLs", () => {
    const result = detectSourceType("https://github.com/vercel/next.js");
    expect(result).toEqual({
      type: "github_repo",
      id: "vercel/next.js",
    });
  });

  it("strips .git suffix from GitHub URLs", () => {
    const result = detectSourceType("https://github.com/owner/repo.git");
    expect(result).toEqual({
      type: "github_repo",
      id: "owner/repo",
    });
  });

  it("detects GitHub shorthand (owner/repo)", () => {
    const result = detectSourceType("facebook/react");
    expect(result).toEqual({
      type: "github_repo",
      id: "facebook/react",
    });
  });

  it("handles whitespace around input", () => {
    const result = detectSourceType("  owner/repo  ");
    expect(result).toEqual({
      type: "github_repo",
      id: "owner/repo",
    });
  });

  it("returns null for invalid input", () => {
    expect(detectSourceType("")).toBeNull();
    expect(detectSourceType("just some text")).toBeNull();
    expect(detectSourceType("http://example.com")).toBeNull();
  });

  it("returns null for single word without slash", () => {
    expect(detectSourceType("react")).toBeNull();
  });
});
