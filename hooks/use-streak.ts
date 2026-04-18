"use client";

import { useEffect, useState } from "react";
import type { MoodStreakSnapshot } from "@/features/mood/types";

export function useStreak() {
  const [streak, setStreak] = useState<MoodStreakSnapshot>({
    currentStreak: 0,
    longestStreak: 0,
    lastEntryDate: null,
  });

  useEffect(() => {
    fetch("/api/streak")
      .then((response) => response.json())
      .then((result: { data: MoodStreakSnapshot }) => setStreak(result.data));
  }, []);

  return streak;
}
