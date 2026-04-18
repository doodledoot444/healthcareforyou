export function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
