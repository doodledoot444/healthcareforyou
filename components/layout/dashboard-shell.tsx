import type { ReactNode } from "react";
import Link from "next/link";

const dashboardLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/progress", label: "Progress" },
  { href: "/dashboard/achievements", label: "Achievements" },
  { href: "/dashboard/profile", label: "Profile" },
];

interface DashboardShellProps {
  children: ReactNode;
  userName: string;
}

export function DashboardShell({ children, userName }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-cyan-50 to-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 md:px-6 md:py-6">
        <aside className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm md:sticky md:top-6 md:h-fit md:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Joyful Health Tracker</p>
          <p className="mt-2 text-sm text-slate-600">Hello, {userName}</p>
          <nav className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-1">
            {dashboardLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 md:text-left"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="space-y-4">
          <header className="rounded-2xl border border-cyan-100 bg-white/90 p-4 shadow-sm">
            <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">Track your mood patterns, progress, and milestones in one place.</p>
          </header>
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
