export const MOOD_OPTIONS = [
  { value: 1, label: "Very Low" },
  { value: 2, label: "Low" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Good" },
  { value: 5, label: "Great" },
] as const;

export const TRACKING_WINDOW_DAYS = 60;

export const MOOD_SCORE_MIN = 1;
export const MOOD_SCORE_MAX = 5;

// Replace this fallback when real auth session identity is integrated.
export const DEFAULT_DEMO_USER_ID = "demo-user";
