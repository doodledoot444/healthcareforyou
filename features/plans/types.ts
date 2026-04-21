export type PlanCategory = "Reading" | "Self Improvement" | "Mindfulness";

export type PlanLevel = "Starter" | "Builder" | "Focused" | "Advanced";

export interface PlanItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface Plan {
  id: string;
  title: string;
  category: PlanCategory;
  description: string;
  level: PlanLevel;
  progressPercentage: number;
  items: PlanItem[];
}

export interface PlansSnapshot {
  activePlan: Plan | null;
  plans: Plan[];
}
