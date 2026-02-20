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
 * Capped at 200 for readable display.
 *
 * Score = min(200, (Your Contribution / (Total / N)) * 100)
 *
 * Tiers (percentile-based):
 *   Top 25%    → carry (gold)
 *   Middle 50% → solid (green)
 *   Bottom 25% → ghost (red)
 *
 * For solo contributors, tier defaults to "solid".
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

  // Calculate raw scores and sort by score descending for percentile ranking
  const scored = contributions.map((c) => ({
    ...c,
    score: Math.min(200, Math.round((c.metric / fairShare) * 100)),
    heatmapData: generateHeatmapData(c.timestamps),
  }));

  scored.sort((a, b) => b.score - a.score);

  const n = scored.length;

  return scored.map((c, rank) => {
    let tier: "carry" | "solid" | "ghost";

    if (n === 1) {
      tier = "solid";
    } else {
      const percentile = rank / (n - 1); // 0 = top, 1 = bottom
      if (percentile <= 0.25) {
        tier = "carry";
      } else if (percentile >= 0.75) {
        tier = "ghost";
      } else {
        tier = "solid";
      }
    }

    return {
      name: c.name,
      emailOrHandle: c.emailOrHandle,
      avatarUrl: c.avatarUrl,
      score: c.score,
      tier,
      rawStats: c.rawStats,
      heatmapData: c.heatmapData,
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
