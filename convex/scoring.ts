export interface ContributionInput {
  name: string;
  emailOrHandle?: string;
  avatarUrl?: string;
  metric: number;
  timestamps: number[];
  rawStats: Record<string, number>;
}

export interface ScoredContributor {
  name: string;
  emailOrHandle?: string;
  avatarUrl?: string;
  score: number;
  tier: "carry" | "solid" | "ghost";
  rawStats: Record<string, number>;
  heatmapData: number[];
}

/**
 * Fair Share Score: 100 = exactly your fair share (1/N of total work).
 * > 100 = overcontributor, < 100 = undercontributor.
 *
 * Score = (Your Contribution / (Total Team Contribution / Team Size)) * 100
 *
 * Tiers:
 *   >= 120 → carry (gold)
 *   50-119 → solid (green)
 *   < 50   → ghost (red)
 */
export function computeFairShareScores(
  contributions: ContributionInput[]
): ScoredContributor[] {
  if (contributions.length === 0) return [];

  const totalMetric = contributions.reduce((sum, c) => sum + c.metric, 0);

  if (totalMetric === 0) {
    return contributions.map((c) => ({
      name: c.name,
      emailOrHandle: c.emailOrHandle,
      avatarUrl: c.avatarUrl,
      score: 0,
      tier: "ghost" as const,
      rawStats: c.rawStats,
      heatmapData: generateHeatmapData(c.timestamps),
    }));
  }

  const fairShare = totalMetric / contributions.length;

  return contributions.map((c) => {
    const score = Math.round((c.metric / fairShare) * 100);
    const tier: "carry" | "solid" | "ghost" =
      score >= 120 ? "carry" : score >= 50 ? "solid" : "ghost";

    return {
      name: c.name,
      emailOrHandle: c.emailOrHandle,
      avatarUrl: c.avatarUrl,
      score,
      tier,
      rawStats: c.rawStats,
      heatmapData: generateHeatmapData(c.timestamps),
    };
  });
}

export function generateHeatmapData(
  timestamps: number[],
  cells: number = 20
): number[] {
  if (timestamps.length === 0) return new Array(cells).fill(0);

  const sorted = [...timestamps].sort((a, b) => a - b);
  const minTime = sorted[0];
  const maxTime = sorted[sorted.length - 1];
  const range = maxTime - minTime || 1;

  const buckets = new Array(cells).fill(0);
  for (const ts of sorted) {
    const idx = Math.min(
      Math.floor(((ts - minTime) / range) * cells),
      cells - 1
    );
    buckets[idx]++;
  }

  const maxBucket = Math.max(...buckets);
  if (maxBucket === 0) return buckets;

  return buckets.map((b) => Math.round((b / maxBucket) * 100) / 100);
}

export function recencyWeightedSum(timestamps: number[]): number {
  if (timestamps.length === 0) return 0;
  if (timestamps.length === 1) return 1.5;

  const sorted = [...timestamps].sort((a, b) => a - b);
  const minTime = sorted[0];
  const maxTime = sorted[sorted.length - 1];
  const range = maxTime - minTime || 1;

  return sorted.reduce((sum, ts) => {
    const recencyFactor = (ts - minTime) / range;
    return sum + (1 + 0.5 * recencyFactor);
  }, 0);
}
