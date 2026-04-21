interface ProgressBarProps {
  percentage: number;
  barClassName?: string;
}

export function ProgressBar({ percentage, barClassName }: ProgressBarProps) {
  const normalizedPercentage = Math.max(0, Math.min(100, Math.round(percentage)));

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200" role="presentation">
      <div
        className={barClassName ?? "h-full rounded-full bg-emerald-500 transition-[width] duration-500"}
        style={{ width: `${normalizedPercentage}%` }}
      />
    </div>
  );
}
