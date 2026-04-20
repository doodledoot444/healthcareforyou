import { MoodChart } from "@/components/mood/mood-chart";
import { getRecentMoods } from "@/features/mood/queries";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardProgressPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const moods = await getRecentMoods(currentUser.id, 60);

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Progress Tracking</h2>
        <p className="mt-1 text-sm text-slate-600">Monitor your mood trend across the last 60 days.</p>
      </header>
      <MoodChart entries={moods} />
    </section>
  );
}
