import type { SourceType } from "@/lib/types";

interface LiquidHeatmapProps {
  mode: SourceType;
  data: number[];
  githubData?: number[];
  docsData?: number[];
}

const SEED_HEIGHTS = [24, 30, 20, 28, 34, 22, 29, 26, 32, 19];

/**
 * RGB multi-channel heatmap:
 * - GitHub = Cyan (0, 180, 200)
 * - Docs = Magenta (140, 80, 255)
 * - Both = Purple (additive mix)
 * Falls back to single-source coloring if per-source data isn't available.
 */
function getCellColor(
  mode: SourceType,
  value: number,
  githubValue?: number,
  docsValue?: number
): string {
  if (githubValue !== undefined && docsValue !== undefined) {
    const g = githubValue;
    const d = docsValue;
    if (g === 0 && d === 0) return "rgba(200, 195, 185, 0.15)";

    const r = Math.round(140 * d);
    const gChan = Math.round(180 * g + 80 * d);
    const b = Math.round(200 * g + 255 * d);
    const alpha = Math.max(0.2, Math.min(1, (g + d) / 2 + 0.2));
    return `rgba(${Math.min(r, 255)}, ${Math.min(gChan, 255)}, ${Math.min(b, 255)}, ${alpha})`;
  }

  if (value === 0) return "rgba(200, 195, 185, 0.15)";
  const opacity = Math.max(0.15, Math.min(0.9, value));

  if (mode === "doc") return `rgba(124, 107, 255, ${opacity})`;
  return `rgba(45, 164, 78, ${opacity})`;
}

export function LiquidHeatmap({ mode, data, githubData, docsData }: LiquidHeatmapProps) {
  const cells = data.length > 0 ? data : new Array(12).fill(0);

  return (
    <div className="flex items-end gap-[3px]" aria-label="Activity heatmap">
      {cells.map((value, i) => {
        const height = SEED_HEIGHTS[i % SEED_HEIGHTS.length];
        const color = getCellColor(
          mode,
          value,
          githubData?.[i],
          docsData?.[i]
        );

        return (
          <div
            key={i}
            className="w-[8px] rounded-t-md transition-all duration-300"
            style={{
              height: `${height}px`,
              backgroundColor: color,
            }}
          />
        );
      })}
    </div>
  );
}
