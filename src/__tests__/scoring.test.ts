import { describe, it, expect } from "vitest";
import {
  computeFairShareScores,
  generateHeatmapData,
  recencyWeightedSum,
  type ContributionInput,
} from "../../convex/scoring";

describe("computeFairShareScores", () => {
  it("returns empty array for no contributions", () => {
    expect(computeFairShareScores([])).toEqual([]);
  });

  it("assigns ghost tier when all metrics are zero", () => {
    const input: ContributionInput[] = [
      { name: "Alice", metric: 0, timestamps: [], rawStats: {} },
      { name: "Bob", metric: 0, timestamps: [], rawStats: {} },
    ];
    const result = computeFairShareScores(input);
    expect(result).toHaveLength(2);
    expect(result.every((c) => c.tier === "ghost")).toBe(true);
    expect(result.every((c) => c.score === 0)).toBe(true);
  });

  it("assigns solid tier for solo contributor", () => {
    const input: ContributionInput[] = [
      { name: "Solo", metric: 100, timestamps: [Date.now()], rawStats: { commits: 10 } },
    ];
    const result = computeFairShareScores(input);
    expect(result).toHaveLength(1);
    expect(result[0].tier).toBe("solid");
    expect(result[0].score).toBe(100);
  });

  it("caps score at 200", () => {
    const input: ContributionInput[] = [
      { name: "Carry", metric: 1000, timestamps: [], rawStats: {} },
      { name: "Ghost", metric: 1, timestamps: [], rawStats: {} },
    ];
    const result = computeFairShareScores(input);
    const carry = result.find((c) => c.name === "Carry");
    expect(carry?.score).toBe(200);
  });

  it("correctly assigns carry/solid/ghost tiers for a team", () => {
    const input: ContributionInput[] = [
      { name: "Top", metric: 500, timestamps: [], rawStats: {} },
      { name: "Mid1", metric: 200, timestamps: [], rawStats: {} },
      { name: "Mid2", metric: 150, timestamps: [], rawStats: {} },
      { name: "Bot", metric: 50, timestamps: [], rawStats: {} },
    ];
    const result = computeFairShareScores(input);
    expect(result[0].name).toBe("Top");
    expect(result[0].tier).toBe("carry");
    expect(result[result.length - 1].tier).toBe("ghost");
  });

  it("returns results sorted by score descending", () => {
    const input: ContributionInput[] = [
      { name: "C", metric: 10, timestamps: [], rawStats: {} },
      { name: "A", metric: 100, timestamps: [], rawStats: {} },
      { name: "B", metric: 50, timestamps: [], rawStats: {} },
    ];
    const result = computeFairShareScores(input);
    expect(result[0].name).toBe("A");
    expect(result[1].name).toBe("B");
    expect(result[2].name).toBe("C");
  });

  it("generates heatmap data for each contributor", () => {
    const now = Date.now();
    const input: ContributionInput[] = [
      { name: "A", metric: 100, timestamps: [now - 10000, now], rawStats: {} },
    ];
    const result = computeFairShareScores(input);
    expect(result[0].heatmapData).toHaveLength(20);
  });
});

describe("generateHeatmapData", () => {
  it("returns all zeros for empty timestamps", () => {
    const result = generateHeatmapData([]);
    expect(result).toHaveLength(20);
    expect(result.every((v) => v === 0)).toBe(true);
  });

  it("generates normalized heatmap with custom cell count", () => {
    const now = Date.now();
    const timestamps = [now - 5000, now - 4000, now - 3000, now - 2000, now - 1000, now];
    const result = generateHeatmapData(timestamps, 5);
    expect(result).toHaveLength(5);
    expect(Math.max(...result)).toBeLessThanOrEqual(1);
  });

  it("handles single timestamp", () => {
    const result = generateHeatmapData([Date.now()], 10);
    expect(result).toHaveLength(10);
  });
});

describe("recencyWeightedSum", () => {
  it("returns 0 for empty timestamps", () => {
    expect(recencyWeightedSum([])).toBe(0);
  });

  it("returns 1.5 for single timestamp", () => {
    expect(recencyWeightedSum([Date.now()])).toBe(1.5);
  });

  it("weights more recent timestamps higher", () => {
    const now = Date.now();
    const timestamps = [now - 10000, now - 5000, now];
    const result = recencyWeightedSum(timestamps);
    expect(result).toBeGreaterThan(3);
  });
});
