import { GlassPanel } from "@/components/GlassPanel";
import { Skeleton } from "@/components/ui/skeleton";

export function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <GlassPanel key={i} className="flex flex-col gap-5 p-6">
          {/* Avatar + name skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-white/[0.06]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-28 rounded bg-white/[0.06]" />
              <Skeleton className="h-3 w-36 rounded bg-white/[0.04]" />
            </div>
          </div>

          {/* Stats pills skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full bg-white/[0.06]" />
            <Skeleton className="h-5 w-16 rounded-full bg-white/[0.04]" />
          </div>

          {/* Score skeleton */}
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <Skeleton className="h-10 w-16 rounded bg-white/[0.06]" />
              <Skeleton className="h-3 w-20 rounded bg-white/[0.04]" />
            </div>
            {/* Heatmap skeleton */}
            <div className="flex items-end gap-[3px]">
              {Array.from({ length: 12 }).map((_, j) => (
                <Skeleton
                  key={j}
                  className="w-[7px] rounded-sm bg-white/[0.04]"
                  style={{ height: `${14 + (j % 4) * 3}px` }}
                />
              ))}
            </div>
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}
