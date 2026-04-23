"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { SidebarContainer } from "@/components/layout/sidebar-container";
import { useSidebarStore } from "@/lib/sidebar-store";

interface DashboardShellProps {
  children: ReactNode;
  userName: string;
}

export function DashboardShell({ children, userName }: DashboardShellProps) {
  const pathname = usePathname();
  const currentPath = pathname ?? "/dashboard";
  const isOpen = useSidebarStore((state) => state.isOpen);
  const setOpen = useSidebarStore((state) => state.setOpen);

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
            onClick={() => setOpen(true)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50"
            aria-label="Open dashboard navigation"
            aria-expanded={isOpen}
          >
            Menu
          </button>
        </header>

        <MobileDrawer userName={userName} />

        <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)]">
          <SidebarContainer pathname={currentPath} userName={userName} />

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
