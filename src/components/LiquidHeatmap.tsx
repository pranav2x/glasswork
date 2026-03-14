import type { SourceType } from "@/lib/types";

interface LiquidHeatmapProps {
  mode?: SourceType;
  data: number[];
  color?: string;
  githubData?: number[];
  docsData?: number[];
}

const SEED_HEIGHTS = [24, 30, 20, 28, 34, 22, 29, 26, 32, 19];

function getCellColor(
  mode: SourceType | undefined,
  value: number,
  overrideColor?: string,
  githubValue?: number,
  docsValue?: number
): string {
  if (overrideColor) {
    if (value === 0) return "rgba(255, 255, 255, 0.06)";
    const opacity = Math.max(0.15, Math.min(0.9, value));
    return `${overrideColor}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`;
  }

  if (githubValue !== undefined && docsValue !== undefined) {
    const g = githubValue;
    const d = docsValue;
    if (g === 0 && d === 0) return "rgba(255, 255, 255, 0.06)";

    const r = Math.round(140 * d);
    const gChan = Math.round(180 * g + 80 * d);
    const b = Math.round(200 * g + 255 * d);
    const alpha = Math.max(0.2, Math.min(1, (g + d) / 2 + 0.2));
    return `rgba(${Math.min(r, 255)}, ${Math.min(gChan, 255)}, ${Math.min(b, 255)}, ${alpha})`;
  }

  if (value === 0) return "rgba(255, 255, 255, 0.06)";
  const opacity = Math.max(0.15, Math.min(0.9, value));

  if (mode === "doc") return `rgba(124, 107, 255, ${opacity})`;
  return `rgba(52, 211, 153, ${opacity})`;
}

export function LiquidHeatmap({ mode, data, color, githubData, docsData }: LiquidHeatmapProps) {
  const cells = data.length > 0 ? data : new Array(12).fill(0);

  return (
    <div className="flex items-end gap-[3px]" aria-label="Activity heatmap">
      {cells.map((value, i) => {
        const height = SEED_HEIGHTS[i % SEED_HEIGHTS.length];
        const cellColor = getCellColor(
          mode,
          value,
          color,
          githubData?.[i],
          docsData?.[i]
        );

        return (
          <div
            key={i}
            className="w-[8px] rounded-t-md transition-all duration-300"
            style={{
              height: `${height}px`,
              backgroundColor: cellColor,
            }}
          />
        );
      })}
    </div>
  );
}
