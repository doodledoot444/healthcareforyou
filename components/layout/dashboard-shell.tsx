"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

const dashboardLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/explore", label: "Explore" },
  { href: "/dashboard/stories", label: "Stories" },
  { href: "/dashboard/progress", label: "Progress" },
  { href: "/dashboard/achievements", label: "Achievements" },
  { href: "/dashboard/journal", label: "Journal" },
  { href: "/dashboard/profile", label: "Profile" },
];

interface DashboardShellProps {
  children: ReactNode;
  userName: string;
}

export function DashboardShell({ children, userName }: DashboardShellProps) {
  const pathname = usePathname();
  const currentPath = pathname ?? "/dashboard";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return currentPath === href;
    }

    return currentPath.startsWith(href);
  };

  const closeMobileNav = () => {
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-cyan-50 to-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 md:px-6 md:py-6">
        <header className="mb-4 flex items-center justify-between rounded-2xl border border-cyan-100 bg-white/90 px-4 py-3 shadow-sm md:hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Joyful Health Tracker</p>
            <p className="mt-1 text-xs text-slate-600">Hello, {userName}</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50"
            aria-label="Open dashboard navigation"
            aria-expanded={mobileNavOpen}
          >
            Menu
          </button>
        </header>

        <AnimatePresence>
          {mobileNavOpen ? (
            <div className="md:hidden">
              <motion.button
                type="button"
                onClick={closeMobileNav}
                className="fixed inset-0 z-40 bg-slate-900/35"
                aria-label="Close dashboard navigation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.aside
                className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-emerald-100 bg-white p-5 shadow-xl"
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Joyful Health Tracker</p>
                    <p className="mt-2 text-sm text-slate-600">Hello, {userName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeMobileNav}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-600"
                    aria-label="Close navigation"
                  >
                    Close
                  </button>
                </div>
                <nav className="mt-5 grid gap-2">
                  {dashboardLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMobileNav}
                      className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                        isActive(link.href)
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </motion.aside>
            </div>
          ) : null}
        </AnimatePresence>

        <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-sm md:sticky md:top-6 md:block md:h-[calc(100vh-3rem)] md:overflow-auto">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Joyful Health Tracker</p>
            <p className="mt-2 text-sm text-slate-600">Hello, {userName}</p>
            <nav className="mt-5 grid gap-2">
              {dashboardLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    isActive(link.href)
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"
                  }`}
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
            <AnimatePresence mode="wait" initial={false}>
              <motion.main
                key={currentPath}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {children}
              </motion.main>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
