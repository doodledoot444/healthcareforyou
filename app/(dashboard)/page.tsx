import { MoodSelector } from "@/components/mood/mood-selector";
import { MoodCard } from "@/components/mood/mood-card";
import { getLatestMoodEntry, getMoodStreakSnapshot, getRecentMoods } from "@/features/mood/queries";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardHomePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const userId = currentUser.id;
  const [recentMoods, latestMood, streak] = await Promise.all([
    getRecentMoods(userId, 7),
    getLatestMoodEntry(userId),
    getMoodStreakSnapshot(userId),
  ]);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-zinc-900">Daily Check-In</h1>
        <p className="mt-2 text-zinc-600">Record how you feel today to keep your streak alive.</p>
      </header>
      <div className="rounded-xl border border-teal-100 bg-teal-50 p-4">
        <p className="text-sm text-teal-800">Current streak: {streak.currentStreak} days</p>
        <p className="text-xs text-teal-700">Longest streak: {streak.longestStreak} days</p>
      </div>
      <MoodSelector />
      {latestMood ? <MoodCard entry={latestMood} /> : null}
      {!latestMood && recentMoods.length === 0 ? (
        <p className="text-sm text-zinc-600">No entries yet. Submit your first mood to start a streak.</p>
      ) : null}
    </section>
  );
}
