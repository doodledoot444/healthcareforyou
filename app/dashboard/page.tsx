import { DashboardDataProvider } from "@/providers/dashboard-data-provider";
import { DailyMissionFlow } from "@/components/dashboard/daily-mission-flow";
import { DailyNudge } from "@/components/dashboard/daily-nudge";
import { HabitInsightsWidget } from "@/components/dashboard/habit-insights-widget";
import { HabitRecommendationCard } from "@/components/dashboard/habit-recommendation-card";
import { HabitStreakCard } from "@/components/dashboard/habit-streak-card";
import { MoodContextualBanner } from "@/components/dashboard/mood-contextual-banner";
import { MoodTrendIntelligence } from "@/components/dashboard/mood-trend-intelligence";
import { HabitCorrelationBoard } from "@/components/dashboard/habit-correlation-board";
import { WeeklyWellnessDigest } from "@/components/dashboard/weekly-wellness-digest";
import { WeeklyWellnessReport } from "@/components/dashboard/weekly-wellness-report";
import { GoalProgressCard } from "@/components/dashboard/goal-progress-card";
import { WellnessChecklist } from "@/components/dashboard/wellness-checklist";
import { ExplorePreview } from "@/components/overview/explore-preview";
import { JournalPreview } from "@/components/overview/journal-preview";
import { MoodOverview } from "@/components/overview/mood-overview";
import { ProgressPreview } from "@/components/overview/progress-preview";

export default function DashboardPage() {
  return (
    <DashboardDataProvider>
      <div className="space-y-4">
        {/* Contextual recommendation — adapts to current mood and pattern signals */}
        <MoodContextualBanner />

        {/* Time-aware daily nudge — updates every hour */}
        <DailyNudge />

        {/* Adaptive daily mission flow — drives the day's priority order */}
        <DailyMissionFlow />

        {/* Daily wellness checklist — adaptive task list */}
        <WellnessChecklist />

        {/* Two-column: weekly digest + mood deep-dive */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <WeeklyWellnessDigest />
          <MoodOverview />
        </div>

        {/* Longitudinal mood pattern analysis */}
        <MoodTrendIntelligence />

        {/* Habit correlation — mood-aware prioritisation of incomplete habits */}
        <HabitCorrelationBoard />

        {/* Habit recommendations — suggested next actions based on mood lift */}
        <HabitRecommendationCard />

        {/* Habit streak & milestone badges */}
        <HabitStreakCard />

        {/* Personalized wellness goals */}
        <GoalProgressCard />

        {/* Two-column: habit insights + weekly wellness report */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <HabitInsightsWidget />
          <WeeklyWellnessReport />
        </div>

        {/* Supporting previews */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ProgressPreview />
          <JournalPreview />
          <ExplorePreview />
        </div>
      </div>
    </DashboardDataProvider>
  );
}
