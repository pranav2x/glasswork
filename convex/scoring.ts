/**
 * Shared scoring utilities for Fair Share Score computation.
 * These are pure functions used by both Google Doc and GitHub analysis actions.
 */

export interface ContributionInput {
  name: string;
  emailOrHandle?: string;
  metric: number;
  timestamps: number[];
  rawStats: Record<string, number>;
}

export interface ScoredContributor {
  name: string;
  emailOrHandle?: string;
  score: number;
  tier: "carry" | "solid" | "ghost";
  rawStats: Record<string, number>;
  heatmapData: number[];
}

/**
 * Normalizes contribution metrics to 0–100 Fair Share Scores and assigns tiers.
 *
 * Algorithm:
 *   score = round((userMetric / maxMetric) * 100)
 *   tier = "carry" if top scorer, "ghost" if score < 25 or bottom third, "solid" otherwise
 */
export function computeFairShareScores(
  contributions: ContributionInput[]
): ScoredContributor[] {
  if (contributions.length === 0) return [];

  const maxMetric = Math.max(...contributions.map((c) => c.metric));
  if (maxMetric === 0) {
    return contributions.map((c) => ({
      name: c.name,
      emailOrHandle: c.emailOrHandle,
      score: 0,
      tier: "ghost" as const,
      rawStats: c.rawStats,
      heatmapData: generateHeatmapData(c.timestamps),
    }));
  }

  const scored = contributions.map((c) => ({
    name: c.name,
    emailOrHandle: c.emailOrHandle,
    score: Math.round((c.metric / maxMetric) * 100),
    rawStats: c.rawStats,
    timestamps: c.timestamps,
  }));

  // Sort descending by score to determine tiers
  const sortedScores = [...scored].sort((a, b) => b.score - a.score);
  const topScore = sortedScores[0].score;
  const thirdIdx = Math.ceil(sortedScores.length / 3);
  const bottomThirdThreshold =
    sortedScores.length > 2
      ? sortedScores[sortedScores.length - thirdIdx]?.score ?? 0
      : 0;

  return scored.map((c) => ({
    name: c.name,
    emailOrHandle: c.emailOrHandle,
    score: c.score,
    tier: assignTier(c.score, topScore, bottomThirdThreshold),
    rawStats: c.rawStats,
    heatmapData: generateHeatmapData(c.timestamps),
  }));
}

/**
 * Assigns a tier label based on the score relative to others.
 * - "carry": the top scorer
 * - "ghost": score < 25 OR in the bottom third
 * - "solid": everything else
 */
function assignTier(
  score: number,
  topScore: number,
  bottomThirdThreshold: number
): "carry" | "solid" | "ghost" {
  if (score === topScore && score > 0) return "carry";
  if (score < 25 || score <= bottomThirdThreshold) return "ghost";
  return "solid";
}

/**
 * Buckets activity timestamps into a 20-cell heatmap array with values 0–1.
 * Each cell represents an equal slice of the time window.
 * Values are normalized relative to the busiest bucket.
 */
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

/**
 * Computes a recency-weighted metric for revision/commit counts.
 * Newer activities get a bonus: weight = 1 + 0.5 * recencyFactor
 * where recencyFactor ranges from 0 (oldest) to 1 (newest).
 */
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
