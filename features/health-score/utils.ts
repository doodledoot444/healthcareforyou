export function toPercentage(score: number, maxScore = 5): number {
  if (maxScore <= 0) return 0;
  return Math.round((score / maxScore) * 100);
}

/** Clamps a value between 0 and max, returns a rounded integer. */
export function clampScore(value: number, max: number): number {
  return Math.round(Math.min(Math.max(value, 0), max));
}
