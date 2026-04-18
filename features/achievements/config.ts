export const ACHIEVEMENT_RULES = [
  {
    id: "first-check-in",
    title: "First Check-In",
    description: "Logged your first mood entry.",
    threshold: 1,
  },
  {
    id: "steady-week",
    title: "Steady Week",
    description: "Maintained 7 mood entries.",
    threshold: 7,
  },
  {
    id: "mindful-month",
    title: "Mindful Month",
    description: "Maintained 30 mood entries.",
    threshold: 30,
  },
] as const;
