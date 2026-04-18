export function toPercentage(score: number, maxScore = 5): number {
  if (maxScore <= 0) return 0;
  return Math.round((score / maxScore) * 100);
}
