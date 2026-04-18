export function addUtcDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

export function isConsecutiveUtcDate(previousDate: Date, currentDate: Date): boolean {
  return addUtcDays(previousDate, 1).toISOString().slice(0, 10) === currentDate.toISOString().slice(0, 10);
}

export function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
