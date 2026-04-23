"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useDashboardData } from "@/providers/dashboard-data-provider";

function isTodayUtc(dateString: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return dateString.slice(0, 10) === today;
}

interface Mission {
  id: string;
  label: string;
  description: string;
  href: string;
  done: boolean;
  cta: string;
  doneCopy: string;
}

function buildMotivationalCopy(score: number): string {
  if (score === 3) return "Perfect day. Every mission complete — momentum is yours.";
  if (score === 2) return "Two down, one to go. Keep the streak alive.";
  if (score === 1) return "Good start. Two more missions waiting for you today.";
  return "Your day starts here. Complete all three missions to close the loop.";
}

export function DailyMissionFlow() {
  const {
    latestMoodEntry,
    isMoodLoading,
    journalEntries,
    isJournalLoading,
    activePlan,
    isPlansLoading,
  } = useDashboardData();

  const isLoading = isMoodLoading || isJournalLoading || isPlansLoading;

  const missions: Mission[] = useMemo(() => {
    const moodDone =
      latestMoodEntry !== null && isTodayUtc(latestMoodEntry.entryDate);

    const journalDone =
      journalEntries.length > 0 && isTodayUtc(journalEntries[0].createdAt);

    const planDone =
      activePlan !== null && activePlan.progressPercentage > 0;

    return [
      {
        id: "mood",
        label: "Log your mood",
        description: moodDone
          ? `Checked in with ${latestMoodEntry?.score ?? 0}/5 today.`
          : "How are you feeling right now? Takes 10 seconds.",
        href: "/dashboard",
        done: moodDone,
        cta: "Check in",
        doneCopy: "Done for today",
      },
      {
        id: "journal",
        label: "Write a reflection",
        description: journalDone
          ? "Today's reflection is saved."
          : "Capture one thought, win, or observation from your day.",
        href: "/dashboard/journal",
        done: journalDone,
        cta: "Open journal",
        doneCopy: "Reflected today",
      },
      {
        id: "plan",
        label: "Progress your plan",
        description:
          activePlan !== null
            ? planDone
              ? `${activePlan.title} is at ${activePlan.progressPercentage}% — keep going.`
              : `${activePlan.title} has open habits waiting.`
            : "No plan yet. Set one to start tracking real progress.",
        href: "/dashboard/progress",
        done: planDone,
        cta: activePlan ? "Open plan" : "Create plan",
        doneCopy: "Progress recorded",
      },
    ];
  }, [latestMoodEntry, journalEntries, activePlan]);

  const completedCount = missions.filter((m) => m.done).length;
  const completionPercent = Math.round((completedCount / missions.length) * 100);
  const nextMission = missions.find((m) => !m.done) ?? null;

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Calculating today&apos;s missions…</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Today&apos;s Missions</h2>
          <p className="mt-1 text-sm text-slate-600">{buildMotivationalCopy(completedCount)}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900">{completedCount}/{missions.length}</p>
          <p className="text-xs text-slate-500">missions complete</p>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-700"
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      {nextMission ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Up next</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{nextMission.label}</p>
          <p className="mt-0.5 text-sm text-slate-600">{nextMission.description}</p>
          <Link
            href={nextMission.href}
            className="mt-3 inline-flex rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
          >
            {nextMission.cta}
          </Link>
        </div>
      ) : null}

      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {missions.map((mission) => (
          <li
            key={mission.id}
            className={`rounded-xl border p-3 transition ${
              mission.done
                ? "border-emerald-200 bg-emerald-50"
                : "border-slate-200 bg-slate-50 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                  mission.done
                    ? "bg-emerald-500 text-white"
                    : "border border-slate-300 bg-white text-slate-400"
                }`}
              >
                {mission.done ? "✓" : "·"}
              </span>
              <p className="text-sm font-semibold text-slate-900">{mission.label}</p>
            </div>
            <p className="mt-1 text-xs text-slate-600">{mission.description}</p>
            {!mission.done ? (
              <Link
                href={mission.href}
                className="mt-2 inline-flex text-xs font-semibold text-emerald-700 transition hover:text-emerald-600"
              >
                {mission.cta} →
              </Link>
            ) : (
              <p className="mt-2 text-xs font-medium text-emerald-700">{mission.doneCopy}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
