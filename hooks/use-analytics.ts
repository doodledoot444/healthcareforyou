"use client";

import { useEffect, useState } from "react";
import type { MoodAnalytics } from "@/features/analytics/types";

export function useAnalytics() {
  const [data, setData] = useState<MoodAnalytics | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((response) => response.json())
      .then((result: { data: MoodAnalytics }) => setData(result.data));
  }, []);

  return data;
}
    