import { ProgressBar } from "@/components/shared/progress-bar";

interface PlanProgressProps {
  percentage: number;
}

export function PlanProgress({ percentage }: PlanProgressProps) {
  const normalizedPercentage = Math.max(0, Math.min(100, Math.round(percentage)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>Progress</span>
        <span>{normalizedPercentage}%</span>
      </div>
      <ProgressBar percentage={normalizedPercentage} />
    </div>
  );
}
