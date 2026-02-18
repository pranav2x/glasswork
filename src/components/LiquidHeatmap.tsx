import type { SourceType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LiquidHeatmapProps {
  mode: SourceType;
  data: number[];
}

const SEED_HEIGHTS = [18, 22, 16, 20, 24, 17, 21, 19, 23, 15];

export function LiquidHeatmap({ mode, data }: LiquidHeatmapProps) {
  const baseColor = mode === "doc" ? "168,148,255" : "94,159,153";

  return (
    <div className="flex items-end gap-[3px]" aria-label="Activity heatmap">
      {data.map((value, i) => {
        const opacity = Math.max(0.1, Math.min(1, value));
        const height = SEED_HEIGHTS[i % SEED_HEIGHTS.length];

        return (
          <div
            key={i}
            className={cn(
              "w-[7px] rounded-sm transition-all duration-300"
            )}
            style={{
              height: `${height}px`,
              backgroundColor: `rgba(${baseColor}, ${opacity})`,
            }}
          />
        );
      })}
    </div>
  );
}
