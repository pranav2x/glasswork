interface ContributionBarProps {
  score: number;
  segments?: number;
}

export function ContributionBar({ score, segments = 16 }: ContributionBarProps) {
  const filled = Math.round((score / 100) * segments);

  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={`h-2.5 w-1.5 rounded-sm transition-opacity ${
            i < filled ? "bg-current opacity-70" : "bg-warm-200"
          }`}
        />
      ))}
    </div>
  );
}
