"use client";

interface ContributionBarProps {
  score: number; // 0–100
  segments?: number; // default 16
}

export function ContributionBar({ score, segments = 16 }: ContributionBarProps) {
  const filledSegments = Math.round((score / 100) * segments);

  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: segments }).map((_, i) => {
        const isFilled = i < filledSegments;
        return (
          <div
            key={i}
            className={`h-[12px] w-[4px] rounded-[2px] transition-colors ${
              isFilled
                ? "bg-white/70 shadow-[0_0_4px_rgba(255,255,255,0.15)]"
                : "bg-white/[0.08]"
            }`}
          />
        );
      })}
    </div>
  );
}
