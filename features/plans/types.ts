export type PlanCategory = "Reading" | "Self Improvement" | "Mindfulness";

export type PlanLevel = "Starter" | "Builder" | "Focused" | "Advanced";

export interface Plan {
  id: string;
  title: string;
  category: PlanCategory;
  description: string;
  level: PlanLevel;
  progressPercentage: number;
}

export interface PlansSnapshot {
  activePlan: Plan | null;
  plans: Plan[];
}
